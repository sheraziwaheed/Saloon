import { db } from "./db";
import { londonDate, slotMinutes, slotDates } from "./availability";
import { z } from "zod";
import { bookingSchema } from "./validation";
import { randomBytes } from "node:crypto";
import { getSetting } from "./settings";
export async function getAvailability(
  branchId: string,
  serviceIds: string[],
  staffId: string,
  day: string,
  addOnIds: string[] = [],
  options: { excludeId?: string; durationOverride?: number } = {},
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Choose a valid date.");
  const date = londonDate(day, 0);
  const rules = await getSetting("bookingRules");
  if (
    Number.isNaN(date.getTime()) ||
    date.getTime() > Date.now() + rules.horizonDays * 86400000
  )
    throw new Error(
      `Please choose a date within the next ${rules.horizonDays} days.`,
    );
  const selected = await db.service.findMany({
    where: { id: { in: serviceIds }, active: true },
  });
  if (!selected.length || selected.length !== new Set(serviceIds).size)
    throw new Error("Choose valid services.");
  const addOns = await db.addOn.findMany({ where: { id: { in: addOnIds } } });
  if (addOns.length !== new Set(addOnIds).size)
    throw new Error("Choose valid add-ons.");
  const duration =
    options.durationOverride ??
    selected.reduce((n, s) => n + s.duration + s.buffer, 0) +
      addOns.reduce((n, a) => n + a.duration, 0);
  const weekday = new Date(day + "T12:00:00Z").getUTCDay();
  const people = await db.staff.findMany({
    where: {
      branchId,
      ...(staffId !== "any" ? { id: staffId } : {}),
      AND: serviceIds.map((serviceId) => ({
        services: { some: { serviceId } },
      })),
    },
    include: { schedules: { where: { weekday } }, timeOff: true },
  });
  const holidays = await db.setting.findUnique({ where: { key: "holidays" } });
  if (
    holidays &&
    holidays.value
      .split(",")
      .map((s) => s.trim())
      .includes(day)
  )
    return [];
  const result: {
    start: string;
    time: string;
    staffId: string;
    staffName: string;
  }[] = [];
  for (const person of people) {
    const schedule = person.schedules[0];
    if (!schedule) continue;
    const bookings = await db.booking.findMany({
      where: {
        ...(options.excludeId ? { id: { not: options.excludeId } } : {}),
        staffId: person.id,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        start: { lt: londonDate(day, 1440) },
        end: { gt: date },
      },
    });
    for (const minute of slotMinutes(
      schedule.startMinute,
      schedule.endMinute,
      duration,
    )) {
      const start = londonDate(day, minute);
      const end = new Date(start.getTime() + duration * 60000);
      if (start.getTime() < Date.now() + rules.leadMinutes * 60000) continue;
      if (
        bookings.some((b) => start < b.end && end > b.start) ||
        person.timeOff.some((t) => start < t.end && end > t.start)
      )
        continue;
      result.push({
        start: start.toISOString(),
        time: `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`,
        staffId: person.id,
        staffName: person.name,
      });
    }
  }
  return result
    .sort((a, b) => a.start.localeCompare(b.start))
    .filter(
      (v, i, a) =>
        staffId !== "any" || a.findIndex((s) => s.start === v.start) === i,
    );
}
export async function createBooking(input: z.infer<typeof bookingSchema>) {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(input.start));
  const available = await getAvailability(
    input.branchId,
    input.serviceIds,
    input.staffId,
    day,
    input.addOnIds,
  );
  const slot = available.find((s) => s.start === input.start);
  if (!slot)
    throw new Error(
      "That appointment is unavailable. Please choose another time.",
    );
  const selected = await db.service.findMany({
    where: { id: { in: input.serviceIds }, active: true },
  });
  const addOns = await db.addOn.findMany({
    where: { id: { in: input.addOnIds } },
  });
  const duration =
    selected.reduce((n, s) => n + s.duration + s.buffer, 0) +
    addOns.reduce((n, a) => n + a.duration, 0);
  let total =
    selected.reduce((n, s) => n + s.price, 0) +
    addOns.reduce((n, a) => n + a.price, 0);
  if (input.coupon) {
    const coupon = await db.coupon.findUnique({
      where: { code: input.coupon.toUpperCase() },
    });
    if (!coupon || !coupon.active || coupon.expires < new Date())
      throw new Error("This offer code is invalid or has expired.");
    total = Math.round(total * (1 - coupon.percent / 100));
  }
  const start = new Date(slot.start),
    end = new Date(start.getTime() + duration * 60000);
  return db.$transaction(
    async (tx) => {
      if (
        input.coupon?.toUpperCase() === "WELCOME15" &&
        (await tx.booking.count({
          where: {
            client: { email: input.email },
            status: { not: "CANCELLED" },
          },
        }))
      )
        throw new Error("WELCOME15 is reserved for your first visit.");
      let voucherAmount = 0;
      const voucherCode = input.voucher?.trim().toUpperCase();
      if (voucherCode) {
        const v = await tx.voucher.findUnique({ where: { code: voucherCode } });
        if (!v || v.expires < new Date() || v.balance <= 0)
          throw new Error("This gift voucher is invalid, empty or expired.");
        voucherAmount = Math.min(total, v.balance);
        await tx.voucher.update({
          where: { code: voucherCode },
          data: { balance: { decrement: voucherAmount } },
        });
      }
      const client = await tx.client.upsert({
        where: { email: input.email },
        create: { name: input.name, email: input.email, phone: input.phone },
        update: { name: input.name, phone: input.phone },
      });
      return tx.booking.create({
        data: {
          clientId: client.id,
          branchId: input.branchId,
          staffId: slot.staffId,
          start,
          end,
          total: total - voucherAmount,
          voucherCode,
          voucherAmount,
          addOnIds: JSON.stringify(input.addOnIds),
          token: randomBytes(32).toString("hex"),
          notes: [
            input.notes || "",
            ...addOns.map((a) => `Add-on: ${a.name}`),
          ].join("\n"),
          items: {
            create: selected.map((s) => ({ serviceId: s.id, price: s.price })),
          },
          slots: {
            create: slotDates(start, end).map((start) => ({
              staffId: slot.staffId,
              start,
            })),
          },
        },
        include: {
          client: true,
          staff: true,
          branch: true,
          items: { include: { service: true } },
        },
      });
    },
    { isolationLevel: "Serializable", timeout: 10000 },
  );
}
