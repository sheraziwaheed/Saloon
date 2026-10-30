import { chromium } from "@playwright/test";
import fs from "node:fs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", async (r) => {
  if (r.status() >= 400 && r.url().includes("/api/"))
    console.error("API failure", r.url(), r.status(), await r.text());
});
process.on("uncaughtException", async (error) => {
  console.error(error.message);
  console.error(
    "Visible alerts:",
    await page.locator('[role="alert"]').allTextContents(),
  );
  await page.screenshot({
    path: "test-results/browser-failure.png",
    fullPage: true,
  });
  await browser.close();
  process.exitCode = 1;
});
const base = process.env.BASE_URL || "http://127.0.0.1:3001";
await page.goto(base, { waitUntil: "networkidle" });
await page
  .getByRole("button", { name: "Essential only" })
  .click()
  .catch(() => {});
fs.mkdirSync("test-results", { recursive: true });
for (
  let y = 0;
  y < (await page.locator("body").evaluate((e) => e.scrollHeight));
  y += 800
) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(100);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>{img.loading='eager';return img.decode().catch(()=>{})})));
await page.screenshot({
  path: "test-results/home-desktop.png",
  fullPage: true,
});
const imageFailures = await page
  .locator("img")
  .evaluateAll((images) =>
    images
      .filter(
        (i) =>
          i.getBoundingClientRect().top < window.innerHeight &&
          (!i.complete || i.naturalWidth === 0),
      )
      .map((i) => i.src),
  );
await page.getByRole("button", { name: "Search", exact: true }).click();
await page
  .getByRole("textbox", { name: "Search services and journal" })
  .fill("balayage");
await page.getByRole("link", { name: "Balayage & Gloss", exact: true }).click();
await page.waitForURL("**/services/balayage-gloss");
await page.goto(base + "/booking?service=signature-cut-finish");
await page.getByRole("button", { name: "Continue", exact: false }).click();
await page.getByRole("button", { name: "Continue", exact: false }).click();
await page.getByRole("button", { name: "Continue", exact: false }).click();
let day = new Date(Date.now() + 10 * 86400000);
while (day.getUTCDay() === 0) day = new Date(day.getTime() + 86400000);
await page
  .getByLabel("Your preferred date")
  .fill(day.toISOString().slice(0, 10));
await page.locator(".slots button").first().waitFor();
await page.locator(".slots button").first().click();
await page.getByRole("button", { name: "Continue", exact: false }).click();
await page.getByLabel("Full name").fill("Browser Test Client");
await page
  .locator('#client-details input[name="email"]')
  .fill("browser-test@example.com");
await page.getByLabel("Phone number").fill("07700900001");
await page.getByRole("button", { name: "Review your booking" }).click();
await page.getByRole("button", { name: "Confirm appointment" }).click();
await page.waitForURL("**/booking/manage/**", { timeout: 30000 });
await page
  .getByRole("heading", { name: "A little something to look forward to." })
  .waitFor();
const confirmation = page.url();
await page.getByRole("button", { name: "Find another time" }).click();
let another = new Date(day.getTime() + 86400000);
while (another.getUTCDay() === 0)
  another = new Date(another.getTime() + 86400000);
await page
  .getByLabel("Choose another date")
  .fill(another.toISOString().slice(0, 10));
await page.locator(".slots button").first().waitFor();
const rescheduled = page.waitForResponse(
  (r) => r.url().includes("/api/bookings/") && r.request().method() === "PATCH",
);
await page.locator(".slots button").first().click();
if (!(await rescheduled).ok()) throw new Error("Rescheduling failed");
await page.getByRole("button", { name: "Find another time" }).waitFor();
const ics = await page.request.get(
  confirmation.replace("/booking/manage/", "/api/bookings/").split("?")[0] +
    "/ics",
);
if (ics.status() !== 200 || !(await ics.text()).includes("BEGIN:VCALENDAR"))
  throw new Error("Calendar download failed");
await page
  .getByRole("button", { name: "Cancel appointment", exact: true })
  .click();
await page.getByRole("button", { name: "Yes, cancel my appointment" }).click();
await page.getByText("CANCELLED", { exact: true }).waitFor();
await page.goto(base + "/shop");
await page.getByRole("button", { name: "Add to bag" }).first().click();
await page.goto(base + "/cart");
await page.getByRole("link", { name: "Continue to checkout" }).waitFor();
const routes = [
  "/",
  "/services",
  "/pricing",
  "/team",
  "/about",
  "/gallery",
  "/reviews",
  "/rewards",
  "/shop",
  "/blog",
  "/faqs",
  "/contact",
  "/gift-vouchers",
  "/concerns",
  "/terms",
  "/privacy",
  "/cookie-policy",
  "/refund-policy",
  "/html-sitemap",
  "/account",
  "/cart",
  "/checkout",
  "/robots.txt",
  "/sitemap.xml",
];
const status = [];
for (const path of routes) {
  const r = await page.request.get(base + path);
  status.push([path, r.status()]);
  if (r.status() !== 200) throw new Error(`${path} returned ${r.status()}`);
}
const admin = await page.request.get(base + "/api/admin/services");
if (admin.ok()) throw new Error("Unauthenticated admin API is accessible");
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base, { waitUntil: "networkidle" });
await page.locator('img').evaluateAll(images=>Promise.all(images.map(img=>{img.loading='eager';return img.decode().catch(()=>{})})));
await page.screenshot({ path: "test-results/home-mobile.png", fullPage: true });
const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth,
);
if (overflow) throw new Error("Mobile layout overflows horizontally");
await page.getByRole("button", { name: "Open navigation" }).click();
await page.getByRole("link", { name: "Pricing", exact: true }).first().click();
await page.waitForURL("**/pricing");
await page.screenshot({
  path: "test-results/pricing-mobile.png",
  fullPage: true,
});
await browser.close();
console.log(
  JSON.stringify(
    {
      routes: status.length,
      booking: "confirmed, rescheduled, ICS downloaded, cancelled",
      cart: "product persisted",
      search: "service detail reached",
      mobile: "no overflow; navigation passed",
      imageFailures,
      pageErrors: errors,
    },
    null,
    2,
  ),
);
if (errors.length || imageFailures.length) process.exitCode = 1;
