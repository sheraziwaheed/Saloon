"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, ArrowUpRight } from "lucide-react";
import { money, products as fallback } from "@/lib/catalog";
import { readCart, type CartItem } from "./interactive";
import { Button } from "@/components/ui/button";
export function Cart({
  checkout = false,
  products = fallback,
}: {
  checkout?: boolean;
  products?: typeof fallback;
}) {
  const [cart, setCart] = useState<CartItem[]>([]),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  useEffect(() => {
    setCart(readCart());
    setReady(true);
    const f = () => setCart(readCart());
    window.addEventListener("cart-updated", f);
    return () => window.removeEventListener("cart-updated", f);
  }, []);
  const items = cart
    .map((i) => ({ item: i, product: products.find((p) => p.id === i.id) }))
    .filter(
      (v): v is { item: CartItem; product: (typeof products)[number] } =>
        !!v.product,
    );
  const total = items.reduce(
    (n, { item, product }) => n + item.quantity * product.price,
    0,
  );
  function update(id: string, quantity: number) {
    const next =
      quantity > 0
        ? cart.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, 10) } : i,
          )
        : cart.filter((i) => i.id !== id);
    setCart(next);
    localStorage.setItem("luxe-cart", JSON.stringify(next));
  }
  if (!ready) return <p role="status">A little moment…</p>;
  if (!items.length)
    return (
      <div className="empty-state">
        <ShoppingBag className="mx-auto" size={32} />
        <h2>Your next little luxury is waiting.</h2>
        <p>
          Your bag is empty. Find something lovely for your everyday ritual.
        </p>
        <Link href="/shop" className="btn btn-dark">
          Explore the Luxe edit <ArrowUpRight size={15} />
        </Link>
      </div>
    );
  return (
    <>
      {items.map(({ item, product: p }) => (
        <div className="cart-row" key={p.id}>
          <Image src={p.image} alt={p.name} width={90} height={90} />
          <div>
            <h3>
              <Link href={`/shop/${p.slug}`}>{p.name}</Link>
            </h3>
            <small className="!tracking-normal">{money(p.price)} each</small>
          </div>
          <div className="quantity">
            <button
              aria-label={`Remove one ${p.name}`}
              onClick={() => update(p.id, item.quantity - 1)}
            >
              <Minus size={13} />
            </button>
            {item.quantity}
            <button
              aria-label={`Add one ${p.name}`}
              onClick={() => update(p.id, item.quantity + 1)}
            >
              <Plus size={13} />
            </button>
          </div>
          <b>{money(item.quantity * p.price)}</b>
          <button
            aria-label={`Remove ${p.name} from bag`}
            onClick={() => update(p.id, 0)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <div className="cart-footer">
        <Link href="/shop" className="text-link self-start">
          ← A little more browsing
        </Link>
        <div>
          <div className="summary-row total">
            <span>Total</span>
            <b>{money(total)}</b>
          </div>
          <p className="my-3 text-base">
            Complimentary delivery on this demo catalogue.
          </p>
          {!checkout ? (
            <Link className="btn btn-dark" href="/checkout">
              Continue to checkout <ArrowUpRight size={15} />
            </Link>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                setPending(true);
                const data = new FormData(e.currentTarget);
                try {
                  const r = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      items: cart,
                      email: data.get("email"),
                      coupon: data.get("coupon") || undefined,
                    }),
                  });
                  const d = await r.json();
                  if (!r.ok) throw new Error(d.error);
                  if (d.url) window.location.assign(d.url);
                } catch (e) {
                  setError(
                    e instanceof Error ? e.message : "Please try again.",
                  );
                  setPending(false);
                }
              }}
            >
              <label className="field">
                Email for your order
                <input type="email" name="email" required />
              </label>
              <label className="field my-4">
                Offer code
                <input name="coupon" placeholder="Optional" />
              </label>
              <Button disabled={pending}>
                {pending
                  ? "Opening secure checkout…"
                  : "Secure Stripe checkout"}{" "}
                <ArrowUpRight size={15} />
              </Button>
              <p className="text-base mt-3">
                Test checkout only. Card details are entered securely with
                Stripe.
              </p>
            </form>
          )}
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
