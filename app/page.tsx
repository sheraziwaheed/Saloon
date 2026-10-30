import Image from "next/image";
import Link from "next/link";
// Keep this page outside the catalogue route group to isolate its client bundle.
import {
  ArrowUpRight,
  Star,
  Sparkles,
  Leaf,
  Heart,
  Scissors,
  ChevronRight,
  MapPin,
} from "lucide-react";
import {
  images,
  categories,
  staff,
  reviews,
  branches,
  money,
  services,
} from "@/lib/catalog";
import { FaqList } from "@/components/sections/faq-list";
export const metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return (
    <>
      <section className="hero">
        <Image
          src={images.hero}
          alt="A light-filled salon with warm wood, elegant mirrors and welcoming styling chairs"
          fill
          priority
          fetchPriority="high"
          decoding="sync"
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="eyebrow">
            <span /> BEAUTY, WITH A PERSONAL TOUCH
          </div>
          <h1>
            A little time.
            <br />
            <em>Entirely yours.</em>
          </h1>
          <p>
            Expert hands. Thoughtful care. A space to slow down
            <br className="desktop" /> and leave feeling like the best version
            of you.
          </p>
          <div className="hero-buttons">
            <Link prefetch={false} href="/booking" className="btn btn-cream">
              Book your moment <ArrowUpRight size={17} />
            </Link>
            <Link prefetch={false} href="/services" className="hero-link">
              Explore our services <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero-rating">
            <div className="avatar-stack">
              {staff.slice(0, 3).map((s) => (
                <Image key={s.id} src={s.image} width={34} height={34} alt="" />
              ))}
            </div>
            <div>
              <div className="stars">
                ★★★★★ <b>4.9/5</b>
              </div>
              <small>
                Loved by our lovely clients <span>· Demo rating</span>
              </small>
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <span>
            HAIR &nbsp; / &nbsp; SKIN &nbsp; / &nbsp; BEAUTY &nbsp; / &nbsp;
            WELLNESS
          </span>
          <span>
            YOUR EVERYDAY, ELEVATED <span className="line" />
          </span>
        </div>
        <span className="hero-side">EST. 2014 — LONDON</span>
      </section>
      <div className="trust-strip">
        <span>
          <Scissors />
          Expert, passionate specialists
        </span>
        <i />
        <span>
          <Star />A reputation for beautiful results
        </span>
        <i />
        <span>
          <Leaf />
          Thoughtfully chosen products
        </span>
        <i />
        <span>
          <Heart />
          Care that’s all about you
        </span>
      </div>
      <section className="section services-section">
        <div className="section-heading">
          <div>
            <small>THE ART OF FEELING GOOD</small>
            <h2>
              Your beauty. <em>Your way.</em>
            </h2>
          </div>
          <div>
            <p>
              From a fresh chapter for your hair to a moment of calm.
              <br />
              Discover a little something that’s just for you.
            </p>
            <Link prefetch={false} href="/services" className="text-link">
              Discover all services <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <div className="category-grid">
          {categories.slice(0, 4).map((c, i) => (
            <Link
              prefetch={false}
              href={`/services?category=${c.id}`}
              className="category-card"
              key={c.id}
            >
              <div className="category-img">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width:700px) 50vw,25vw"
                />
                <span className="category-number">0{i + 1}</span>
              </div>
              <div>
                <h3>{c.name}</h3>
                <ArrowUpRight size={20} />
              </div>
              <p>{c.description}</p>
              <small>
                From{" "}
                {money(
                  Math.min(
                    ...services
                      .filter((s) => s.categoryId === c.id && s.price > 0)
                      .map((s) => s.price),
                  ),
                )}
              </small>
            </Link>
          ))}
        </div>
        <div className="more-rituals">
          <span>More ways to take a little time for yourself</span>
          <Link prefetch={false} href="/services?category=spa">
            Spa & Massage <ArrowUpRight size={14} />
          </Link>
          <Link prefetch={false} href="/services?category=grooming">
            Men’s Grooming <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
      <section className="story-section">
        <div className="story-image">
          <Image
            src={images.salon}
            alt="Thoughtfully designed salon space with a warm and peaceful atmosphere"
            fill
            sizes="50vw"
          />
          {/* <div className="story-tag">
            <span>A little luxury.</span>
            <em>A lot of care.</em>
            <Sparkles size={20} />
          </div> */}
        </div>
        <div className="story-content">
          <small>MORE THAN A SALON</small>
          <h2>
            Come as you are.
            <br />
            <em>Leave feeling you.</em>
          </h2>
          <p>
            We believe feeling good should feel effortless. A warm welcome,
            someone who really listens, and expert care that’s made for you.
          </p>
          <p>
            In our Mayfair and Chelsea salons, we bring a little intention to
            every detail. So you can switch off, settle in, and enjoy your
            moment.
          </p>
          <div className="story-values">
            <span>
              <Sparkles />
              Expertise with heart
            </span>
            <span>
              <Leaf />
              Beauty, thoughtfully
            </span>
          </div>
          <Link prefetch={false} href="/about" className="text-link">
            Get to know Luxe <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <section className="section team-preview">
        <div className="section-heading">
          <div>
            <small>GOOD HANDS. LOVELY PEOPLE.</small>
            <h2>
              A personal touch.
              <br />
              <em>A passionate team.</em>
            </h2>
          </div>
          <Link prefetch={false} className="text-link" href="/team">
            Meet your specialists <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="team-grid">
          {staff.slice(0, 3).map((s) => (
            <Link
              prefetch={false}
              key={s.id}
              href={`/team/${s.id}`}
              className="team-card"
            >
              <div>
                <Image src={s.image} alt={s.name} fill sizes="33vw" />
              </div>
              <h3>
                {s.name}
                <ArrowUpRight size={18} />
              </h3>
              <p>{s.role}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="reviews-section">
        <div className="review-label">
          <small>THE LOVELIEST KIND OF FEEDBACK</small>
          <h2>
            A little love
            <br />
            <em>from our clients.</em>
          </h2>
          <div className="stars">★★★★★</div>
          <p>Stories from the Luxe chair.</p>
          <Link prefetch={false} href="/reviews" className="text-link">
            Read their stories <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="review-grid">
          {reviews.slice(0, 2).map((r) => (
            <article key={r.name}>
              <div className="stars">★★★★★</div>
              <blockquote>“{r.text}”</blockquote>
              <b>{r.name}</b>
              <span>
                {r.service} <small>· Illustrative review</small>
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="welcome-banner">
        <Sparkles size={32} />
        <div>
          <small>YOUR FIRST CHAPTER WITH LUXE</small>
          <h2>A warm welcome. And 15% off.</h2>
          <p>
            Your first visit deserves a little extra. Use code <b>WELCOME15</b>{" "}
            when booking.
          </p>
        </div>
        <Link prefetch={false} href="/booking" className="btn btn-cream">
          Find your first moment <ArrowUpRight size={17} />
        </Link>
      </section>
      <section className="section social-section">
        <div className="section-heading">
          <div>
            <small>A GLIMPSE INTO OUR WORLD</small>
            <h2>
              Everyday moments. <em>A little Luxe.</em>
            </h2>
          </div>
          <Link prefetch={false} href="/gallery" className="text-link">
            Explore the gallery <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="social-grid">
          {[
            images.hair,
            images.nails,
            images.salon,
            images.skin,
            images.makeup,
          ].map((src, i) => (
            <Link prefetch={false} href="/gallery" key={src}>
              <Image
                src={src}
                alt={
                  [
                    "Soft waves and beautiful hair",
                    "A considered manicure",
                    "Inside our salon",
                    "Restorative skincare",
                    "Makeup for your moment",
                  ][i]
                }
                fill
                sizes="20vw"
              />
            </Link>
          ))}
        </div>
      </section>
      <section className="section home-faq">
        <div>
          <small>A LITTLE REASSURANCE</small>
          <h2>
            Before you
            <br />
            <em>settle in.</em>
          </h2>
          <p>A few things you might like to know.</p>
          <Link prefetch={false} href="/faqs" className="text-link">
            All your questions, answered <ArrowUpRight size={16} />
          </Link>
        </div>
        <FaqList limit={4} />
      </section>
      <section className="location-section">
        <div>
          <small>YOUR LITTLE ESCAPE IN THE CITY</small>
          <h2>
            Two spaces.
            <br />
            <em>The same warm welcome.</em>
          </h2>
          <div className="location-grid">
            {branches.map((b) => (
              <div key={b.id}>
                <h3>
                  <MapPin size={17} />
                  {b.name}
                </h3>
                <p>{b.address}</p>
                <Link prefetch={false} href={`/booking?branch=${b.id}`}>
                  Visit {b.name} <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div className="location-image">
          <Image
            src={images.hero}
            alt="Your welcoming London salon"
            fill
            sizes="50vw"
          />
        </div>
      </section>
    </>
  );
}
