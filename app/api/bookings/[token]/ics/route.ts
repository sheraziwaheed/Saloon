import { db } from "@/lib/db";
import { NextResponse } from "next/server";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const b = await db.booking.findUnique({
    where: { token },
    include: { branch: true, items: { include: { service: true } } },
  });
  if (!b || b.status === "CANCELLED")
    return new NextResponse("Booking not found", { status: 404 });
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const esc = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, "\\$&");
  const text = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Luxe Salon//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${b.id}@luxesalon.example`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(b.start)}`,
    `DTEND:${fmt(b.end)}`,
    `SUMMARY:${esc("Luxe Salon: " + b.items.map((i) => i.service.name).join(", "))}`,
    `LOCATION:${esc(b.branch.address)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="luxe-appointment.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
