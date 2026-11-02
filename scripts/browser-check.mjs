import assert from "node:assert/strict";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const base = process.env.BASE_URL || "http://127.0.0.1:3001";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
const apiRequests = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("request", (request) => {
  if (new URL(request.url()).pathname.startsWith("/api/"))
    apiRequests.push(request.url());
});
await mkdir("test-results", { recursive: true });
try {
  // Every exported HTML page must be reachable on a plain static server.
  const files = await readdir("out", { recursive: true });
  const routes = files
    .filter((file) => file.endsWith("index.html"))
    .map(
      (file) =>
        "/" + path.dirname(file).replaceAll("\\", "/").replace(/^\.$/, ""),
    );
  for (const route of routes) {
    const response = await page.request.get(base + route);
    assert.equal(response.status(), 200, route);
  }
  for (const route of [
    "/account/",
    "/admin/",
    "/api/forms/",
    "/booking/manage/old-token/",
  ]) {
    assert.equal((await page.request.get(base + route)).status(), 404, route);
  }

  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Essential only" }).click();
  assert.equal(await page.locator('a[href="/account"]').count(), 0);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search services, products and journal" })
    .fill("facial");
  await page.locator(".search-results a").first().waitFor();
  await page.locator(".search-results a").first().click();
  await page.waitForURL(/\/services\/[^/]+\/$/);
  assert.match(await page.locator("main h1").innerText(), /facial/i);

  await page.goto(base + "/services/?category=nails", {
    waitUntil: "networkidle",
  });
  assert.equal(
    await page
      .getByRole("button", { name: "Nails & Beauty", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("button", { name: "All services", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "All services", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );

  await page.goto(
    base + "/booking/?service=signature-cut-finish&branch=chelsea",
    { waitUntil: "networkidle" },
  );
  await page
    .getByText("Your request: Signature Cut & Finish · Chelsea")
    .waitFor();
  await page
    .getByText("Our online request form is coming soon.", { exact: false })
    .waitFor();
  assert.equal(await page.locator('iframe[src*="jotform"]').count(), 0);
  assert.equal(await page.locator('button[type="submit"]').count(), 0);
  await page.screenshot({
    path: "test-results/frontend-booking.png",
    fullPage: true,
  });

  await page.goto(base + "/shop/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("luxe-cart"));
  await page.getByRole("button", { name: "Add to request" }).first().click();
  await page.getByRole("link", { name: "Shopping bag", exact: true }).click();
  await page.getByRole("link", { name: "Request these products" }).click();
  await page
    .getByRole("heading", { name: "Ask about your selections" })
    .waitFor();
  assert.match(await page.locator("main").innerText(), /Botanical Shampoo/);
  assert.doesNotMatch(
    await page.locator("main").innerText(),
    /Stripe|Payment successful|order confirmed/i,
  );
  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "Ask about your selections" })
    .waitFor();
  await page
    .getByRole("button", {
      name: "Remove Botanical Shampoo from bag",
      exact: true,
    })
    .click();
  await page
    .getByRole("heading", { name: "Your next little luxury is waiting." })
    .waitFor();

  await page
    .getByRole("link", { name: "Join the Luxe list", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Join the Luxe list", exact: true })
    .waitFor();
  for (const route of [
    "/contact/",
    "/gift-vouchers/",
    "/team/amelia/",
    "/blog/your-guide-to-effortless-hair/",
    "/shop/botanical-shampoo/",
    "/faqs/",
  ]) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    assert.equal(await page.locator("main h1").count(), 1, route);
  }
  await page.goto(base + "/blog/?category=Skin", { waitUntil: "networkidle" });
  assert.equal(await page.locator("main article").count(), 1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .locator("nav")
    .getByRole("link", { name: "Contact", exact: true })
    .click();
  await page.waitForURL("**/contact/**");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
  );
  await page.screenshot({
    path: "test-results/frontend-mobile-contact.png",
    fullPage: true,
  });
  assert.deepEqual(errors, [], "Browser JavaScript errors");
  assert.deepEqual(apiRequests, [], "Frontend must not call removed APIs");
  console.log(
    `Passed: ${routes.length} static routes, removed-route 404s, search, filters, request context, product inquiry, newsletter, mobile navigation; no API calls or JavaScript errors.`,
  );
} catch (error) {
  await page.screenshot({
    path: "test-results/frontend-failure.png",
    fullPage: true,
  });
  throw error;
} finally {
  await browser.close();
}
