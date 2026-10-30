"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { products, money } from "@/lib/catalog";
export function LoginForm({ google }: { google: boolean }) {
  const [register, setRegister] = useState(false),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  return (
    <div className="auth-box panel">
      <div className="auth-switch">
        <button
          className={!register ? "active" : ""}
          onClick={() => {
            setRegister(false);
            setError("");
          }}
        >
          Welcome back
        </button>
        <button
          className={register ? "active" : ""}
          onClick={() => {
            setRegister(true);
            setError("");
          }}
        >
          Join the circle
        </button>
      </div>
      <h2>
        {register ? "Your Luxe story starts here." : "A little time for you."}
      </h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setError("");
          const data = Object.fromEntries(new FormData(e.currentTarget));
          try {
            if (register) {
              const r = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              const d = await r.json();
              if (!r.ok) throw new Error(d.error);
              if (d.requiresVerification) {
                setError(d.message);
                setPending(false);
                return;
              }
            }
            const result = await signIn("credentials", {
              ...data,
              redirect: false,
            });
            if (result?.error)
              throw new Error("Please check your email and password.");
            window.location.assign("/account");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Please try again.");
            setPending(false);
          }
        }}
      >
        {register && (
          <label className="field">
            Full name
            <input name="name" required minLength={2} autoComplete="name" />
          </label>
        )}
        <label className="field">
          Email address
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label className="field">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={register ? 10 : 1}
            maxLength={128}
            autoComplete={register ? "new-password" : "current-password"}
          />
          {register && (
            <small className="!tracking-normal">At least 10 characters.</small>
          )}
        </label>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <Button disabled={pending}>
          {pending
            ? "A little moment…"
            : register
              ? "Create your account"
              : "Sign in"}
        </Button>
      </form>
      {google && (
        <Button
          variant="outline"
          onClick={() => signIn("google", { callbackUrl: "/account" })}
        >
          Continue with Google
        </Button>
      )}
      <p className="mt-6 text-base">
        By continuing, you agree to our{" "}
        <Link className="underline" href="/privacy">
          privacy policy
        </Link>{" "}
        and{" "}
        <Link className="underline" href="/terms">
          terms
        </Link>
        .
      </p>
    </div>
  );
}
export function WishlistPanel() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(
      JSON.parse(localStorage.getItem("luxe-wishlist") || "[]") as string[],
    );
  }, []);
  return (
    <div className="panel">
      <h2>Your little wish list.</h2>
      {ids.length ? (
        products
          .filter((p) => ids.includes(p.id))
          .map((p) => (
            <p className="my-3" key={p.id}>
              <Link href={`/shop/${p.slug}`}>
                {p.name} · {money(p.price)}
              </Link>
            </p>
          ))
      ) : (
        <p>Save your favourite products with the heart in our shop.</p>
      )}
      <Link className="text-link mt-5" href="/shop">
        Explore the shop →
      </Link>
    </div>
  );
}
export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [message, setMessage] = useState("");
  return (
    <form
      className="panel"
      onSubmit={async (e) => {
        e.preventDefault();
        const r = await fetch("/api/account", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            Object.fromEntries(new FormData(e.currentTarget)),
          ),
        });
        const d = await r.json();
        setMessage(r.ok ? "Your profile is updated." : d.error);
      }}
    >
      <h2>Your details.</h2>
      <label className="field">
        Your name
        <input name="name" required minLength={2} defaultValue={name} />
      </label>
      <p className="my-4 text-base">{email}</p>
      <Button variant="outline">Save your details</Button>
      {message && <p className="message">{message}</p>}
    </form>
  );
}
