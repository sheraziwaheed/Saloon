import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/access";
import { db } from "@/lib/db";
import { fail, requireOrigin } from "@/lib/http";
export async function PATCH(r: Request) {
  try {
    await requireOrigin(r);
    const u = await currentUser();
    if (!u) throw new Error("Please sign in.");
    const data = z
      .object({ name: z.string().trim().min(2).max(100) })
      .parse(await r.json());
    await db.user.update({ where: { id: u.id }, data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
