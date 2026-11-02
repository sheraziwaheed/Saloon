import assert from "node:assert/strict";
import test from "node:test";
import { buildLeadFormUrl } from "../lib/leads";

test("placeholder does not load or submit to a fictitious form", () => {
  assert.equal(buildLeadFormUrl({ requestType: "appointment" }), null);
});

test("Jotform receives encoded inquiry context without losing existing parameters", () => {
  const result = buildLeadFormUrl(
    { requestType: "product", products: "Oil & Balm × 2", branch: "Chelsea" },
    "https://form.jotform.com/123456789012345?theme=classic",
  );
  assert.ok(result);
  const url = new URL(result);
  assert.equal(url.origin, "https://form.jotform.com");
  assert.equal(url.searchParams.get("theme"), "classic");
  assert.equal(url.searchParams.get("requestType"), "product");
  assert.equal(url.searchParams.get("products"), "Oil & Balm × 2");
  assert.equal(url.searchParams.get("branch"), "Chelsea");
});

test("invalid and non-Jotform destinations stay unavailable", () => {
  for (const url of [
    "",
    "bad url",
    "javascript:alert(1)",
    "http://form.jotform.com/123",
    "https://example.com/123",
  ]) {
    assert.equal(buildLeadFormUrl({}, url), null);
  }
});
