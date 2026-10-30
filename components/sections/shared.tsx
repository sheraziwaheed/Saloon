import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { money, services } from "@/lib/catalog";
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro">
      <small>{eyebrow}</small>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
export function ServiceCard({
  service: s,
}: {
  service: (typeof services)[number];
}) {
  return (
    <article className="service-card">
      <Link href={`/services/${s.slug}`} className="card-image">
        <Image
          src={s.image}
          alt={s.name}
          fill
          sizes="(max-width: 700px) 100vw, 33vw"
        />
        <span>
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="card-body">
        <h3>
          <Link href={`/services/${s.slug}`}>{s.name}</Link>
        </h3>
        <p>{s.description.split(".")[0]}.</p>
        <div>
          <span>From {money(s.price)}</span>
          <small>
            <Clock size={13} />
            {s.duration} min
          </small>
        </div>
      </div>
    </article>
  );
}
export function BookingCTA() {
  return (
    <section className="booking-cta">
      <small>A MOMENT THAT’S JUST FOR YOU</small>
      <h2>Let’s make time for you.</h2>
      <p>A fresh look, a favourite ritual, a well-deserved pause.</p>
      <Link href="/booking" className="btn btn-dark">
        Find your appointment <ArrowUpRight size={16} />
      </Link>
    </section>
  );
}
