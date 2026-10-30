import { test } from "node:test";
import assert from "node:assert/strict";
import { rulesSchema, renderTemplate, settingSchemas } from "../lib/settings";
import { safeJson } from "../lib/json";
import { getSetting } from "../lib/settings";
import { envSchema } from "../lib/validation";

test("settings use defaults when the database is unavailable", async () => {
  const unavailable = async () => {
    throw new Error("Database unavailable");
  };
  assert.deepEqual(
    await getSetting("bookingRules", unavailable),
    rulesSchema.parse({}),
  );
  assert.deepEqual(await getSetting("business", unavailable), {});
});
test("invalid stored settings fall back to validated defaults", async () => {
  assert.deepEqual(
    await getSetting("bookingRules", async () => ({
      value: '{"horizonDays":-1}',
    })),
    rulesSchema.parse({}),
  );
});
test("valid stored settings still override defaults", async () => {
  assert.equal(
    (
      await getSetting("bookingRules", async () => ({
        value: '{"horizonDays":60}',
      }))
    ).horizonDays,
    60,
  );
});
test("environment accepts PostgreSQL URLs and rejects legacy SQLite configuration", () => {
  assert.equal(
    envSchema.safeParse({
      DATABASE_URL: "postgresql://user:password@localhost:5432/salon",
    }).success,
    true,
  );
  assert.equal(
    envSchema.safeParse({ DATABASE_URL: "file:./dev.db" }).success,
    false,
  );
  assert.equal(envSchema.parse({}).DATABASE_URL, undefined);
});
test("booking settings have validated defaults and reject unsafe bounds", () => {
  assert.deepEqual(rulesSchema.parse({}), {
    leadMinutes: 60,
    horizonDays: 120,
    cancellationHours: 24,
    depositPence: 2000,
  });
  assert.equal(rulesSchema.safeParse({ horizonDays: -1 }).success, false);
  assert.equal(
    settingSchemas.business.safeParse({ email: "not an email" }).success,
    false,
  );
});
test("email placeholders render without executing content", () => {
  assert.equal(
    renderTemplate("Hello {name}, see {link}", {
      name: "Alex",
      link: "https://salon.example",
    }),
    "Hello Alex, see https://salon.example",
  );
});
test("structured data cannot close its containing script element", () => {
  const json = safeJson({ name: "</script><script>alert(1)</script>" });
  assert.ok(!json.includes("<"));
  assert.deepEqual(JSON.parse(json), {
    name: "</script><script>alert(1)</script>",
  });
});
