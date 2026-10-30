import { test } from "node:test";
import assert from "node:assert/strict";
import { rulesSchema, renderTemplate, settingSchemas } from "../lib/settings";
import { safeJson } from "../lib/json";
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
