import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getSetting, renderTemplate } from "@/lib/settings";
export async function GET(r: Request) {
  if (
    !process.env.CRON_SECRET ||
    r.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  )
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const now = Date.now();
  const bookings = await db.booking.findMany({
    where: {
      status: "CONFIRMED",
      reminderSent: false,
      start: {
        gte: new Date(now + 23 * 3600000),
        lte: new Date(now + 25 * 3600000),
      },
    },
    include: { client: true, branch: true },
  });
  let sent = 0;
  const templates = await getSetting("emailTemplates");
  await db.rateLimit.deleteMany({ where: { expires: { lt: new Date() } } });
  for (const b of bookings) {
    try {
      await sendEmail(
        b.client.email,
        templates.reminderSubject,
        renderTemplate(templates.reminderBody, {
          name: b.client.name,
          branch: b.branch.name,
          date: b.start.toLocaleString("en-GB", { timeZone: "Europe/London" }),
        }),
      );
      await db.booking.update({
        where: { id: b.id },
        data: { reminderSent: true },
      });
      sent++;
    } catch {
      console.error("Reminder delivery failed for booking", b.id);
    }
  }
  return NextResponse.json({ sent });
}
