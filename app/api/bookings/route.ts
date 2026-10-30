import { NextResponse } from "next/server";
import { createBooking } from "@/lib/booking";
import { bookingSchema } from "@/lib/validation";
import { fail, rateLimit, requireOrigin } from "@/lib/http";
import { sendEmail } from "@/lib/email";
import { site } from "@/config/site";
import { getSetting, renderTemplate } from "@/lib/settings";
export async function POST(r: Request) {
  try {
    await requireOrigin(r);
    await rateLimit("booking", 8);
    const b = await createBooking(bookingSchema.parse(await r.json()));
    let emailSent = true;
    const [templates, rules] = await Promise.all([
      getSetting("emailTemplates"),
      getSetting("bookingRules"),
    ]);
    try {
      await sendEmail(
        b.client.email,
        templates.confirmationSubject,
        renderTemplate(templates.confirmationBody, {
          name: b.client.name,
          branch: b.branch.name,
          date: b.start.toLocaleString("en-GB", { timeZone: site.timezone }),
          link: `${site.url}/booking/manage/${b.token}`,
          hours: String(rules.cancellationHours),
        }),
      );
    } catch {
      emailSent = false;
    }
    return NextResponse.json({ id: b.id, token: b.token, emailSent });
  } catch (e) {
    return fail(e);
  }
}
