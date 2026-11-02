import { Suspense } from "react";
import { LeadRequest } from "@/components/sections/lead-request";
import { PageIntro } from "@/components/sections/shared";
export const metadata = {
  title: "Request an appointment",
  alternates: { canonical: "/booking" },
};
export default function Page() {
  return (
    <>
      <PageIntro
        eyebrow="YOUR TIME, BEAUTIFULLY SPENT"
        title="Request your moment."
        description="Tell us what you have in mind. Our team will contact you to arrange a suitable appointment."
      />
      <div className="page-content">
        <Suspense fallback={<p>Loading request form…</p>}>
          <LeadRequest kind="appointment" />
        </Suspense>
      </div>
    </>
  );
}
