import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { currentUser } from "@/lib/access";
import { db } from "@/lib/db";
import { listEntity } from "@/lib/admin";
import { PageIntro } from "@/components/sections/shared";
import { AdminBookings, AdminCollection } from "@/components/sections/admin";
import { money } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Salon dashboard",
  robots: { index: false, follow: false },
};
const sections = [
  "overview",
  "bookings",
  "services",
  "categories",
  "addons",
  "staff",
  "assignments",
  "users",
  "schedules",
  "timeoff",
  "branches",
  "products",
  "productcategories",
  "brands",
  "orders",
  "clients",
  "coupons",
  "vouchers",
  "blog",
  "reviews",
  "gallery",
  "faqs",
  "messages",
  "subscribers",
  "settings",
];
export default async function Page({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const u = await currentUser();
  if (!u || !["OWNER", "MANAGER", "STYLIST"].includes(u.role))
    redirect("/account");
  const { section } = await params;
  const current = section?.[0] || "overview";
  if (!sections.includes(current) || (section && section.length > 1))
    notFound();
  if (current === "users" && u.role !== "OWNER") redirect("/admin");
  if (u.role === "STYLIST" && !["overview", "bookings"].includes(current))
    redirect("/admin/bookings");
  const bookings = await db.booking.findMany({
    where: u.role === "STYLIST" ? { staffId: u.staffId || "unassigned" } : {},
    include: {
      client: true,
      staff: true,
      branch: true,
      items: { include: { service: true } },
    },
    orderBy: { start: "desc" },
    take: 500,
  });
  const [staff, branches] = await Promise.all([
    db.staff.findMany(),
    db.branch.findMany(),
  ]);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
  }).format(new Date());
  const todayBookings = bookings.filter(
    (b) =>
      new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(
        b.start,
      ) === today,
  );
  const paid = await db.payment.aggregate({
    _sum: { amount: true },
    where: { status: "PAID" },
  });
  const clients = await db.client.count();
  return (
    <>
      <PageIntro
        eyebrow={`LUXE OPERATIONS · ${u.role}`}
        title="Behind the beautiful moments."
        description={`Welcome, ${u.name || u.email}. A little clarity for your salon day.`}
      />
      <div className="page-content !max-w-[1450px]">
        <nav className="admin-nav" aria-label="Dashboard sections">
          {sections
            .filter(
              (s) =>
                u.role !== "STYLIST" || ["overview", "bookings"].includes(s),
            )
            .map((s) => (
              <Link
                href={s === "overview" ? "/admin" : `/admin/${s}`}
                key={s}
                className={`filter capitalize ${current === s ? "active" : ""}`}
              >
                {s === "addons"
                  ? "Add-ons"
                  : s === "timeoff"
                    ? "Time off"
                    : s === "productcategories"
                      ? "Product categories"
                      : s}
              </Link>
            ))}
        </nav>
        {current === "overview" ? (
          <>
            <div className="stats">
              <div className="panel">
                <span>Today’s appointments</span>
                <b>
                  {todayBookings.filter((b) => b.status === "CONFIRMED").length}
                </b>
              </div>
              <div className="panel">
                <span>Recorded payments</span>
                <b>
                  {u.role === "STYLIST" ? "—" : money(paid._sum.amount || 0)}
                </b>
              </div>
              <div className="panel">
                <span>
                  {u.role === "STYLIST"
                    ? "Your clients"
                    : "Clients in your circle"}
                </span>
                <b>
                  {u.role === "STYLIST"
                    ? new Set(bookings.map((b) => b.clientId)).size
                    : clients}
                </b>
              </div>
              <div className="panel">
                <span>Completed moments</span>
                <b>{bookings.filter((b) => b.status === "COMPLETED").length}</b>
              </div>
            </div>
            <div className="panel mb-8">
              <h2>The week in little moments.</h2>
              <div className="chart">
                {Array.from({ length: 7 }, (_, i) => {
                  const day = new Date(Date.now() - (6 - i) * 86400000);
                  const key = new Intl.DateTimeFormat("en-CA", {
                    timeZone: "Europe/London",
                  }).format(day);
                  const count = bookings.filter(
                    (b) =>
                      new Intl.DateTimeFormat("en-CA", {
                        timeZone: "Europe/London",
                      }).format(b.start) === key,
                  ).length;
                  return (
                    <div
                      key={key}
                      style={{
                        height: Math.max(3, Math.min(100, count * 15)) + "%",
                      }}
                      title={`${count} appointments`}
                    >
                      <span>
                        {day.toLocaleDateString("en-GB", { weekday: "short" })}{" "}
                        · {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <h2 className="section-title">Your salon day.</h2>
            <AdminBookings
              bookings={JSON.parse(JSON.stringify(todayBookings))}
              staff={staff}
              branches={branches}
            />
          </>
        ) : current === "bookings" ? (
          <AdminBookings
            bookings={JSON.parse(JSON.stringify(bookings))}
            staff={staff}
            branches={branches}
          />
        ) : (
          <>
            <h2 className="section-title capitalize">{current}</h2>
            {current === "settings" && (
              <p className="note">
                Supported keys: holidays (comma-separated YYYY-MM-DD), business,
                bookingRules, emailTemplates, seoDefaults, offers. Use JSON for
                all keys except holidays. Booking rules accept leadMinutes,
                horizonDays, cancellationHours and depositPence. Email templates
                accept confirmationSubject, confirmationBody, reminderSubject
                and reminderBody; use placeholders
                {"{name}, {branch}, {date}, {link}, {hours}"}. Business accepts
                name, phone, email and whatsapp. SEO accepts title and
                description. Offers accepts enabled, code and text. Codes must
                also exist under Coupons.
              </p>
            )}
            {current === "staff" && (
              <p className="note">
                New specialists need working hours under Schedules and service
                links under Assignments. Tailor these to each specialist’s
                expertise.
              </p>
            )}
            <AdminCollection
              entity={current}
              rows={JSON.parse(JSON.stringify(await listEntity(current)))}
            />
          </>
        )}
      </div>
    </>
  );
}
