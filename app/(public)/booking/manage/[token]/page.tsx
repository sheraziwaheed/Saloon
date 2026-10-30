import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageIntro } from "@/components/sections/shared";
import { ManageBooking } from "@/components/sections/manage-booking";
import { money } from "@/lib/catalog";
import { getSetting } from "@/lib/settings";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your salon moment",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { token } = await params;
  const q = await searchParams;
  if (!/^[a-f0-9]{64}$/.test(token)) notFound();
  const b = await db.booking.findUnique({
    where: { token },
    include: {
      client: true,
      staff: true,
      branch: true,
      items: { include: { service: true } },
    },
  });
  if (!b) notFound();
  const rules = await getSetting("bookingRules");
  return (
    <>
      <PageIntro
        eyebrow={q.confirmed ? "YOUR MOMENT IS RESERVED" : "YOUR LUXE MOMENT"}
        title={
          q.confirmed
            ? "A little something to look forward to."
            : "Your time, beautifully planned."
        }
        description={
          q.confirmed
            ? "Your appointment is confirmed. Keep this private link to manage your visit."
            : "Your appointment details and a little flexibility, all in one place."
        }
      />
      <div className="page-content max-w-3xl">
        <div className="panel">
          <span className="status-pill">{b.status}</span>
          <h2 className="mt-5">
            {b.items.map((i) => i.service.name).join(" & ")}
          </h2>
          <p className="my-5">
            {b.start.toLocaleString("en-GB", {
              timeZone: "Europe/London",
              dateStyle: "full",
              timeStyle: "short",
            })}{" "}
            · London time
            <br />
            {b.staff.name} · Luxe {b.branch.name}
            <br />
            {b.branch.address}
          </p>
          <div className="summary-row total">
            <span>Appointment total</span>
            <b>{money(b.total)}</b>
          </div>
          <div className="summary-row">
            <span>Deposit paid</span>
            <span>{money(b.deposit)}</span>
          </div>
          <p className="note">
            Confirmation email is delivered when SMTP is configured. In local
            development, it appears in the server console. Keep this secure link
            private.
          </p>
          <ManageBooking
            cancellationHours={rules.cancellationHours}
            token={token}
            status={b.status}
            branchId={b.branchId}
            staffId={b.staffId}
            serviceIds={b.items.map((i) => i.serviceId)}
            start={b.start.toISOString()}
            canDeposit={
              !!process.env.STRIPE_SECRET_KEY && b.total > 0 && b.deposit === 0
            }
          />
        </div>
      </div>
    </>
  );
}
