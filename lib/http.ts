import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { headers } from "next/headers";
import { db } from "./db";
import { validOrigin } from "./origin";
export async function rateLimit(scope: string, limit = 12) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${scope}:${ip}:${Math.floor(Date.now() / 60000)}`;
  const n = await db.rateLimit.upsert({
    where: { key },
    create: { key, count: 1, expires: new Date(Date.now() + 120000) },
    update: { count: { increment: 1 } },
  });
  if (n.count > limit)
    throw new Error("Too many requests. Please try again in a minute.");
}
export function fail(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues[0]?.message || "Please check your details." },
      { status: 400 },
    );
  const message =
    error instanceof Error ? error.message : "Something went wrong.";
  if (message.includes("Too many"))
    return NextResponse.json({ error: message }, { status: 429 });
  if (message.includes("access required") || message.includes("access denied"))
    return NextResponse.json({ error: message }, { status: 403 });
  if (message === "Please sign in.")
    return NextResponse.json({ error: message }, { status: 401 });
  if (
    message.includes("Unique constraint") ||
    message.includes("write conflict") ||
    message.includes("database is locked")
  )
    return NextResponse.json(
      { error: "That time was just reserved. Please choose another slot." },
      { status: 409 },
    );
  return NextResponse.json({ error: message }, { status: 400 });
}
export async function requireOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!validOrigin(origin, request.url, request.headers.get("host")))
    throw new Error("Request origin is not allowed.");
}
