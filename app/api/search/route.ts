import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
export async function GET(r: Request) {
  const q = z
    .string()
    .trim()
    .min(2)
    .max(100)
    .safeParse(new URL(r.url).searchParams.get("q"));
  if (!q.success) return NextResponse.json([]);
  const [services, posts, products] = await Promise.all([
    db.service.findMany({
      where: { active: true, name: { contains: q.data } },
      take: 8,
      select: { name: true, slug: true },
    }),
    db.blogPost.findMany({
      where: { title: { contains: q.data } },
      take: 5,
      select: { title: true, slug: true },
    }),
    db.product.findMany({
      where: { name: { contains: q.data } },
      take: 5,
      select: { name: true, slug: true },
    }),
  ]);
  return NextResponse.json([
    ...services.map((v) => ({ name: v.name, href: `/services/${v.slug}` })),
    ...posts.map((v) => ({ name: v.title, href: `/blog/${v.slug}` })),
    ...products.map((v) => ({ name: v.name, href: `/shop/${v.slug}` })),
  ]);
}
