"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { canManage } from "@/lib/availability";
export function ManageBooking({
  token,
  status,
  start,
  canDeposit,
  cancellationHours = 24,
}: {
  token: string;
  status: string;
  branchId: string;
  staffId: string;
  serviceIds: string[];
  start: string;
  canDeposit: boolean;
  cancellationHours?: number;
}) {
  const router = useRouter();
  const [reschedule, setReschedule] = useState(false),
    [cancel, setCancel] = useState(false),
    [slots, setSlots] = useState<{ start: string; time: string }[]>([]),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  async function act(action: string, newStart?: string) {
    setPending(true);
    setError("");
    try {
      const r = await fetch(`/api/bookings/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, start: newStart }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.refresh();
      setReschedule(false);
      setCancel(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    }
    setPending(false);
  }
  return (
    <>
      <div className="flex flex-wrap gap-3 mt-6">
        {status === "CONFIRMED" && (
          <a href={`/api/bookings/${token}/ics`} className="btn btn-outline">
            Add to your calendar
          </a>
        )}
        {status === "CONFIRMED" &&
          canManage(new Date(start), new Date(), cancellationHours) && (
            <>
              <Button
                variant="outline"
                onClick={() => setReschedule((v) => !v)}
              >
                Find another time
              </Button>
              <Button variant="outline" onClick={() => setCancel((v) => !v)}>
                Cancel appointment
              </Button>
            </>
          )}
        {canDeposit && status === "CONFIRMED" && (
          <Button
            disabled={pending}
            onClick={async () => {
              setPending(true);
              const r = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingToken: token }),
              });
              const d = await r.json();
              if (r.ok && d.url) window.location.assign(d.url);
              else {
                setError(d.error);
                setPending(false);
              }
            }}
          >
            Pay optional deposit
          </Button>
        )}
      </div>
      {status === "CONFIRMED" &&
        !canManage(new Date(start), new Date(), cancellationHours) && (
          <p className="note">
            Your appointment is within {cancellationHours} hours. Please call
            the salon for any changes.
          </p>
        )}
      {cancel && (
        <div className="note">
          <p className="mb-4">
            Cancel this appointment? Your reserved time will be released. If a
            deposit was paid, contact the salon to arrange a refund under the
            cancellation policy.
          </p>
          <Button disabled={pending} onClick={() => act("cancel")}>
            Yes, cancel my appointment
          </Button>
          <Button
            className="ml-3"
            variant="outline"
            onClick={() => setCancel(false)}
          >
            Keep my moment
          </Button>
        </div>
      )}
      {reschedule && (
        <div className="mt-6">
          <label className="field">
            Choose another date
            <input
              type="date"
              min={new Date().toLocaleDateString("en-CA")}
              onChange={async (e) => {
                const r = await fetch(
                  `/api/bookings/${token}?date=${e.target.value}`,
                );
                const d = await r.json();
                if (r.ok) {
                  setSlots(d);
                  setError(
                    d.length ? "" : "No times on this date. Try another day.",
                  );
                } else setError(d.error);
              }}
            />
          </label>
          <div className="slots">
            {slots.map((s) => (
              <button
                disabled={pending}
                key={s.start}
                onClick={() => act("reschedule", s.start)}
              >
                {s.time}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
    </>
  );
}
