import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { services, posts, products, staff } from "@/lib/catalog";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
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
