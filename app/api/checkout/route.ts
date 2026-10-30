import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { email } from "@/lib/validation";
import { stripeClient } from "@/lib/stripe";
import { fail, rateLimit, requireOrigin } from "@/lib/http";
import { site } from "@/config/site";
import { getSetting } from "@/lib/settings";
const schema = z.union([
  z.object({ bookingToken: z.string().regex(/^[a-f0-9]{64}$/) }),
  z.object({
    email,
    items: z
      .array(
        z.object({
          id: z.string().max(100),
          quantity: z.number().int().min(1).max(10),
        }),
      )
      .min(1)
      .max(30),
    coupon: z.string().max(50).optional(),
  }),
]);
export async function POST(r: Request) {
  try {
    await requireOrigin(r);
    await rateLimit("checkout", 8);
    const input = schema.parse(await r.json());
    const stripe = stripeClient();
    const rules = await getSetting("bookingRules");
    const suffix = randomBytes(8)
      .toString("hex")
      .replace(/[0-9]/g, "a")
      .slice(0, 8);
    if ("bookingToken" in input) {
      const b = await db.booking.findUnique({
        where: { token: input.bookingToken },
        include: { client: true },
      });
      if (!b || b.status !== "CONFIRMED" || b.deposit > 0 || b.total <= 0)
        throw new Error("A deposit cannot be taken for this booking.");
      let attempt = b.checkoutAttempt;
      if (b.checkoutSessionId) {
        const prior = await stripe.checkout.sessions.retrieve(
          b.checkoutSessionId,
        );
        if (prior.status === "open" && prior.url)
          return NextResponse.json({ url: prior.url });
        if (prior.status === "complete")
          throw new Error(
            "This deposit checkout is complete. Please refresh after payment confirmation.",
          );
        const updated = await db.booking.updateMany({
          where: { id: b.id, checkoutAttempt: attempt },
          data: { checkoutAttempt: { increment: 1 }, checkoutSessionId: null },
        });
        if (!updated.count)
          throw new Error("Checkout changed. Please try again.");
        attempt++;
      }
      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          customer_email: b.client.email,
          line_items: [
            {
              price_data: {
                currency: "gbp",
                unit_amount: Math.min(rules.depositPence, b.total),
                product_data: { name: "Luxe Salon appointment deposit" },
              },
              quantity: 1,
            },
          ],
          metadata: { bookingId: b.id },
          integration_identifier: `luxe-deposit-${b.id.slice(-8).replace(/[0-9]/g, "a")}`,
          success_url: `${site.url}/booking/manage/${b.token}`,
          cancel_url: `${site.url}/booking/manage/${b.token}`,
        },
        { idempotencyKey: `deposit-${b.id}-${attempt}` },
      );
      await db.booking.update({
        where: { id: b.id },
        data: { checkoutSessionId: session.id },
      });
      return NextResponse.json({ url: session.url });
    }
    const merged = new Map<string, number>();
    for (const i of input.items)
      merged.set(i.id, (merged.get(i.id) || 0) + i.quantity);
    if ([...merged.values()].some((n) => n > 10))
      throw new Error("Maximum 10 of each product per order.");
    const products = await db.product.findMany({
      where: { id: { in: [...merged.keys()] } },
    });
    if (products.length !== merged.size)
      throw new Error("A product is no longer available.");
    for (const p of products)
      if (p.stock < merged.get(p.id)!)
        throw new Error(`${p.name} does not have enough stock.`);
    let percent = 0;
    if (input.coupon) {
      const c = await db.coupon.findUnique({
        where: { code: input.coupon.toUpperCase() },
      });
      if (!c || !c.active || c.expires < new Date())
        throw new Error("This offer code is invalid or has expired.");
      percent = c.percent;
    }
    const lines = products.map((p) => ({
      product: p,
      quantity: merged.get(p.id)!,
      price: Math.round(p.price * (1 - percent / 100)),
    }));
    const total = lines.reduce((n, l) => n + l.price * l.quantity, 0);
    const order = await db.order.create({
      data: {
        email: input.email,
        total,
        items: {
          create: lines.map((l) => ({
            productId: l.product.id,
            quantity: l.quantity,
            price: l.price,
          })),
        },
      },
    });
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: input.email,
        line_items: lines.map((l) => ({
          price_data: {
            currency: "gbp",
            unit_amount: l.price,
            product_data: { name: l.product.name },
          },
          quantity: l.quantity,
        })),
        metadata: { orderId: order.id },
        integration_identifier: `luxe-shop-${suffix}`,
        shipping_address_collection: { allowed_countries: ["GB"] },
        success_url: `${site.url}/checkout?success=1`,
        cancel_url: `${site.url}/checkout?cancelled=1`,
      },
      { idempotencyKey: `order-${order.id}` },
    );
    await db.order.update({
      where: { id: order.id },
      data: { stripeId: session.id },
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return fail(e);
  }
}
