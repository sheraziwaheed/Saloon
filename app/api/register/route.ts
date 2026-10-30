import { NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { rateLimit, fail, requireOrigin } from "@/lib/http";
import { sendEmail } from "@/lib/email";
import { site } from "@/config/site";
export async function POST(r: Request) {
  try {
    await requireOrigin(r);
    await rateLimit("register", 5);
    const v = registerSchema.parse(await r.json());
    const existing = await db.user.findUnique({ where: { email: v.email } });
    if (
      existing &&
      (existing.emailVerified ||
        !existing.password ||
        !(await compare(v.password, existing.password)))
    )
      throw new Error(
        "An account with this email already exists. Please sign in.",
      );
    if (!existing)
      await db.user.create({
        data: { ...v, password: await hash(v.password, 12) },
      });
    const token = randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: {
        identifier: v.email,
        token,
        expires: new Date(Date.now() + 3600000),
      },
    });
    await sendEmail(
      v.email,
      "Your little welcome to Luxe",
      `Confirm your email to finish creating your account: ${site.url}/account/verify?token=${token}\nThis link expires in one hour. If you did not request this, ignore the message.`,
    );
    return NextResponse.json({
      ok: true,
      requiresVerification: true,
      message:
        "Check your email for a confirmation link before signing in. In local development, the link appears in the server terminal.",
    });
  } catch (e) {
    return fail(e);
  }
}
