"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, X, Check, Heart } from "lucide-react";
import {
  categories,
  services as defaultServices,
  money,
  products as defaultProducts,
  images,
} from "@/lib/catalog";
import { ServiceCard } from "./shared";
import { Button } from "@/components/ui/button";
export function ServicesBrowser({
  initial = "all",
  pricing = false,
  services = defaultServices,
}: {
  initial?: string;
  pricing?: boolean;
  services?: typeof defaultServices;
}) {
  const [active, setActive] = useState(initial);
  useEffect(() => setActive(initial), [initial]);
  const filtered = services.filter(
    (s) => active === "all" || s.categoryId === active,
  );
  return (
    <>
      <div className="filters" aria-label="Service categories">
        {[{ id: "all", name: "All services" }, ...categories].map((c) => (
          <button
            key={c.id}
            aria-pressed={active === c.id}
            className={`filter ${active === c.id ? "active" : ""}`}
            onClick={() => setActive(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={pricing ? "" : "grid-3"}
        >
          {filtered.map((s) =>
            pricing ? (
              <div className="price-row" key={s.id}>
                <div>
                  <h3>
                    <Link href={`/services/${s.slug}`}>{s.name}</Link>
                  </h3>
                  <small>
                    {s.duration} minutes · personalised consultation included
                  </small>
                </div>
                <b>{money(s.price)}</b>
                <Link
                  className="btn btn-outline"
                  href={`/booking?service=${s.id}`}
                >
                  Book <ArrowUpRight size={13} />
                </Link>
              </div>
            ) : (
              <ServiceCard key={s.id} service={s} />
            ),
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
export type CartItem = { id: string; quantity: number };
export function readCart(): CartItem[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("luxe-cart") || "[]",
    );
    return Array.isArray(value)
      ? value.filter(
          (item: unknown): item is CartItem =>
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            typeof item.id === "string" &&
            "quantity" in item &&
            typeof item.quantity === "number" &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            item.quantity <= 10,
        )
      : [];
  } catch {
    return [];
  }
}
export function AddToCart({ id }: { id: string }) {
  const [added, setAdded] = useState(false);
  return (
    <Button
      variant="outline"
      onClick={() => {
        const cart = readCart(),
          item = cart.find((v) => v.id === id);
        if (item) item.quantity = Math.min(item.quantity + 1, 10);
        else cart.push({ id, quantity: 1 });
        localStorage.setItem("luxe-cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cart-updated"));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }}
    >
      {added ? (
        <>
          <Check size={13} /> Added to bag
        </>
      ) : (
        <>
          Add to bag <ArrowUpRight size={13} />
        </>
      )}
    </Button>
  );
}
function Wishlist({ id }: { id: string }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(
      (
        JSON.parse(localStorage.getItem("luxe-wishlist") || "[]") as string[]
      ).includes(id),
    );
  }, [id]);
  return (
    <button
      className="p-2"
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      onClick={() => {
        const list = JSON.parse(
          localStorage.getItem("luxe-wishlist") || "[]",
        ) as string[];
        localStorage.setItem(
          "luxe-wishlist",
          JSON.stringify(saved ? list.filter((v) => v !== id) : [...list, id]),
        );
        setSaved(!saved);
      }}
    >
      <Heart size={17} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
export function ShopBrowser({
  products = defaultProducts,
}: {
  products?: typeof defaultProducts;
}) {
  const [q, setQ] = useState(""),
    [category, setCategory] = useState("all");
  return (
    <>
      <div className="filters">
        <input
          aria-label="Search products"
          className="input max-w-xs"
          placeholder="Find your everyday essential…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          aria-label="Product category"
          className="input max-w-[200px]"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All rituals</option>
          <option value="haircare">Haircare</option>
          <option value="wellness">Skin & wellness</option>
        </select>
      </div>
      <div className="grid-3">
        {products
          .filter(
            (p) =>
              (category === "all" || p.categoryId === category) &&
              p.name.toLowerCase().includes(q.toLowerCase()),
          )
          .map((p) => (
            <article className="product-card" key={p.id}>
              <Link href={`/shop/${p.slug}`} className="card-image">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width:650px) 100vw,33vw"
                />
              </Link>
              <div className="card-body">
                <small>LUXE RITUALS</small>
                <h3 className="mt-2">
                  <Link href={`/shop/${p.slug}`}>{p.name}</Link>
                </h3>
                <div className="product-actions">
                  <span>{money(p.price)}</span>
                  <Wishlist id={p.id} />
                  <AddToCart id={p.id} />
                </div>
              </div>
            </article>
          ))}
      </div>
    </>
  );
}
export function Gallery({
  items,
}: {
  items?: { title: string; image: string; beforeImage: string | null }[];
}) {
  const [selected, setSelected] = useState<number | null>(null),
    [position, setPosition] = useState(50);
  const photos = items?.length
    ? items.map((i) => i.image)
    : [
        images.hair,
        images.nails,
        images.skin,
        images.makeup,
        images.salon,
        images.spa,
        images.grooming,
        images.hero,
      ];
  const pair = items?.find((item) => item.beforeImage);
  return (
    <>
      <div className="gallery-grid">
        {photos.map((src, i) => (
          <button
            key={`${src}-${i}`}
            onClick={() => setSelected(i)}
            aria-label={`View gallery image ${i + 1}`}
          >
            <Image
              src={src}
              alt={
                items?.[i]?.title ||
                [
                  "Soft hair and natural movement",
                  "The finishing touches",
                  "The glow ritual",
                  "A luminous occasion look",
                  "A quiet salon moment",
                  "A well-deserved pause",
                  "Considered grooming",
                  "A warm welcome",
                ][i]
              }
              fill
              sizes="33vw"
            />
            <span>
              {items?.[i]?.title ||
                [
                  "Good hair days",
                  "The little details",
                  "Fresh-faced moments",
                  "Your occasion",
                  "Inside Luxe",
                  "A little calm",
                  "Everyday confidence",
                  "Our space",
                ][i]}
            </span>
          </button>
        ))}
      </div>
      <div className="note">
        {pair
          ? "Before/after photographs are shown with the salon’s published gallery record."
          : "Gallery uses replaceable editorial photographs. The comparison below demonstrates monochrome and colour using one image, not a treatment result."}
      </div>
      <h2 className="section-title">A different perspective.</h2>
      <div className="before-after">
        <Image
          src={pair?.image || images.hair}
          alt={pair ? "After: " + pair.title : "Colour image demonstration"}
          fill
          sizes="100vw"
        />
        <div
          className="before-layer"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={pair?.beforeImage || images.hair}
            style={pair ? { filter: "none" } : undefined}
            alt={
              pair ? "Before: " + pair.title : "Monochrome image demonstration"
            }
            fill
            sizes="100vw"
          />
        </div>
      </div>
      <label className="field mt-4">
        {pair
          ? "Slide to compare before and after"
          : "Slide to compare monochrome and colour"}
        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
        />
      </label>
      <Dialog.Root
        open={selected !== null}
        onOpenChange={(v) => !v && setSelected(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content !w-[90vw] !max-w-[1000px]">
            <Dialog.Title className="sr-only">Luxe gallery</Dialog.Title>
            <Dialog.Description className="sr-only">
              Editorial photograph from our salon inspiration gallery.
            </Dialog.Description>
            <Dialog.Close className="dialog-close" aria-label="Close gallery">
              <X />
            </Dialog.Close>
            <div className="lightbox-image">
              {selected !== null && (
                <Image
                  src={photos[selected]}
                  alt="Luxe salon gallery"
                  fill
                  sizes="90vw"
                />
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
export function ContactForm() {
  const [message, setMessage] = useState(""),
    [pending, setPending] = useState(false);
  return (
    <form
      className="panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        try {
          const r = await fetch("/api/forms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, type: "contact" }),
          });
          const d = await r.json();
          setMessage(
            r.ok ? "Thank you. Your message has reached our team." : d.error,
          );
          if (r.ok) form.reset();
        } catch {
          setMessage("Unable to send. Please try again.");
        }
        setPending(false);
      }}
    >
      <h2>A little hello.</h2>
      <div className="form-grid">
        <label className="field">
          Your name
          <input name="name" required minLength={2} />
        </label>
        <label className="field">
          Email address
          <input type="email" name="email" required />
        </label>
        <label className="field wide">
          Your salon
          <select name="branchId">
            <option value="mayfair">Mayfair</option>
            <option value="chelsea">Chelsea</option>
          </select>
        </label>
        <label className="field wide">
          How can we help?
          <textarea name="message" required minLength={10} />
        </label>
      </div>
      {message && (
        <p className="message" role="status">
          {message}
        </p>
      )}
      <Button className="mt-5" disabled={pending}>
        {pending ? "Sending…" : "Send your message"} <ArrowUpRight size={14} />
      </Button>
    </form>
  );
}
export function VoucherForm() {
  const [amount, setAmount] = useState(50);
  return (
    <div className="panel">
      <h2>A gift of a little time.</h2>
      <label className="field">
        Choose your gift
        <select
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        >
          {[25, 50, 75, 100, 150, 200].map((n) => (
            <option key={n} value={n}>
              {money(n * 100)}
            </option>
          ))}
        </select>
      </label>
      <p className="my-5">
        Our team will help arrange your voucher and presentation. Vouchers are
        valid for 12 months.
      </p>
      <a
        href={`mailto:hello@luxesalon.example?subject=${encodeURIComponent(`Luxe gift voucher — £${amount}`)}`}
        className="btn btn-dark"
      >
        Arrange your gift <ArrowUpRight size={15} />
      </a>
    </div>
  );
}
