import { test, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../lib/db";
import { getAvailability, createBooking } from "../lib/booking";
import { londonDay } from "../lib/availability";
import { saveEntity, deleteEntity } from "../lib/admin";
const email = `integration-${Date.now()}@example.com`;
test("admin-created staff can be assigned a service and receive appointments", async () => {
  const id = `qa-staff-${Date.now()}`;
  try {
    await saveEntity("staff", {
      id,
      name: "QA Specialist",
      role: "Stylist",
      bio: "Integration test",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
      branchId: "mayfair",
    });
    let day = new Date(Date.now() + 11 * 86400000);
    while (day.getUTCDay() === 0) day = new Date(day.getTime() + 86400000);
    const weekday = day.getUTCDay();
    await saveEntity("schedules", {
      staffId: id,
      weekday,
      startMinute: 540,
      endMinute: 1080,
    });
    const date = londonDay(day);
    assert.deepEqual(
      await getAvailability("mayfair", ["signature-cut-finish"], id, date),
      [],
    );
    await saveEntity("assignments", {
      staffId: id,
      serviceId: "signature-cut-finish",
    });
    assert.ok(
      (await getAvailability("mayfair", ["signature-cut-finish"], id, date))
        .length > 0,
    );
    await deleteEntity("assignments", id + "|signature-cut-finish");
    assert.deepEqual(
      await getAvailability("mayfair", ["signature-cut-finish"], id, date),
      [],
    );
  } finally {
    await db.staff.deleteMany({ where: { id } });
  }
});
after(async () => {
  const client = await db.client.findUnique({ where: { email } });
  if (client) {
    await db.bookingItem.deleteMany({
      where: { booking: { clientId: client.id } },
    });
    await db.booking.deleteMany({ where: { clientId: client.id } });
    await db.client.delete({ where: { id: client.id } });
  }
  await db.$disconnect();
});
test("availability honors closing times, leave, and prevents concurrent double booking", async () => {
  let day = new Date(Date.now() + 7 * 86400000);
  while (day.getUTCDay() === 0) day = new Date(day.getTime() + 86400000);
  const date = londonDay(day);
  const available = await getAvailability(
    "mayfair",
    ["signature-cut-finish"],
    "amelia",
    date,
    ["scalp-massage"],
  );
  assert.ok(available.length > 0);
  assert.ok(available.every((s) => Number(s.time.slice(0, 2)) < 18));
  const input = {
    name: "Integration Client",
    email,
    phone: "07700900000",
    branchId: "mayfair",
    serviceIds: ["signature-cut-finish"],
    addOnIds: ["scalp-massage"],
    staffId: "amelia",
    start: available[0].start,
  };
  const results = await Promise.allSettled([
    createBooking(input),
    createBooking(input),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  const booking = await db.booking.findFirstOrThrow({
    where: { client: { email } },
  });
  assert.equal((booking.end.getTime() - booking.start.getTime()) / 60000, 90);
  const refreshed = await getAvailability(
    "mayfair",
    input.serviceIds,
    "amelia",
    date,
  );
  assert.ok(!refreshed.some((s) => s.start === input.start));
  const off = await db.timeOff.create({
    data: {
      staffId: "sophia",
      start: new Date(`${date}T00:00:00Z`),
      end: new Date(`${date}T23:59:59Z`),
    },
  });
  try {
    assert.deepEqual(
      await getAvailability("mayfair", input.serviceIds, "sophia", date),
      [],
    );
  } finally {
    await db.timeOff.delete({ where: { id: off.id } });
  }
  const own = await getAvailability(
    "mayfair",
    input.serviceIds,
    "amelia",
    date,
    [],
    { excludeId: booking.id, durationOverride: 90 },
  );
  assert.ok(own.some((s) => s.start === input.start));
});
test("invalid coupons and cross-branch specialist selection are rejected", async () => {
  let day = new Date(Date.now() + 8 * 86400000);
  while (day.getUTCDay() === 0) day = new Date(day.getTime() + 86400000);
  const date = londonDay(day);
  assert.deepEqual(
    await getAvailability("chelsea", ["signature-cut-finish"], "amelia", date),
    [],
  );
  const slots = await getAvailability(
    "mayfair",
    ["signature-cut-finish"],
    "sophia",
    date,
  );
  assert.ok(slots.length);
  await assert.rejects(
    () =>
      createBooking({
        name: "Integration Client",
        email,
        phone: "07700900000",
        branchId: "mayfair",
        serviceIds: ["signature-cut-finish"],
        addOnIds: [],
        staffId: "sophia",
        start: slots[0].start,
        coupon: "FAKE",
      }),
    /invalid or has expired/,
  );
});
