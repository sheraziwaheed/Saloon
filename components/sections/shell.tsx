"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  MessageCircle,
  Phone,
  MapPin,
  Instagram,
  Check,
} from "lucide-react";
import dynamic from "next/dynamic";
import { categories, services, products, posts } from "@/lib/catalog";
import { site as defaultSite } from "@/config/site";
import { Button } from "@/components/ui/button";
const Modal = dynamic(
  () => import("@/components/ui/modal").then((m) => m.Modal),
  { ssr: false },
);
export function Header({
  site = defaultSite,
  offer = { enabled: true, code: "WELCOME15", text: "Enjoy 15% off with code" },
}: {
  site?: typeof defaultSite;
  offer?: { enabled: boolean; code: string; text: string };
}) {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const results =
    query.trim().length < 2
      ? []
      : [
          ...services.map((s) => ({
            name: s.name,
            href: `/services/${s.slug}`,
          })),
          ...products.map((p) => ({ name: p.name, href: `/shop/${p.slug}` })),
          ...posts.map((p) => ({ name: p.title, href: `/blog/${p.slug}` })),
        ]
          .filter((item) =>
            item.name.toLowerCase().includes(query.trim().toLowerCase()),
          )
          .slice(0, 12);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 30);
    f();
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <>
      {offer.enabled && (
        <div className="offerbar">
          <span>YOUR FIRST VISIT, A LITTLE MORE SPECIAL</span>
          <span>
            {offer.text} <b>{offer.code}</b>
            <Link prefetch={false} href="/booking">
              Book your moment <ArrowUpRight size={12} />
            </Link>
          </span>
          <span>Mayfair & Chelsea, London</span>
        </div>
      )}
      <header className={scrolled ? "header scrolled" : "header"}>
        <Link prefetch={false} href="/" className="wordmark">
          {site.name.split(" ")[0].toUpperCase()}
          <span>SALON</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className={menu ? "nav mobile-open" : "nav"}
        >
          <div className="navgroup">
            <Link prefetch={false} href="/services">
              Our services <ChevronDown size={12} />
            </Link>
            <div className="mega">
              <div>
                <small>YOUR TIME TO FEEL GOOD</small>
                <h3>Care, in every detail.</h3>
                <Link prefetch={false} href="/services">
                  Explore all services →
                </Link>
              </div>
              <div className="mega-links">
                {categories.map((c) => (
                  <Link
                    prefetch={false}
                    onClick={() => setMenu(false)}
                    key={c.id}
                    href={`/services?category=${c.id}`}
                  >
                    {c.name}
                    <ArrowUpRight size={14} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link prefetch={false} onClick={() => setMenu(false)} href="/pricing">
            Pricing
          </Link>
          <div className="navgroup">
            <Link prefetch={false} href="/about">
              The Luxe experience <ChevronDown size={12} />
            </Link>
            <div className="mega compact">
              {["about", "team", "gallery", "reviews", "rewards", "faqs"].map(
                (p) => (
                  <Link
                    prefetch={false}
                    key={p}
                    href={`/${p}`}
                    onClick={() => setMenu(false)}
                  >
                    {p === "about" ? "Our story" : p.replace("faqs", "FAQs")}
                  </Link>
                ),
              )}
            </div>
          </div>
          <Link prefetch={false} onClick={() => setMenu(false)} href="/shop">
            The shop
          </Link>
          <Link prefetch={false} onClick={() => setMenu(false)} href="/blog">
            Journal
          </Link>
          <Link prefetch={false} onClick={() => setMenu(false)} href="/contact">
            Contact
          </Link>
        </nav>
        <div className="header-actions">
          <button aria-label="Search" onClick={() => setSearch(true)}>
            <Search size={18} />
          </button>
          <Link prefetch={false} href="/cart" aria-label="Shopping bag">
            <ShoppingBag size={18} />
          </Link>
          <Link
            prefetch={false}
            className="btn btn-dark header-book"
            href="/booking"
          >
            Request a visit <ArrowUpRight size={15} />
          </Link>
          <button
            className="menu-toggle"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {search && (
        <Modal
          title="Find your next little luxury"
          description="Search services, products and stories from Luxe."
          closeLabel="Close search"
          onClose={() => setSearch(false)}
        >
          <input
            autoFocus
            aria-label="Search services, products and journal"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try a facial, balayage, bridal…"
          />
          <div className="search-results">
            {query.length > 1 ? (
              results.length ? (
                results.map((s) => (
                  <Link
                    prefetch={false}
                    key={s.href}
                    href={s.href}
                    onClick={() => setSearch(false)}
                  >
                    {s.name}
                    <ArrowUpRight size={16} />
                  </Link>
                ))
              ) : (
                <p>No matches yet. Try another search.</p>
              )
            ) : (
              <p>
                Explore a new look, a favourite ritual, or a little inspiration.
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
export function Footer({ site = defaultSite }: { site?: typeof defaultSite }) {
  return (
    <>
      <section className="newsletter">
        <div>
          <small>LET’S STAY IN TOUCH</small>
          <h2>A little Luxe in your inbox.</h2>
          <p>
            Fresh inspiration, salon news and 10% off your first shop order.
          </p>
        </div>
        <Subscribe />
      </section>
      <footer>
        <div className="footer-main">
          <div>
            <Link prefetch={false} className="wordmark" href="/">
              {site.name.split(" ")[0].toUpperCase()}
              <span>SALON</span>
            </Link>
            <p>
              Expert hands. Thoughtful care.
              <br />A space to feel entirely yourself.
            </p>
            <div className="socials">
              <a href={site.socials.instagram} aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href={`mailto:${site.email}`} aria-label="Email">
                <MessageCircle size={18} />
              </a>
              <a href={`tel:${site.phone}`} aria-label="Call">
                <Phone size={18} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="footer-heading">Discover Luxe</h3>
            {[
              ["Our story", "about"],
              ["Meet the team", "team"],
              ["Our work", "gallery"],
              ["The journal", "blog"],
              ["Kind words", "reviews"],
            ].map(([n, p]) => (
              <Link prefetch={false} key={p} href={`/${p}`}>
                {n}
              </Link>
            ))}
          </div>
          <div>
            <h3 className="footer-heading">A little for you</h3>
            {[
              ["Our services", "services"],
              ["Service pricing", "pricing"],
              ["Gift vouchers", "gift-vouchers"],
              ["Luxe rewards", "rewards"],
              ["Contact the team", "contact"],
            ].map(([n, p]) => (
              <Link prefetch={false} key={p} href={`/${p}`}>
                {n}
              </Link>
            ))}
          </div>
          <div>
            <h3 className="footer-heading">Come say hello</h3>
            <Link prefetch={false} href="/contact">
              <MapPin size={13} /> Mayfair & Chelsea, London
            </Link>
            <a href={`tel:${site.phone}`}>{site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <Link prefetch={false} href="/faqs">
              Frequently asked questions
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Luxe Salon. A little luxury, every day.
          </span>
          <div>
            {[
              "privacy",
              "terms",
              "cookie-policy",
              "refund-policy",
              "html-sitemap",
            ].map((p) => (
              <Link prefetch={false} key={p} href={`/${p}`}>
                {p.replaceAll("-", " ")}
              </Link>
            ))}
          </div>
        </div>
      </footer>
      <a
        className="whatsapp"
        href={`https://wa.me/${site.whatsapp}`}
        aria-label="Chat with Luxe on WhatsApp"
      >
        <MessageCircle size={24} />
        <span>Let’s chat</span>
      </a>
      <Link prefetch={false} href="/booking" className="mobile-book">
        Request an appointment <ArrowUpRight size={18} />
      </Link>
      <Consent />
      <NewsletterPopup />
    </>
  );
}
export function Subscribe() {
  return (
    <div className="subscribe">
      <Link href="/contact?type=newsletter" className="btn btn-dark">
        Join the Luxe list <ArrowUpRight size={18} />
      </Link>
      <small>Newsletter signup is optional. Unsubscribe anytime.</small>
    </div>
  );
}
function Consent() {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(!localStorage.getItem("luxe-consent")), []);
  return show ? (
    <div className="cookie">
      <p>
        A small note about cookies.
        <br />
        <small>
          Browser storage remembers your product selections and preferences.
        </small>
      </p>
      <button
        onClick={() => {
          localStorage.setItem("luxe-consent", "essential");
          setShow(false);
        }}
      >
        Essential only
      </button>
      <Button
        onClick={() => {
          localStorage.setItem("luxe-consent", "accepted");
          setShow(false);
        }}
      >
        Accept <Check size={13} />
      </Button>
    </div>
  ) : null;
}
function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("luxe-newsletter")) return;
    const t = setTimeout(() => setOpen(true), 60000);
    return () => clearTimeout(t);
  }, []);
  return open ? (
    <Modal
      title="A little welcome gift."
      description="Join the Luxe list for 10% off your first shop order."
      closeLabel="Close newsletter"
      onClose={() => {
        setOpen(false);
        localStorage.setItem("luxe-newsletter", "seen");
      }}
    >
      <Subscribe />
    </Modal>
  ) : null;
}
