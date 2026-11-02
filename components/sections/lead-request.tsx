"use client";
import { useSearchParams } from "next/navigation";
import { branches, services } from "@/lib/catalog";
import { LeadForm } from "./lead-form";

export function LeadRequest({
  kind = "contact",
}: {
  kind?: "appointment" | "contact";
}) {
  const query = useSearchParams();
  const service = services.find((s) => s.id === query.get("service"));
  const branch = branches.find((b) => b.id === query.get("branch"));
  const requestType =
    kind === "contact" && query.get("type") === "newsletter"
      ? "newsletter"
      : kind;
  return (
    <>
      {(service || branch) && (
        <p className="note mb-5">
          Your request:{" "}
          {[service?.name, branch?.name].filter(Boolean).join(" · ")}
        </p>
      )}
      <LeadForm
        title={
          requestType === "appointment"
            ? "Request your appointment"
            : requestType === "newsletter"
              ? "Join the Luxe list"
              : "A little hello"
        }
        context={{ requestType, service: service?.name, branch: branch?.name }}
      />
    </>
  );
}
