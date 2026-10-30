import { NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";
import { db } from "@/lib/db";
export async function POST(r: Request) {
  let event;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Webhook is not configured" },
      { status: 503 },
    );
  try {
    event = stripeClient().webhooks.constructEvent(
      await r.text(),
      r.headers.get("stripe-signature") || "",
      secret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (
    [
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
    ].includes(event.type)
  ) {
    const session = event.data
      .object as import("stripe").Stripe.Checkout.Session;
    if (session.payment_status === "paid")
      await db.$transaction(
        async (tx) => {
          const seen = await tx.payment.findUnique({
            where: { stripeId: session.id },
          });
          if (seen) return;
          const amount = session.amount_total || 0;
          if (session.metadata?.bookingId) {
            const b = await tx.booking.findUnique({
              where: { id: session.metadata.bookingId },
            });
            if (!b) throw new Error("Booking not found");
            await tx.booking.update({
              where: { id: b.id },
              data: { deposit: { increment: amount } },
            });
            await tx.payment.create({
              data: {
                stripeId: session.id,
                bookingId: b.id,
                amount,
                status: b.status === "CANCELLED" ? "REFUND_REQUIRED" : "PAID",
              },
            });
          } else if (session.metadata?.orderId) {
            const o = await tx.order.findUnique({
              where: { id: session.metadata.orderId },
              include: { items: true },
            });
            if (!o || o.total !== amount)
              throw new Error("Order amount mismatch");
            let stockIssue = false;
            for (const i of o.items) {
              const result = await tx.product.updateMany({
                where: { id: i.productId, stock: { gte: i.quantity } },
                data: { stock: { decrement: i.quantity } },
              });
              if (result.count === 0) stockIssue = true;
            }
            await tx.order.update({
              where: { id: o.id },
              data: { status: stockIssue ? "PAID_REVIEW" : "PAID" },
            });
            await tx.payment.create({
              data: {
                stripeId: session.id,
                amount,
                status: stockIssue ? "STOCK_REVIEW" : "PAID",
              },
            });
          }
        },
        { isolationLevel: "Serializable" },
      );
  }
  if (
    [
      "checkout.session.expired",
      "checkout.session.async_payment_failed",
    ].includes(event.type)
  ) {
    const session = event.data
      .object as import("stripe").Stripe.Checkout.Session;
    if (session.metadata?.orderId)
      await db.order.updateMany({
        where: { id: session.metadata.orderId, status: "PENDING" },
        data: { status: event.type.endsWith("expired") ? "EXPIRED" : "FAILED" },
      });
  }
  return NextResponse.json({ received: true });
}
