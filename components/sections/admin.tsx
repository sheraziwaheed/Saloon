"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/catalog";
import { londonDate } from "@/lib/availability";
type Booking = {
  id: string;
  start: string;
  end: string;
  status: string;
  total: number;
  staffId: string;
  branchId: string;
  client: { name: string; email: string; phone: string };
  staff: { name: string };
  branch: { name: string };
  items: { service: { name: string } }[];
};
export function AdminBookings({
  bookings,
  staff,
  branches,
}: {
  bookings: Booking[];
  staff: { id: string; name: string }[];
  branches: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("all"),
    [branch, setBranch] = useState("all"),
    [date, setDate] = useState(new Date().toLocaleDateString("en-CA")),
    [view, setView] = useState("list"),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  async function update(id: string, data: { status?: string; start?: string }) {
    setPending(true);
    setError("");
    try {
      const r = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    }
    setPending(false);
  }
  const filtered = bookings.filter(
    (b) =>
      (filter === "all" || b.staffId === filter) &&
      (branch === "all" || b.branchId === branch),
  );
  const start = new Date(date + "T00:00:00Z");
  const days = Array.from(
    { length: view === "week" ? 7 : 1 },
    (_, i) => new Date(start.getTime() + i * 86400000),
  );
  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="input !w-auto"
          aria-label="Filter by stylist"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All specialists</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="input !w-auto"
          aria-label="Filter by branch"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          <option value="all">Both salons</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        {["list", "day", "week"].map((v) => (
          <button
            className={`filter ${view === v ? "active" : ""}`}
            key={v}
            onClick={() => setView(v)}
          >
            {v}
          </button>
        ))}
        {view !== "list" && (
          <input
            className="input !w-auto"
            type="date"
            aria-label="Calendar date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        )}
        <Link className="btn btn-dark ml-auto" href="/booking">
          Create an appointment →
        </Link>
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {view === "list" ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {[
                  "Appointment",
                  "Client",
                  "Specialist / salon",
                  "Total",
                  "Status",
                  "Update",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    {new Date(b.start).toLocaleString("en-GB", {
                      timeZone: "Europe/London",
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                    <br />
                    {b.items.map((i) => i.service.name).join(", ")}
                  </td>
                  <td>
                    {b.client.name}
                    <br />
                    <small className="!tracking-normal">{b.client.email}</small>
                  </td>
                  <td>
                    {b.staff.name}
                    <br />
                    {b.branch.name}
                  </td>
                  <td>{money(b.total)}</td>
                  <td>
                    <span className="status-pill">{b.status}</span>
                  </td>
                  <td>
                    {b.status === "CONFIRMED" && (
                      <select
                        disabled={pending}
                        className="input"
                        aria-label={`Update ${b.client.name}'s appointment`}
                        value=""
                        onChange={(e) => {
                          if (e.target.value)
                            void update(b.id, { status: e.target.value });
                        }}
                      >
                        <option value="">Set status…</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="NO_SHOW">No-show</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="note">
              No appointments yet. Create the first little moment above.
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="note">
            Calendar times are London time. Drag an appointment onto another day
            to move it at the same time. Use the time control for precise
            changes.
          </p>
          <div
            className="grid gap-3 overflow-x-auto"
            style={{
              gridTemplateColumns: `repeat(${days.length},minmax(170px,1fr))`,
            }}
          >
            {days.map((day) => {
              const dayKey = day.toISOString().slice(0, 10);
              return (
                <div
                  className="panel !p-3 min-h-[260px]"
                  key={dayKey}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const b = bookings.find(
                      (b) => b.id === e.dataTransfer.getData("text/plain"),
                    );
                    if (b) {
                      const time = new Intl.DateTimeFormat("en-GB", {
                        timeZone: "Europe/London",
                        hour: "2-digit",
                        minute: "2-digit",
                        hourCycle: "h23",
                      }).format(new Date(b.start));
                      const [h, m] = time.split(":").map(Number);
                      void update(b.id, {
                        start: londonDate(dayKey, h * 60 + m).toISOString(),
                      });
                    }
                  }}
                >
                  <h3 className="!text-base mb-4">
                    {day.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      timeZone: "UTC",
                    })}
                  </h3>
                  {filtered
                    .filter(
                      (b) =>
                        new Intl.DateTimeFormat("en-CA", {
                          timeZone: "Europe/London",
                        }).format(new Date(b.start)) === dayKey,
                    )
                    .map((b) => (
                      <div
                        draggable={b.status === "CONFIRMED"}
                        onDragStart={(e) =>
                          e.dataTransfer.setData("text/plain", b.id)
                        }
                        key={b.id}
                        className="border-l-2 border-gold bg-[#eeeee5] p-3 mb-3"
                      >
                        <b className="text-base">
                          {new Date(b.start).toLocaleTimeString("en-GB", {
                            timeZone: "Europe/London",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {b.client.name}
                        </b>
                        <p className="text-base">
                          {b.items.map((i) => i.service.name).join(", ")}
                          <br />
                          {b.staff.name}
                        </p>
                        <span className="status-pill">{b.status}</span>
                        {b.status === "CONFIRMED" && (
                          <label className="field mt-2 !text-base">
                            Move to London time
                            <input
                              type="time"
                              step="900"
                              defaultValue={new Date(
                                b.start,
                              ).toLocaleTimeString("en-GB", {
                                timeZone: "Europe/London",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              onBlur={(e) => {
                                const [h, m] = e.target.value
                                  .split(":")
                                  .map(Number);
                                if (Number.isFinite(h) && Number.isFinite(m))
                                  void update(b.id, {
                                    start: londonDate(
                                      dayKey,
                                      h * 60 + m,
                                    ).toISOString(),
                                  });
                              }}
                            />
                          </label>
                        )}
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
const sample: Record<string, Record<string, unknown>> = {
  assignments: { staffId: "amelia", serviceId: "signature-cut-finish" },
  services: {
    id: "new-service",
    slug: "new-service",
    name: "New service",
    description: "A personal salon experience.",
    price: 5000,
    duration: 60,
    buffer: 15,
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df",
    categoryId: "hair",
    active: true,
  },
  categories: {
    id: "new-category",
    name: "New category",
    description: "Thoughtful care.",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df",
  },
  addons: { id: "new-addon", name: "New add-on", price: 1500, duration: 15 },
  staff: {
    id: "new-specialist",
    name: "New specialist",
    role: "Stylist",
    bio: "A little about your specialist.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
    branchId: "mayfair",
  },
  branches: {
    id: "new-branch",
    name: "New branch",
    address: "Your salon address",
    phone: "+44",
  },
  products: {
    id: "new-product",
    slug: "new-product",
    name: "New product",
    description: "Everyday essentials.",
    price: 2500,
    stock: 30,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108",
    categoryId: "wellness",
    brandId: "luxe",
  },
  coupons: {
    code: "NEW10",
    percent: 10,
    expires: "2030-12-31T00:00:00Z",
    active: true,
  },
  vouchers: {
    code: "GIFT-UNIQUE-CODE",
    balance: 5000,
    email: "recipient@example.com",
    expires: "2030-12-31T00:00:00Z",
  },
  blog: {
    id: "new-story",
    slug: "new-story",
    title: "A little inspiration",
    excerpt: "From the Luxe team.",
    content: "Your article.",
    category: "Hair",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df",
  },
  reviews: {
    name: "Customer",
    rating: 5,
    text: "A lovely salon experience.",
    service: "Hair",
  },
  gallery: {
    beforeImage: "",
    title: "A salon moment",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df",
    category: "hair",
  },
  faqs: { question: "Your question?", answer: "Your helpful answer." },
  settings: { key: "holidays", value: "2026-12-25,2026-12-26" },
  schedules: {
    staffId: "amelia",
    weekday: 1,
    startMinute: 540,
    endMinute: 1140,
  },
  timeoff: {
    staffId: "amelia",
    start: "2026-12-24T09:00:00Z",
    end: "2026-12-24T19:00:00Z",
  },
  brands: { id: "new-brand", name: "New brand" },
  productcategories: { id: "new-category", name: "New category" },
};
export function AdminCollection({
  entity,
  rows,
}: {
  entity: string;
  rows: Record<string, unknown>[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null),
    [error, setError] = useState(""),
    [confirmDelete, setConfirmDelete] = useState<string | null>(null),
    [pending, setPending] = useState(false),
    [search, setSearch] = useState("");
  const canEdit =
    !!sample[entity] ||
    entity === "clients" ||
    entity === "orders" ||
    entity === "users";
  const columns = Object.keys(rows[0] || sample[entity] || {})
    .filter(
      (k) =>
        ![
          "image",
          "description",
          "content",
          "bio",
          "password",
          "token",
          "bookings",
          "items",
        ].includes(k),
    )
    .slice(0, 5);
  const clientHistory =
    entity === "clients" && draft
      ? (rows.find((row) => row.id === draft.id)?.bookings as {
          id: string;
          start: string;
          status: string;
          total: number;
        }[]) || []
      : [];
  async function save(method = "POST", id?: string) {
    setPending(true);
    setError("");
    try {
      const r = await fetch(`/api/admin/${entity}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method === "DELETE" ? { id } : draft),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDraft(null);
      setConfirmDelete(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    }
    setPending(false);
  }
  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="input max-w-sm"
          aria-label={`Search ${entity}`}
          placeholder={`Search ${entity}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {sample[entity] && (
          <Button
            onClick={() => {
              setDraft({ ...sample[entity] });
              setError("");
            }}
          >
            Add {entity.replace(/s$/, "")}
          </Button>
        )}
        <a
          className="btn btn-outline ml-auto"
          href={`/api/admin/${entity}?format=csv`}
        >
          Export CSV
        </a>
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {confirmDelete && (
        <div className="note">
          Remove this record? Services are archived; records with booking/order
          history cannot be deleted.
          <div className="flex gap-3 mt-3">
            <Button
              disabled={pending}
              onClick={() => save("DELETE", confirmDelete)}
            >
              Confirm removal
            </Button>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Keep record
            </Button>
          </div>
        </div>
      )}
      {draft && (
        <form
          className="panel mb-7"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <h2>Edit {entity.replace(/s$/, "")}</h2>
          {entity === "clients" && (
            <div className="mb-6">
              <h3 className="mb-3">Your client’s salon history</h3>
              <p className="text-base mb-3">
                Completed service spend:{" "}
                {money(
                  clientHistory
                    .filter((b) => b.status === "COMPLETED")
                    .reduce((n, b) => n + b.total, 0),
                )}
              </p>
              {clientHistory.length ? (
                clientHistory.map((b) => (
                  <div className="summary-row" key={b.id}>
                    <span>
                      {new Date(b.start).toLocaleString("en-GB", {
                        timeZone: "Europe/London",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    <span>
                      {b.status} · {money(b.total)}
                    </span>
                  </div>
                ))
              ) : (
                <p>No appointments yet.</p>
              )}
            </div>
          )}
          <div className="form-grid">
            {Object.entries(draft)
              .filter(
                ([k, v]) =>
                  !["createdAt", "updatedAt", "bookings", "items"].includes(
                    k,
                  ) && typeof v !== "object",
              )
              .map(([k, v]) => (
                <label
                  key={k}
                  className={`field ${["content", "description", "bio", "text", "answer", "notes", "value"].includes(k) ? "wide" : ""}`}
                >
                  {k.replace(/([A-Z])/g, " $1")}
                  {typeof v === "boolean" ? (
                    <input
                      type="checkbox"
                      checked={v}
                      onChange={(e) =>
                        setDraft({ ...draft, [k]: e.target.checked })
                      }
                    />
                  ) : [
                      "content",
                      "description",
                      "bio",
                      "text",
                      "answer",
                      "notes",
                      "value",
                    ].includes(k) ? (
                    <textarea
                      value={String(v ?? "")}
                      onChange={(e) =>
                        setDraft({ ...draft, [k]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      type={typeof v === "number" ? "number" : "text"}
                      value={String(v ?? "")}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          [k]:
                            typeof v === "number"
                              ? Number(e.target.value)
                              : e.target.value,
                        })
                      }
                    />
                  )}
                </label>
              ))}
          </div>
          <div className="flex gap-3 mt-5">
            <Button disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDraft(null)}
            >
              Close
            </Button>
          </div>
        </form>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((k) => (
                <th key={k}>{k}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .filter((row) =>
                JSON.stringify(row)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((row, i) => {
                const key = String(
                  row.id ||
                    row.code ||
                    row.key ||
                    (row.staffId && row.serviceId
                      ? `${row.staffId}|${row.serviceId}`
                      : i),
                );
                return (
                  <tr key={key}>
                    {columns.map((c) => (
                      <td key={c}>
                        {typeof row[c] === "object"
                          ? JSON.stringify(row[c]).slice(0, 80)
                          : String(row[c] ?? "").slice(0, 80)}
                      </td>
                    ))}
                    <td>
                      {canEdit && (
                        <button
                          className="text-link mr-4"
                          onClick={() => {
                            setDraft(
                              entity === "users"
                                ? {
                                    id: row.id,
                                    role: row.role,
                                    staffId: row.staffId || "",
                                  }
                                : entity === "clients"
                                  ? { id: row.id, notes: row.notes || "" }
                                  : entity === "orders"
                                    ? { id: row.id, status: "SHIPPED" }
                                    : { ...row },
                            );
                            setError("");
                          }}
                        >
                          Edit
                        </button>
                      )}
                      {sample[entity] && (
                        <button
                          className="text-link"
                          onClick={() => setConfirmDelete(key)}
                        >
                          Remove
                        </button>
                      )}
                      {!canEdit && <span>Read only</span>}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="note">No {entity} yet.</p>}
      </div>
    </>
  );
}
