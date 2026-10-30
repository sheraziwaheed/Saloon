"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import {
  branches as demoBranches,
  services as demoServices,
  money,
  staff as demoStaff,
} from "@/lib/catalog";
import { detailsSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
type Slot = { start: string; time: string; staffId: string; staffName: string };
type AddOn = { id: string; name: string; price: number; duration: number };
export function BookingFlow({
  rules = { horizonDays: 120, cancellationHours: 24, depositPence: 2000 },
  initialBranch,
  initialService,
  branches = demoBranches,
  services = demoServices,
  staff = demoStaff,
  addOns = [],
}: {
  rules?: {
    horizonDays: number;
    cancellationHours: number;
    depositPence: number;
  };
  initialBranch?: string;
  initialService?: string;
  branches?: typeof demoBranches;
  services?: typeof demoServices;
  staff?: typeof demoStaff;
  addOns?: AddOn[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0),
    [branch, setBranch] = useState(initialBranch || "mayfair"),
    [selected, setSelected] = useState<string[]>(
      initialService ? [initialService] : [],
    ),
    [addons, setAddons] = useState<string[]>([]),
    [stylist, setStylist] = useState("any"),
    [date, setDate] = useState(""),
    [slot, setSlot] = useState<Slot | null>(null),
    [slots, setSlots] = useState<Slot[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [coupon, setCoupon] = useState(""),
    [voucher, setVoucher] = useState("");
  const form = useForm<z.infer<typeof detailsSchema>>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { name: "", email: "", phone: "", notes: "" },
  });
  const chosen = services.filter((s) => selected.includes(s.id));
  const total =
    chosen.reduce((n, s) => n + s.price, 0) +
    addOns
      .filter((a) => addons.includes(a.id))
      .reduce((n, a) => n + a.price, 0);
  useEffect(() => {
    setSlot(null);
    if (!date || !selected.length) return;
    const controller = new AbortController();
    setLoading(true);
    fetch(
      `/api/availability?branch=${branch}&services=${selected.join(",")}&staff=${stylist}&date=${date}&addons=${addons.join(",")}`,
      { signal: controller.signal },
    )
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setSlots(data);
        setError("");
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") {
          setError(e.message);
          setSlots([]);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [date, selected, branch, stylist, addons]);
  const toggle = (id: string) => {
    setSelected((a) =>
      a.includes(id) ? a.filter((x) => x !== id) : [...a, id],
    );
    setSlot(null);
  };
  async function submit() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form.getValues(),
          branchId: branch,
          serviceIds: selected,
          addOnIds: addons,
          staffId: slot?.staffId || stylist,
          start: slot?.start,
          coupon: coupon.trim() || undefined,
          voucher: voucher.trim() || undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.push(`/booking/manage/${d.token}?confirmed=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setLoading(false);
    }
  }
  const labels = [
    "Salon",
    "Services",
    "Specialist",
    "Date & time",
    "Your details",
    "Review",
  ];
  return (
    <div className="booking-layout">
      <div>
        <div className="steps">
          {labels.map((l, i) => (
            <span key={l} className={i <= step ? "active" : ""}>
              {i + 1}. {l}
            </span>
          ))}
        </div>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        {step === 0 && (
          <>
            <h2 className="section-title">Your little escape.</h2>
            <p className="mb-6">Choose the salon that suits your day.</p>
            {branches.map((b) => (
              <button
                key={b.id}
                className={`choice ${branch === b.id ? "selected" : ""}`}
                onClick={() => {
                  setBranch(b.id);
                  setStylist("any");
                  setSlot(null);
                }}
              >
                <div>
                  <h3>{b.name}</h3>
                  <small>{b.address}</small>
                </div>
                {branch === b.id ? <Check size={18} /> : <MapPin size={18} />}
              </button>
            ))}
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="section-title">What feels like you?</h2>
            <div className="booking-service-list">
              {services.map((s) => (
                <button
                  key={s.id}
                  className={`choice ${selected.includes(s.id) ? "selected" : ""}`}
                  onClick={() => toggle(s.id)}
                >
                  <div>
                    <h3>{s.name}</h3>
                    <small>{s.duration} minutes</small>
                  </div>
                  <span>
                    {money(s.price)} {selected.includes(s.id) && "✓"}
                  </span>
                </button>
              ))}
            </div>
            <h3 className="mt-6 mb-4">A little something extra</h3>
            {addOns.map((a) => (
              <label className="choice" key={a.id}>
                <span>
                  <input
                    type="checkbox"
                    checked={addons.includes(a.id)}
                    onChange={() =>
                      setAddons((v) =>
                        v.includes(a.id)
                          ? v.filter((i) => i !== a.id)
                          : [...v, a.id],
                      )
                    }
                  />{" "}
                  {a.name} · {a.duration} min
                </span>
                <span>{money(a.price)}</span>
              </label>
            ))}
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="section-title">Meet your good hands.</h2>
            <button
              className={`choice ${stylist === "any" ? "selected" : ""}`}
              onClick={() => setStylist("any")}
            >
              <div>
                <h3>Any available specialist</h3>
                <small>A lovely match, at the first available time.</small>
              </div>
              {stylist === "any" && <Check size={18} />}
            </button>
            {staff
              .filter((s) => s.branchId === branch)
              .map((s) => (
                <button
                  key={s.id}
                  className={`choice ${stylist === s.id ? "selected" : ""}`}
                  onClick={() => setStylist(s.id)}
                >
                  <div>
                    <h3>{s.name}</h3>
                    <small>{s.role}</small>
                  </div>
                  {stylist === s.id && <Check size={18} />}
                </button>
              ))}
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="section-title">Make a little time.</h2>
            <label className="field">
              Your preferred date
              <input
                type="date"
                value={date}
                min={new Date().toLocaleDateString("en-CA")}
                max={new Date(
                  Date.now() + rules.horizonDays * 86400000,
                ).toLocaleDateString("en-CA")}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <p className="note">
              Times are shown in London time. Your full service duration and a
              little breathing room are included.
            </p>
            {loading ? (
              <p role="status">Finding your moment…</p>
            ) : date && slots.length === 0 ? (
              <p>
                No appointments on this date. Try another day or specialist.
              </p>
            ) : (
              <div className="slots">
                {slots.map((s) => (
                  <button
                    key={s.start}
                    className={slot?.start === s.start ? "selected" : ""}
                    onClick={() => setSlot(s)}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        {step === 4 && (
          <form
            id="client-details"
            onSubmit={form.handleSubmit(() => setStep(5))}
          >
            <h2 className="section-title">A little about you.</h2>
            <div className="form-grid">
              {(["name", "email", "phone"] as const).map((k) => (
                <label
                  className={`field ${k === "name" ? "wide" : ""}`}
                  key={k}
                >
                  {k === "name"
                    ? "Full name"
                    : k === "email"
                      ? "Email address"
                      : "Phone number"}
                  <input
                    type={
                      k === "email" ? "email" : k === "phone" ? "tel" : "text"
                    }
                    autoComplete={
                      k === "name" ? "name" : k === "email" ? "email" : "tel"
                    }
                    {...form.register(k)}
                  />
                  {form.formState.errors[k] && (
                    <span className="field-error">
                      {form.formState.errors[k]?.message}
                    </span>
                  )}
                </label>
              ))}
              <label className="field wide">
                Anything you’d like us to know?
                <textarea
                  placeholder="Allergies, preferences, or a little note for your specialist…"
                  {...form.register("notes")}
                />
              </label>
            </div>
            <p className="note">
              We’ll only use these details for your appointment. Please read our{" "}
              <Link href="/privacy" className="underline">
                privacy policy
              </Link>
              .
            </p>
          </form>
        )}
        {step === 5 && (
          <>
            <h2 className="section-title">Your moment, all ready.</h2>
            <div className="panel">
              <h3>{form.getValues("name")}</h3>
              <p>
                {form.getValues("email")} · {form.getValues("phone")}
              </p>
              <p className="mt-4">
                {slot &&
                  new Date(slot.start).toLocaleString("en-GB", {
                    timeZone: "Europe/London",
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
              </p>
              <p>
                {slot?.staffName} · Luxe{" "}
                {branches.find((b) => b.id === branch)?.name}
              </p>
            </div>
            <label className="field mt-6">
              Have a welcome or offer code?
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME15"
              />
            </label>
            <label className="field mt-4">
              Gift voucher code
              <input
                value={voucher}
                onChange={(e) => setVoucher(e.target.value.toUpperCase())}
                placeholder="Optional gift voucher"
              />
            </label>
            <p className="note">
              Your appointment is reserved without payment. You can pay an
              optional {money(rules.depositPence)} deposit after confirmation
              when secure checkout is configured. Offer codes are checked when
              you confirm; your final total appears on confirmation. Changes and
              cancellations require
              {rules.cancellationHours} hours’ notice.
            </p>
            <label className="field">
              <span>
                By confirming, you agree to our{" "}
                <Link className="underline" href="/terms">
                  booking terms
                </Link>
                .
              </span>
            </label>
          </>
        )}
        <div className="booking-actions">
          {step > 0 ? (
            <Button
              variant="outline"
              onClick={() => {
                setStep((s) => s - 1);
                setError("");
              }}
            >
              <ArrowLeft size={14} /> Back
            </Button>
          ) : (
            <span />
          )}
          {step === 4 ? (
            <Button type="submit" form="client-details">
              Review your booking <ArrowUpRight size={15} />
            </Button>
          ) : step === 5 ? (
            <Button disabled={loading} onClick={submit}>
              {loading ? "Reserving your moment…" : "Confirm appointment"}{" "}
              <Check size={15} />
            </Button>
          ) : (
            <Button
              disabled={
                (step === 1 && !selected.length) ||
                (step === 3 && !slot) ||
                loading
              }
              onClick={() => {
                setStep((s) => s + 1);
                setError("");
              }}
            >
              Continue <ArrowUpRight size={15} />
            </Button>
          )}
        </div>
      </div>
      <aside className="panel booking-summary">
        <small>YOUR LUXE MOMENT</small>
        <h3>A little time for you.</h3>
        <div className="summary-details">
          <div className="summary-row">
            <span>Salon</span>
            <b>{branches.find((b) => b.id === branch)?.name}</b>
          </div>
          {chosen.map((s) => (
            <div className="summary-row" key={s.id}>
              <span>{s.name}</span>
              <span>{money(s.price)}</span>
            </div>
          ))}
          {addOns
            .filter((a) => addons.includes(a.id))
            .map((a) => (
              <div className="summary-row" key={a.id}>
                <span>{a.name}</span>
                <span>{money(a.price)}</span>
              </div>
            ))}
          {slot && (
            <div className="summary-row">
              <span>{date}</span>
              <span>{slot.time}</span>
            </div>
          )}
        </div>
        <div className="summary-row total">
          <span>Subtotal</span>
          <span>{money(total)}</span>
        </div>
        <p className="text-base mt-4 flex gap-2 items-center">
          <ShieldCheck size={15} />
          Secure booking. Thoughtful care.
        </p>
      </aside>
    </div>
  );
}
