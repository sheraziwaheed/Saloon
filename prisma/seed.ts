import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import {
  categories,
  services,
  staff,
  branches,
  products,
  reviews,
  faqs,
  posts,
} from "../lib/catalog";
const db = new PrismaClient();
async function main() {
  for (const v of branches)
    await db.branch.upsert({ where: { id: v.id }, update: v, create: v });
  for (const v of categories)
    await db.serviceCategory.upsert({
      where: { id: v.id },
      update: v,
      create: v,
    });
  for (const v of services)
    await db.service.upsert({ where: { id: v.id }, update: v, create: v });
  for (const v of staff) {
    await db.staff.upsert({ where: { id: v.id }, update: v, create: v });
    for (let weekday = 1; weekday <= 6; weekday++)
      await db.staffSchedule.upsert({
        where: { staffId_weekday: { staffId: v.id, weekday } },
        update: {},
        create: {
          staffId: v.id,
          weekday,
          startMinute: 540,
          endMinute: weekday === 6 ? 1020 : 1140,
        },
      });
    for (const s of services)
      await db.staffService.upsert({
        where: { staffId_serviceId: { staffId: v.id, serviceId: s.id } },
        update: {},
        create: { staffId: v.id, serviceId: s.id },
      });
  }
  await db.brand.upsert({
    where: { id: "luxe" },
    update: {},
    create: { id: "luxe", name: "Luxe Rituals" },
  });
  for (const id of ["haircare", "wellness"])
    await db.productCategory.upsert({
      where: { id },
      update: {},
      create: { id, name: id === "haircare" ? "Haircare" : "Skin & Wellness" },
    });
  for (const v of products)
    await db.product.upsert({ where: { id: v.id }, update: v, create: v });
  if (!(await db.review.count())) await db.review.createMany({ data: reviews });
  if (!(await db.faq.count())) await db.faq.createMany({ data: faqs });
  for (const v of posts)
    await db.blogPost.upsert({ where: { id: v.id }, update: v, create: v });
  if (!(await db.galleryItem.count()))
    await db.galleryItem.createMany({
      data: categories.map((c) => ({
        title: c.name,
        image: c.image,
        category: c.id,
      })),
    });
  await db.coupon.upsert({
    where: { code: "WELCOME15" },
    update: {},
    create: { code: "WELCOME15", percent: 15, expires: new Date("2030-12-31") },
  });
  await db.coupon.upsert({
    where: { code: "HELLO10" },
    update: {},
    create: { code: "HELLO10", percent: 10, expires: new Date("2030-12-31") },
  });
  for (const v of [
    { id: "scalp-massage", name: "Scalp massage", price: 1500, duration: 15 },
    {
      id: "conditioning",
      name: "Conditioning boost",
      price: 2000,
      duration: 15,
    },
  ])
    await db.addOn.upsert({ where: { id: v.id }, update: v, create: v });
  // Demo owner exists only when explicitly provisioned with a password.
  if (process.env.SEED_ADMIN_PASSWORD)
    await db.user.upsert({
      where: { email: "owner@luxesalon.example" },
      update: {
        password: await hash(process.env.SEED_ADMIN_PASSWORD, 12),
        emailVerified: new Date(),
      },
      create: {
        email: "owner@luxesalon.example",
        name: "Salon Owner",
        password: await hash(process.env.SEED_ADMIN_PASSWORD, 12),
        emailVerified: new Date(),
        role: "OWNER",
      },
    });
  console.log(
    "Seeded Luxe Salon: 27 services, 6 specialists, 2 branches, 12 products, 6 articles, 10 reviews.",
  );
}
main().finally(() => db.$disconnect());
