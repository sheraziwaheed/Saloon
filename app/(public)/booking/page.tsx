import { BookingFlow } from "@/components/sections/booking-flow";
import { PageIntro } from "@/components/sections/shared";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Book your moment",
  alternates: { canonical: "/booking" },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; service?: string }>;
}) {
  const q = await searchParams;
  const rules = await getSetting("bookingRules");
  const [services, staff, addOns, branches] = await Promise.all([
    db.service.findMany({ where: { active: true } }),
    db.staff.findMany(),
    db.addOn.findMany(),
    db.branch.findMany(),
  ]);
  return (
    <>
      <PageIntro
        eyebrow="YOUR TIME, BEAUTIFULLY SPENT"
        title="Book your moment."
        description="A few simple steps to a fresh look, a favourite ritual, or a well-deserved pause."
      />
      <div className="page-content">
        <BookingFlow
          rules={rules}
          initialBranch={q.branch}
          initialService={q.service}
          services={services}
          staff={staff}
          addOns={addOns}
          branches={branches}
        />
      </div>
    </>
  );
}
