import { NextResponse } from "next/server";
import { z } from "zod";
import { requireManager } from "@/lib/access";
import {
  listEntity,
  saveEntity,
  deleteEntity,
  schemas,
  type Entity,
} from "@/lib/admin";
import { fail, requireOrigin } from "@/lib/http";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function GET(
  r: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    const user = await requireManager();
    const { entity } = await params;
    if (entity === "users" && user.role !== "OWNER")
      throw new Error("Owner access required.");
    const records = await listEntity(entity);
    if (new URL(r.url).searchParams.get("format") === "csv") {
      const rows = records as unknown as Record<string, unknown>[];
      const keys = Object.keys(rows[0] || {});
      const escape = (v: unknown) =>
        `"${String(typeof v === "object" ? JSON.stringify(v) : (v ?? ""))
          .replace(/^[=+@-]/, "'$&")
          .replaceAll('"', '""')}"`;
      const csv = [
        keys.map(escape).join(","),
        ...rows.map((row) => keys.map((k) => escape(row[k])).join(",")),
      ].join("\r\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="luxe-${entity}.csv"`,
        },
      });
    }
    return NextResponse.json(records);
  } catch (e) {
    return fail(e);
  }
}
export async function POST(
  r: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    await requireOrigin(r);
    const u = await requireManager();
    const { entity } = await params;
    const raw = await r.json();
    if (entity === "users") {
      if (u.role !== "OWNER") throw new Error("Owner access required.");
      const v = z
        .object({
          id: z.string(),
          role: z.enum(["OWNER", "MANAGER", "STYLIST", "CLIENT"]),
          staffId: z.string().optional(),
        })
        .parse(raw);
      if (v.id === u.id && v.role !== "OWNER")
        throw new Error("You cannot remove your own owner access.");
      if (
        v.role === "STYLIST" &&
        (!v.staffId ||
          !(await db.staff.findUnique({ where: { id: v.staffId } })))
      )
        throw new Error("A stylist needs a valid staff ID.");
      return NextResponse.json(
        await db.user.update({
          where: { id: v.id },
          data: { role: v.role, staffId: v.staffId || null },
          select: { id: true, role: true, staffId: true },
        }),
      );
    }
    if (entity === "clients") {
      const v = z
        .object({ id: z.string(), notes: z.string().max(10000) })
        .parse(raw);
      return NextResponse.json(
        await db.client.update({
          where: { id: v.id },
          data: { notes: v.notes },
        }),
      );
    }
    if (entity === "orders") {
      const v = z
        .object({ id: z.string(), status: z.enum(["SHIPPED", "FULFILLED"]) })
        .parse(raw);
      const result = await db.order.updateMany({
        where: { id: v.id, status: { in: ["PAID", "SHIPPED"] } },
        data: { status: v.status },
      });
      if (!result.count) throw new Error("Only paid orders can be fulfilled.");
      return NextResponse.json({ ok: true });
    }
    if (!(entity in schemas)) throw new Error("Unsupported collection.");
    if (entity === "settings" && u.role !== "OWNER")
      throw new Error("Only the owner can change settings.");
    const result = await saveEntity(entity as Entity, raw);
    revalidatePath("/", "layout");
    return NextResponse.json(result);
  } catch (e) {
    return fail(e);
  }
}
export async function DELETE(
  r: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    await requireOrigin(r);
    const u = await requireManager();
    const { entity } = await params;
    if (!(entity in schemas)) throw new Error("Unsupported collection.");
    if (entity === "settings" && u.role !== "OWNER")
      throw new Error("Only the owner can change settings.");
    const v = z.object({ id: z.string().max(100) }).parse(await r.json());
    await deleteEntity(entity as Entity, v.id);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
