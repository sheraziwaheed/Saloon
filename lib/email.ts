import nodemailer from "nodemailer";
import { site } from "@/config/site";
import { getSetting } from "./settings";
export async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV === "production")
      throw new Error("Email delivery is not configured.");
    console.info(`[Development email] ${subject}\n${text}`);
    return;
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  const business = await getSetting("business");
  await transport.sendMail({
    from: business.email || site.email,
    to,
    subject,
    text,
  });
}
