import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { email } from "@/lib/validation";
import { fail, rateLimit, requireOrigin } from "@/lib/http";
export async function POST(r: Request) {
  try {
    await requireOrigin(r);
    await rateLimit("forms", 8);
    const v = z
      .discriminatedUnion("type", [
        z.object({ type: z.literal("newsletter"), email }),
        z.object({
          type: z.literal("contact"),
          name: z.string().min(2).max(100),
          email,
          message: z.string().min(10).max(3000),
          branchId: z.enum(["mayfair", "chelsea"]),
        }),
      ])
      .parse(await r.json());
    if (v.type === "newsletter")
      await db.newsletterSubscriber.upsert({
        where: { email: v.email },
        update: {},
        create: { email: v.email },
      });
    else {
      const { type: _, ...data } = v;
      void _;
      await db.contactMessage.create({ data });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
