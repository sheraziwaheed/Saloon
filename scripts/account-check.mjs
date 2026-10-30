import { chromium } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
const db = new PrismaClient();
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.BASE_URL || "http://127.0.0.1:3001";
const email = `qa-account-${Date.now()}@example.com`,
  password = randomBytes(18).toString("base64url");
try {
  const r = await page.request.post(base + "/api/register", {
    data: { name: "Account QA", email, password },
  });
  const data = await r.json();
  if (!r.ok() || !data.requiresVerification)
    throw new Error("Registration did not require verification");
  await page.goto(base + "/account");
  await page.locator(".auth-box input[name=email]").fill(email);
  await page.locator("input[name=password]").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("alert").waitFor();
  if ((await page.locator("h1").innerText()).includes("Hello"))
    throw new Error("Unverified login succeeded");
  const token = await db.verificationToken.findFirstOrThrow({
    where: { identifier: email },
  });
  await page.goto(base + `/account/verify?token=${token.token}`);
  await page.getByRole("button", { name: "Confirm my email" }).click();
  await page.waitForURL("**/account?verified=1");
  await page.locator(".auth-box input[name=email]").fill(email);
  await page.locator("input[name=password]").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("heading", { name: "Hello, Account." }).waitFor();
  const denied = await page.request.get(base + "/api/admin/services");
  if (denied.ok()) throw new Error("Client has admin access");
  await db.user.update({ where: { email }, data: { role: "OWNER" } });
  await page.goto(base + "/admin");
  await page
    .getByRole("heading", { name: "Behind the beautiful moments." })
    .waitFor();
  const catalogue = await page.request.get(base + "/api/admin/services");
  if (!catalogue.ok()) throw new Error("Owner catalogue access failed");
  await page.goto(base + "/admin/assignments");
  await page.getByRole("button", { name: "Add assignment" }).waitFor();
  await db.user.update({
    where: { email },
    data: { role: "STYLIST", staffId: "amelia" },
  });
  const stylistDenied = await page.request.get(base + "/api/admin/services");
  if (stylistDenied.ok()) throw new Error("Stylist has manager access");
  await page.goto(base + "/admin/bookings");
  await page
    .getByRole("heading", { name: "Behind the beautiful moments." })
    .waitFor();
  console.log(
    "Account QA passed: verification required; confirmed email signs in; CLIENT denied admin; OWNER admitted; STYLIST denied catalogue and admitted own bookings.",
  );
} finally {
  await browser.close();
  await db.verificationToken.deleteMany({ where: { identifier: email } });
  await db.user.deleteMany({ where: { email } });
  await db.$disconnect();
}
