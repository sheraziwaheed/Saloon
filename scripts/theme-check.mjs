import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const base = process.env.BASE_URL || "http://127.0.0.1:3001";
const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir("test-results", { recursive: true });
try {
  for (const preference of ["dark", "light"]) {
    const context = await browser.newContext({ colorScheme: preference });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base, { waitUntil: "networkidle" });
    const toggle = page.getByRole("button", {
      name: "Toggle light and dark theme",
    });
    await toggle.waitFor();
    assert.equal(
      await page.locator("html").getAttribute("data-theme"),
      preference,
    );
    assert.equal(
      await page
        .locator(
          preference === "dark" ? ".theme-toggle-sun" : ".theme-toggle-moon",
        )
        .isVisible(),
      true,
    );

    // System changes apply only until the user explicitly chooses a theme.
    const other = preference === "dark" ? "light" : "dark";
    await page.emulateMedia({ colorScheme: other });
    await page.waitForFunction(
      (theme) => document.documentElement.dataset.theme === theme,
      other,
    );
    await toggle.focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await page.evaluate(() => localStorage.getItem("luxe-theme")),
      preference,
    );
    await page.emulateMedia({ colorScheme: other });
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(
      await page.locator("html").getAttribute("data-theme"),
      preference,
    );

    const expectedBackground =
      preference === "dark" ? "rgb(9, 9, 11)" : "rgb(248, 246, 241)";
    for (const route of [
      "/",
      "/services/",
      "/shop/",
      "/contact/",
      "/booking/",
      "/gift-vouchers/",
      "/cart/",
    ]) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      assert.equal(
        await page.evaluate(
          () => getComputedStyle(document.body).backgroundColor,
        ),
        expectedBackground,
        route,
      );
    }
    for (const width of [320, 390, 768, 1440, 1536, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await toggle.isVisible(),
        true,
        `${width}px toggle visibility`,
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `${width}px overflow`,
      );
      const headerItems = await page
        .locator(".header > .wordmark, .header-actions")
        .evaluateAll((items) =>
          items.map((item) => {
            const rect = item.getBoundingClientRect();
            return { left: rect.left, right: rect.right };
          }),
        );
      assert.ok(
        headerItems[0].right <= headerItems[1].left,
        `${width}px header overlap`,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + "/contact/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Essential only" }).click();
    await page.screenshot({
      path: `test-results/theme-${preference}-mobile.png`,
    });
    assert.deepEqual(errors, [], `${preference} JavaScript errors`);
    await context.close();
  }

  // Prevent hydration entirely: the inline script must still restore the saved
  // choice before the application's JavaScript can run.
  const context = await browser.newContext({ colorScheme: "light" });
  await context.addInitScript(() => localStorage.setItem("luxe-theme", "dark"));
  const page = await context.newPage();
  await page.route("**/_next/**/*.js", (route) => route.abort());
  await page.goto(base, { waitUntil: "domcontentloaded" });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await context.close();
  console.log(
    "Passed: system themes, live preference changes, keyboard toggle, persistence, pre-hydration restoration, public page colors, mobile/desktop layout, and no hydration errors.",
  );
} finally {
  await browser.close();
}
