import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { canManage, slotDates, londonDay } from "@/lib/availability";
import { getAvailability } from "@/lib/booking";
import { fail, requireOrigin, rateLimit } from "@/lib/http";
import { sendEmail } from "@/lib/email";
import { getSetting } from "@/lib/settings";
type Context = { params: Promise<{ token: string }> };
export async function GET(r: Request, { params }: Context) {
  try {
    const { token } = await params;
    const b = await db.booking.findUnique({
      where: { token },
      include: { items: true },
    });
    if (!b || b.status !== "CONFIRMED")
      throw new Error("Booking not available.");
    return NextResponse.json(
      await getAvailability(
        b.branchId,
        b.items.map((i) => i.serviceId),
        b.staffId,
        new URL(r.url).searchParams.get("date") || "",
        [],
        {
          excludeId: b.id,
          durationOverride: (b.end.getTime() - b.start.getTime()) / 60000,
        },
      ),
    );
  } catch (e) {
    return fail(e);
  }
}
export async function PATCH(r: Request, { params }: Context) {
  try {
    await requireOrigin(r);
    await rateLimit("manage", 12);
    const { token } = await params;
    const v = z
      .object({
        action: z.enum(["cancel", "reschedule"]),
        start: z.string().datetime().optional(),
      })
      .parse(await r.json());
    const b = await db.booking.findUnique({
      where: { token },
      include: { items: true, client: true },
    });
    if (!b || b.status !== "CONFIRMED")
      throw new Error("This booking cannot be changed.");
    const rules = await getSetting("bookingRules");
    if (!canManage(b.start, new Date(), rules.cancellationHours))
      throw new Error(
        `Please call the salon for changes within ${rules.cancellationHours} hours.`,
      );
    if (v.action === "cancel") {
      await db.$transaction(async (tx) => {
        const result = await tx.booking.updateMany({
          where: { id: b.id, status: "CONFIRMED" },
          data: { status: "CANCELLED" },
        });
        if (!result.count) throw new Error("Booking already changed.");
        await tx.bookingSlot.deleteMany({ where: { bookingId: b.id } });
        if (b.voucherCode && b.voucherAmount)
          await tx.voucher.update({
            where: { code: b.voucherCode },
            data: { balance: { increment: b.voucherAmount } },
          });
      });
    } else {
      if (!v.start) throw new Error("Choose a new time.");
      const start = new Date(v.start);
      if (!canManage(start, new Date(), rules.cancellationHours))
        throw new Error(
          `Please choose a time at least ${rules.cancellationHours} hours away.`,
        );
      const duration = (b.end.getTime() - b.start.getTime()) / 60000;
      const available = await getAvailability(
        b.branchId,
        b.items.map((i) => i.serviceId),
        b.staffId,
        londonDay(start),
        [],
        { excludeId: b.id, durationOverride: duration },
      );
      if (!available.some((s) => s.start === v.start))
        throw new Error("This time is unavailable.");
      const end = new Date(start.getTime() + duration * 60000);
      await db.$transaction(
        async (tx) => {
          const result = await tx.booking.updateMany({
            where: { id: b.id, status: "CONFIRMED", start: b.start },
            data: { start, end, reminderSent: false },
          });
          if (!result.count)
            throw new Error("This booking changed. Please refresh.");
          await tx.bookingSlot.deleteMany({ where: { bookingId: b.id } });
          await tx.bookingSlot.createMany({
            data: slotDates(start, end).map((start) => ({
              bookingId: b.id,
              staffId: b.staffId,
              start,
            })),
          });
        },
        { isolationLevel: "Serializable" },
      );
    }
    try {
      await sendEmail(
        b.client.email,
        v.action === "cancel"
          ? "Your Luxe appointment is cancelled"
          : "Your Luxe appointment has a new time",
        v.action === "cancel"
          ? "Your reserved time has been released. Gift voucher credit was returned. Contact the salon about paid deposits."
          : `Your new appointment is ${new Date(v.start!).toLocaleString("en-GB", { timeZone: "Europe/London" })}.`,
      );
    } catch {
      console.error("Booking change email could not be delivered", b.id);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
