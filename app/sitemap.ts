import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, posts, products, staff] = await Promise.all([
    db.service.findMany({ where: { active: true }, select: { slug: true } }),
    db.blogPost.findMany({ select: { slug: true } }),
    db.product.findMany({ select: { slug: true } }),
    db.staff.findMany({ select: { id: true } }),
  ]);
  return [
    "",
    "services",
    "pricing",
    "booking",
    "team",
    "about",
    "gallery",
    "reviews",
    "rewards",
    "shop",
    "blog",
    "faqs",
    "contact",
    "gift-vouchers",
    "concerns",
    "terms",
    "privacy",
    "cookie-policy",
    "refund-policy",
    "html-sitemap",
    ...services.map((s) => `services/${s.slug}`),
    ...posts.map((p) => `blog/${p.slug}`),
    ...products.map((p) => `shop/${p.slug}`),
    ...staff.map((s) => `team/${s.id}`),
  ].map((p) => ({
    url: `${site.url}/${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
}
