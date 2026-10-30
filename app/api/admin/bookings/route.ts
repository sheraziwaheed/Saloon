import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/access";
import { db } from "@/lib/db";
import { fail, requireOrigin } from "@/lib/http";
import { slotDates, londonDay } from "@/lib/availability";
import { getAvailability } from "@/lib/booking";
export async function PATCH(r: Request) {
  try {
    await requireOrigin(r);
    const u = await requireAdmin();
    const v = z
      .object({
        id: z.string(),
        status: z
          .enum(["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"])
          .optional(),
        start: z.string().datetime().optional(),
      })
      .parse(await r.json());
    const b = await db.booking.findUnique({
      where: { id: v.id },
      include: { client: true, items: true },
    });
    if (!b || (u.role === "STYLIST" && u.staffId !== b.staffId))
      throw new Error("Booking access denied.");
    if (b.status !== "CONFIRMED")
      throw new Error("This booking has already been closed.");
    if (v.start) {
      const start = new Date(v.start),
        duration = (b.end.getTime() - b.start.getTime()) / 60000,
        end = new Date(start.getTime() + duration * 60000);
      const available = await getAvailability(
        b.branchId,
        b.items.map((i) => i.serviceId),
        b.staffId,
        londonDay(start),
        [],
        { excludeId: b.id, durationOverride: duration },
      );
      if (!available.some((s) => s.start === v.start))
        throw new Error(
          "This time is outside working hours, on leave, or already booked.",
        );
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
    } else if (v.status) {
      const status = v.status;
      await db.$transaction(async (tx) => {
        const result = await tx.booking.updateMany({
          where: { id: b.id, status: "CONFIRMED" },
          data: { status },
        });
        if (!result.count) throw new Error("Booking already changed.");
        if (["CANCELLED", "NO_SHOW"].includes(status))
          await tx.bookingSlot.deleteMany({ where: { bookingId: b.id } });
        if (status === "CANCELLED" && b.voucherCode && b.voucherAmount)
          await tx.voucher.update({
            where: { code: b.voucherCode },
            data: { balance: { increment: b.voucherAmount } },
          });
        if (status === "COMPLETED")
          await tx.loyaltyTransaction.upsert({
            where: { bookingId: b.id },
            update: {},
            create: {
              email: b.client.email,
              bookingId: b.id,
              points: Math.floor((b.total + b.voucherAmount) / 100),
              description: "Your completed Luxe moment",
            },
          });
      });
    } else throw new Error("Choose an update.");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
