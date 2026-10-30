import { test } from "node:test";
import assert from "node:assert/strict";
import { validOrigin } from "../lib/origin";
import {
  overlaps,
  slotMinutes,
  canManage,
  londonDate,
} from "../lib/availability";
test("origin checks use public Host rather than framework internal hostname", () => {
  assert.equal(
    validOrigin(
      "http://127.0.0.1:3000",
      "http://localhost:3000/api/bookings",
      "127.0.0.1:3000",
    ),
    true,
  );
  assert.equal(
    validOrigin(
      "https://attacker.example",
      "http://localhost:3000/api/bookings",
      "salon.example",
    ),
    false,
  );
  assert.equal(
    validOrigin(
      "https://salon.example",
      "http://localhost:3000/api/bookings",
      "salon.example",
    ),
    true,
  );
});
test("overlap includes treatment buffer and excludes adjacent boundary", () => {
  assert.equal(overlaps(600, 675, 660, 720), true);
  assert.equal(overlaps(600, 675, 675, 735), false);
});
test("slots fit full appointment before closing", () => {
  assert.deepEqual(slotMinutes(540, 630, 60), [540, 555, 570]);
  assert.deepEqual(slotMinutes(540, 570, 60), []);
});
test("cancellation requires at least 24 hours", () => {
  const now = new Date("2026-10-30T12:00:00Z");
  assert.equal(canManage(new Date("2026-10-31T12:00:00Z"), now), true);
  assert.equal(canManage(new Date("2026-10-31T11:59:00Z"), now), false);
});
test("salon times observe London winter and summer offsets", () => {
  assert.equal(
    londonDate("2026-12-01", 600).toISOString(),
    "2026-12-01T10:00:00.000Z",
  );
  assert.equal(
    londonDate("2026-07-01", 600).toISOString(),
    "2026-07-01T09:00:00.000Z",
  );
});
