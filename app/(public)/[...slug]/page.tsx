import { safeJson } from "@/lib/json";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Clock,
  MapPin,
  Phone,
  Heart,
  Sparkles,
  Gift,
  Leaf,
} from "lucide-react";
import { db } from "@/lib/db";
import { images, money, branches } from "@/lib/catalog";
import { PageIntro, BookingCTA } from "@/components/sections/shared";
import { FaqList } from "@/components/sections/faq-list";
import {
  ServicesBrowser,
  ShopBrowser,
  Gallery,
  ContactForm,
  AddToCart,
  VoucherForm,
} from "@/components/sections/interactive";
import { site } from "@/config/site";
export const dynamic = "force-dynamic";
const titles: Record<string, string> = {
  services: "Your beauty. Your way.",
  pricing: "Beautiful care. Clear prices.",
  team: "Good hands. Lovely people.",
  about: "A little luxury. A lot of care.",
  gallery: "A glimpse into our world.",
  reviews: "Kind words. Beautiful moments.",
  rewards: "A little more, just for you.",
  shop: "Bring a little Luxe home.",
  blog: "The Luxe journal.",
  faqs: "A little reassurance.",
  contact: "Come say hello.",
  "gift-vouchers": "Give a little Luxe.",
  concerns: "Care for your moment.",
  terms: "Terms & booking policy",
  privacy: "Your privacy matters.",
  "cookie-policy": "Our cookie policy.",
  "refund-policy": "Returns & refunds.",
  "html-sitemap": "Find your way.",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let title = titles[slug[0]] || "Luxe Salon";
  if (slug[1]) {
    if (slug[0] === "services")
      title =
        (await db.service.findUnique({ where: { slug: slug[1] } }))?.name ||
        title;
    if (slug[0] === "shop")
      title =
        (await db.product.findUnique({ where: { slug: slug[1] } }))?.name ||
        title;
    if (slug[0] === "blog")
      title =
        (await db.blogPost.findUnique({ where: { slug: slug[1] } }))?.title ||
        title;
  }
  return {
    title,
    description: `${title} Discover thoughtful beauty, hair and wellness care at Luxe Salon in Mayfair and Chelsea.`,
    alternates: { canonical: `/${slug.join("/")}` },
  };
}
export default async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { slug } = await params;
  const [page, detail] = slug;
  const q = await searchParams;
  if (slug.length > 2) notFound();
  if (detail) {
    if (page === "services") {
      const s = await db.service.findUnique({
        where: { slug: detail },
        include: { category: true },
      });
      if (!s || !s.active) notFound();
      return (
        <>
          <div className="page-content">
            <Link href="/services" className="text-link mb-6">
              ← All services
            </Link>
            <div className="detail-layout">
              <div className="detail-image">
                <Image src={s.image} alt={s.name} fill priority sizes="50vw" />
              </div>
              <div className="detail-copy">
                <small>{s.category.name.toUpperCase()}</small>
                <h1>{s.name}</h1>
                <p>{s.description}</p>
                <div className="meta">
                  <span>From {money(s.price)}</span>
                  <span>
                    <Clock size={15} />
                    {s.duration} min
                  </span>
                </div>
                <h3 className="mt-7">Made for you.</h3>
                <p>
                  Your visit starts with a personal consultation. We’ll listen,
                  offer honest advice and tailor your treatment to what feels
                  right for you.
                </p>
                <ul className="list-disc pl-4 text-base text-stone-600 space-y-2">
                  <li>Personalised consultation included</li>
                  <li>Thoughtfully selected professional products</li>
                  <li>Advice to make your results last at home</li>
                </ul>
                <Link
                  className="btn btn-dark"
                  href={`/booking?service=${s.id}`}
                >
                  Book this moment <ArrowUpRight size={15} />
                </Link>
                <p className="note">
                  Colour services require a patch test at least 48 hours in
                  advance. Please tell us about allergies or sensitivities.
                </p>
              </div>
            </div>
          </div>
          <section className="page-content">
            <h2 className="section-title">A little reassurance.</h2>
            <FaqList limit={3} />
          </section>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: safeJson({
                "@context": "https://schema.org",
                "@type": "Service",
                name: s.name,
                description: s.description,
                provider: { "@type": "BeautySalon", name: site.name },
                offers: {
                  "@type": "Offer",
                  price: s.price / 100,
                  priceCurrency: "GBP",
                },
              }),
            }}
          />
        </>
      );
    }
    if (page === "team") {
      const s = await db.staff.findUnique({
        where: { id: detail },
        include: { branch: true },
      });
      if (!s) notFound();
      return (
        <>
          <div className="page-content detail-layout">
            <div className="detail-image">
              <Image src={s.image} alt={s.name} fill sizes="50vw" />
            </div>
            <div className="detail-copy">
              <small>{s.role.toUpperCase()}</small>
              <h1>{s.name}</h1>
              <p>{s.bio}</p>
              <p>
                Find {s.name.split(" ")[0]} at our {s.branch.name} salon. Every
                appointment begins with a conversation about you, so your care
                feels personal from the very first moment.
              </p>
              <Link
                href={`/booking?branch=${s.branchId}`}
                className="btn btn-dark"
              >
                Find your appointment <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
          <BookingCTA />
        </>
      );
    }
    if (page === "shop") {
      const p = await db.product.findUnique({ where: { slug: detail } });
      if (!p) notFound();
      return (
        <div className="page-content">
          <Link className="text-link mb-8" href="/shop">
            ← Back to the shop
          </Link>
          <div className="detail-layout">
            <div className="detail-image">
              <Image src={p.image} alt={p.name} fill sizes="50vw" />
            </div>
            <div className="detail-copy">
              <small>LUXE RITUALS</small>
              <h1>{p.name}</h1>
              <p>{p.description}</p>
              <div className="meta">
                {money(p.price)}{" "}
                <span>
                  {p.stock > 0
                    ? "Available for delivery"
                    : "Currently out of stock"}
                </span>
              </div>
              <p>
                Bring a little intention to your everyday routine. Ask your
                specialist how to use this essential as part of your
                personalised care ritual.
              </p>
              {p.stock > 0 && <AddToCart id={p.id} />}
              <p className="note">
                Demo product catalogue. Product photographs are editorial
                placeholders. See packaging and your stylist for final
                ingredients and directions.
              </p>
            </div>
          </div>
        </div>
      );
    }
    if (page === "blog") {
      const p = await db.blogPost.findUnique({ where: { slug: detail } });
      if (!p) notFound();
      return (
        <>
          <PageIntro
            eyebrow={`${p.category.toUpperCase()} · THE LUXE JOURNAL`}
            title={p.title}
            description={p.excerpt}
          />
          <article className="page-content prose">
            <div className="relative h-[400px] mb-10">
              <Image src={p.image} alt={p.title} fill sizes="800px" />
            </div>
            <small>
              BY THE LUXE TEAM ·{" "}
              {p.publishedAt.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </small>
            <p>{p.content}</p>
            <Link className="text-link" href="/blog">
              ← Back to the journal
            </Link>
          </article>
          <BookingCTA />
        </>
      );
    }
    notFound();
  }
  if (!titles[page]) notFound();
  let content: React.ReactNode;
  let eyebrow = "A LITTLE LUXE, EVERY DAY";
  let description =
    "Expert hands. Thoughtful care. A space to feel entirely yourself.";
  switch (page) {
    case "services":
    case "pricing": {
      const services = await db.service.findMany({ where: { active: true } });
      eyebrow =
        page === "pricing"
          ? "THOUGHTFUL CARE, NO SURPRISES"
          : "THE ART OF FEELING GOOD";
      description =
        page === "pricing"
          ? "Every service begins with a consultation. Find your ritual, your time, and your price."
          : "From a fresh chapter for your hair to a well-deserved moment of calm. Find what feels like you.";
      content = (
        <>
          <ServicesBrowser
            services={services}
            initial={q.category || "all"}
            pricing={page === "pricing"}
          />
          {page === "pricing" && (
            <p className="note">
              Prices include consultation and applicable taxes. Extended
              services or additional colour are agreed before treatment. Please
              give at least 24 hours’ notice for changes.
            </p>
          )}
        </>
      );
      break;
    }
    case "team": {
      const team = await db.staff.findMany({ include: { branch: true } });
      eyebrow = "A PERSONAL TOUCH. A PASSIONATE TEAM.";
      content = (
        <>
          <p className="note">
            Meet our fictional demo team. Replace these profiles with your
            salon’s specialists before launch.
          </p>
          <div className="grid-3">
            {team.map((s) => (
              <Link className="team-card" href={`/team/${s.id}`} key={s.id}>
                <div>
                  <Image src={s.image} alt={s.name} fill sizes="33vw" />
                </div>
                <h3>
                  {s.name}
                  <ArrowUpRight size={17} />
                </h3>
                <p>
                  {s.role} · {s.branch.name}
                </p>
              </Link>
            ))}
          </div>
        </>
      );
      break;
    }
    case "about":
      content = (
        <>
          <div className="detail-layout">
            <div className="detail-image">
              <Image
                src={images.salon}
                alt="Warm and welcoming salon interior"
                fill
                sizes="50vw"
              />
            </div>
            <div className="detail-copy">
              <small>MORE THAN A SALON</small>
              <h2>
                Come as you are.
                <br />
                <em>Leave feeling you.</em>
              </h2>
              <p>
                Luxe began with a simple idea: a salon visit should feel like a
                little time for yourself. An expert who listens. A space that
                welcomes you. Care that feels personal.
              </p>
              <p>
                Today, that idea lives in every detail of our Mayfair and
                Chelsea salons, from our thoughtful consultations to the
                products we choose and the cup of tea waiting by your chair.
              </p>
              <p>
                Our promise is simple. Honest advice, expert hands, and a little
                everyday luxury that leaves you feeling like you.
              </p>
              <Link className="text-link" href="/team">
                Meet the people behind Luxe <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
          <div className="grid-3 mt-14">
            {[
              [
                Heart,
                "Care with heart",
                "We listen first, and make every detail personal.",
              ],
              [
                Sparkles,
                "Beautiful expertise",
                "Considered techniques and a team that keeps learning.",
              ],
              [
                Leaf,
                "A thoughtful approach",
                "Products and rituals chosen with intention.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Heart;
              return (
                <div className="reward-card" key={String(title)}>
                  <I className="mx-auto text-gold" />
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </div>
              );
            })}
          </div>
        </>
      );
      break;
    case "gallery":
      eyebrow = "THE LITTLE DETAILS. THE LOVELY MOMENTS.";
      content = <Gallery items={await db.galleryItem.findMany()} />;
      break;
    case "reviews": {
      const rs = await db.review.findMany();
      eyebrow = "THE LOVELIEST KIND OF FEEDBACK";
      content = (
        <>
          <p className="note">
            These illustrative testimonials are fictional demo content. Publish
            genuine customer reviews with permission.
          </p>
          <div className="grid-2">
            {rs.map((r) => (
              <article className="panel" key={r.id}>
                <div className="stars">{"★".repeat(r.rating)}</div>
                <blockquote className="font-serif text-2xl my-5">
                  “{r.text}”
                </blockquote>
                <b className="text-base">{r.name}</b>
                <p className="text-base">{r.service}</p>
              </article>
            ))}
          </div>
        </>
      );
      break;
    }
    case "rewards":
      eyebrow = "THE LUXE CIRCLE";
      description = "A little thank you for making us part of your routine.";
      content = (
        <>
          <div className="grid-3">
            {[
              [
                Heart,
                "Your first little hello",
                "Create your account and start your Luxe story.",
              ],
              [
                Sparkles,
                "Every visit, a little more",
                "Earn one point for every £1 spent on completed salon services.",
              ],
              [
                Gift,
                "A treat, on us",
                "Collect 500 points and ask our team about your £5 salon credit.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Heart;
              return (
                <div key={String(title)} className="reward-card">
                  <I className="mx-auto text-gold" />
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link href="/account" className="btn btn-dark">
              Join the Luxe circle <ArrowUpRight size={15} />
            </Link>
            <p className="note">
              Points appear after your appointment is marked complete.
              Redemption is arranged with the salon team. Points cannot be
              exchanged for cash.
            </p>
          </div>
        </>
      );
      break;
    case "shop":
      eyebrow = "THE LUXE EDIT";
      description =
        "Salon favourites and everyday essentials. Chosen with care, for your rituals at home.";
      content = <ShopBrowser products={await db.product.findMany()} />;
      break;
    case "blog": {
      const posts = await db.blogPost.findMany({
        orderBy: { publishedAt: "desc" },
      });
      eyebrow = "INSPIRATION, THOUGHTFULLY SHARED";
      description =
        "Expert tips, fresh ideas and a little behind the scenes. Make yourself comfortable.";
      content = (
        <div className="grid-3">
          {posts
            .filter(
              (p) =>
                !q.category ||
                p.category.toLowerCase() === q.category.toLowerCase(),
            )
            .map((p) => (
              <article key={p.id}>
                <Link href={`/blog/${p.slug}`} className="card-image">
                  <Image src={p.image} alt={p.title} fill sizes="33vw" />
                </Link>
                <div className="card-body">
                  <Link className="badge" href={`/blog?category=${p.category}`}>
                    {p.category}
                  </Link>
                  <h3>
                    <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                  </h3>
                  <p>{p.excerpt}</p>
                  <Link className="text-link" href={`/blog/${p.slug}`}>
                    Take a little read <ArrowUpRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
        </div>
      );
      break;
    }
    case "faqs": {
      const faqs = await db.faq.findMany();
      eyebrow = "BEFORE YOU SETTLE IN";
      description =
        "A few things you might like to know. And if you need anything else, we’re a call away.";
      content = (
        <div className="prose">
          <div className="faq-list">
            {faqs.map((f, i) => (
              <details key={f.id}>
                <summary>
                  <span className="faq-num">0{i + 1}</span>
                  {f.question}
                  <span className="plus">+</span>
                </summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: safeJson({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faqs.map((f) => ({
                  "@type": "Question",
                  name: f.question,
                  acceptedAnswer: { "@type": "Answer", text: f.answer },
                })),
              }),
            }}
          />
        </div>
      );
      break;
    }
    case "contact":
      eyebrow = "TWO SPACES. ONE WARM WELCOME.";
      description =
        "A question, a new idea, or just a little hello. We’d love to hear from you.";
      content = (
        <>
          <div className="grid-2">
            <ContactForm />
            <div>
              <h2 className="section-title">Your little escape.</h2>
              {branches.map((b) => (
                <div key={b.id} className="panel mb-5">
                  <h3 className="flex items-center gap-2">
                    <MapPin size={18} />
                    {b.name}
                  </h3>
                  <p className="my-3 text-base">{b.address}</p>
                  <a
                    className="flex items-center gap-2 text-base"
                    href={`tel:${b.phone}`}
                  >
                    <Phone size={13} />
                    {b.phone}
                  </a>
                  <p className="text-base mt-3">
                    Monday – Friday: 9am – 7pm
                    <br />
                    Saturday: 9am – 5pm · Sunday: a day to pause
                  </p>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`}
                  >
                    Find your way <ArrowUpRight size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
          <div className="note">
            Branch addresses, phone numbers and email are demo placeholders.
            Update config/site.ts and branch records before launch.
          </div>
          <iframe
            title="Mayfair salon location map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-[350px] border-0 mt-6"
            src="https://maps.google.com/maps?q=Brook%20Street%20London&t=&z=14&ie=UTF8&iwloc=&output=embed"
          />
        </>
      );
      break;
    case "gift-vouchers":
      eyebrow = "SOME GIFTS FEEL A LITTLE MORE PERSONAL";
      description =
        "A fresh look. A favourite ritual. A moment entirely theirs.";
      content = (
        <div className="grid-2">
          <div className="bg-[#343d30] text-ivory p-12 flex flex-col justify-center text-center min-h-[350px]">
            <Gift className="mx-auto text-[#c2ac80]" size={34} />
            <span className="font-serif text-6xl my-7 tracking-[8px]">
              LUXE
            </span>
            <h3>
              A little time.
              <br />
              <em className="text-[#d6c49f]">Entirely yours.</em>
            </h3>
            <small className="mt-7 text-base">THE GIFT OF FEELING GOOD</small>
          </div>
          <VoucherForm />
        </div>
      );
      break;
    case "concerns":
      eyebrow = "WHAT’S ON YOUR MIND?";
      content = (
        <div className="grid-3">
          {[
            ["Dry or tired skin", "skin"],
            ["A fresh hair chapter", "hair"],
            ["Your bridal moment", "makeup"],
            ["Party ready", "makeup"],
            ["A little calm", "spa"],
            ["Everyday confidence", "grooming"],
          ].map(([n, c]) => (
            <Link className="panel" key={n} href={`/services?category=${c}`}>
              <h3>{n}</h3>
              <p className="my-4">
                Let’s find a personal ritual for your needs and your occasion.
              </p>
              <span className="text-link">
                Explore your options <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      );
      break;
    case "html-sitemap":
      content = (
        <div className="legal-links">
          {Object.keys(titles).map((p) => (
            <Link href={`/${p}`} key={p}>
              {p.replaceAll("-", " ")}
            </Link>
          ))}
          <Link href="/booking">Online booking</Link>
          <Link href="/account">Your account</Link>
          <Link href="/cart">Shopping bag</Link>
        </div>
      );
      break;
    default:
      content = (
        <div className="prose">
          <p className="note">
            Draft policy for this demonstration. Replace with business-specific,
            legally reviewed policies before accepting real customers.
          </p>
          {page === "terms" ? (
            <>
              <h2>Your salon appointment</h2>
              <p>
                Appointments are subject to availability and confirmation.
                Arrive a few minutes early so we can begin with a consultation.
                Please tell us about allergies, sensitivities, recent treatments
                or other needs before your visit.
              </p>
              <h2>Changes and cancellations</h2>
              <p>
                You may reschedule or cancel using your secure booking link up
                to 24 hours before the appointment. For later changes, contact
                the salon. Deposits and missed-appointment charges must be
                explained and agreed before payment.
              </p>
              <h2>Prices and consultation</h2>
              <p>
                Prices and durations are shown before booking. Additional work
                will be discussed and agreed with you. Colour services require a
                patch test at least 48 hours before treatment.
              </p>
            </>
          ) : page === "privacy" ? (
            <>
              <h2>Information you share</h2>
              <p>
                We store contact details, appointment information, order records
                and messages so we can provide salon services. Account passwords
                are hashed. Payment details are processed by Stripe and are not
                stored by the salon.
              </p>
              <h2>Your choices</h2>
              <p>
                Newsletter subscription is optional. Contact the salon to
                request access, correction or deletion of personal information,
                or to unsubscribe. Retention periods and the responsible
                business contact must be completed before launch.
              </p>
            </>
          ) : page === "cookie-policy" ? (
            <>
              <h2>Essential cookies and local storage</h2>
              <p>
                Sign-in cookies keep your session secure. Browser storage
                remembers your shopping bag, wishlist and cookie choice. These
                support the features you choose to use.
              </p>
              <h2>External services</h2>
              <p>
                Google Maps, linked social sites and payment providers have
                their own privacy policies. This app does not load advertising
                analytics.
              </p>
            </>
          ) : (
            <>
              <h2>Shop returns</h2>
              <p>
                Contact our team within 14 days of receiving an order to arrange
                a return of eligible unused and unopened goods. Hygiene
                exclusions and your statutory rights apply. Faulty items will be
                handled by the salon team.
              </p>
              <h2>Service concerns</h2>
              <p>
                If something about your visit is not right, please get in touch
                promptly. We will listen and work with you toward a fair
                resolution.
              </p>
              <h2>Refund processing</h2>
              <p>
                Approved refunds are returned through the original payment
                method. Processing time depends on the payment provider and your
                bank. Contact us before returning any item.
              </p>
            </>
          )}
          <h2>Get in touch</h2>
          <p>
            For any question about this policy, contact{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      );
  }
  return (
    <>
      <PageIntro
        eyebrow={eyebrow}
        title={titles[page]}
        description={description}
      />
      <div className="page-content">{content}</div>
      {![
        "terms",
        "privacy",
        "cookie-policy",
        "refund-policy",
        "html-sitemap",
        "contact",
        "gift-vouchers",
      ].includes(page) && <BookingCTA />}
    </>
  );
}
