import { z } from "zod";
import { db } from "./db";
import { settingSchemas } from "./settings";
const str = z.string().min(1).max(3000);
const id = z.string().min(1).max(100);
const price = z.coerce.number().int().min(0).max(1000000);
const image = z
  .string()
  .url()
  .refine(
    (s) => new URL(s).hostname === "images.unsplash.com",
    "Use an images.unsplash.com image URL.",
  );
export const schemas = {
  assignments: z.object({ staffId: id, serviceId: id }),
  services: z.object({
    id,
    slug: id,
    name: str,
    description: str,
    price,
    duration: z.coerce.number().int().min(15).max(480).multipleOf(15),
    buffer: z.coerce.number().int().min(0).max(60).multipleOf(15).default(15),
    image,
    categoryId: id,
    active: z.boolean().default(true),
  }),
  categories: z.object({ id, name: str, image, description: str }),
  addons: z.object({
    id,
    name: str,
    price,
    duration: z.coerce.number().int().min(15).max(120).multipleOf(15),
  }),
  staff: z.object({ id, name: str, role: str, bio: str, image, branchId: id }),
  branches: z.object({ id, name: str, address: str, phone: str }),
  products: z.object({
    id,
    slug: id,
    name: str,
    description: str,
    price,
    stock: z.coerce.number().int().min(0),
    image,
    categoryId: id,
    brandId: id,
  }),
  coupons: z.object({
    code: id,
    percent: z.coerce.number().int().min(1).max(100),
    expires: z.coerce.date(),
    active: z.boolean().default(true),
  }),
  vouchers: z.object({
    code: id,
    balance: price,
    email: z.string().email(),
    expires: z.coerce.date(),
  }),
  blog: z.object({
    id,
    slug: id,
    title: str,
    excerpt: str,
    content: str,
    category: str,
    image,
    seoTitle: z.string().optional().nullable(),
    seoDescription: z.string().optional().nullable(),
    publishedAt: z.coerce.date().optional(),
  }),
  reviews: z.object({
    id: z.string().optional(),
    name: str,
    rating: z.coerce.number().int().min(1).max(5),
    text: str,
    service: str,
  }),
  gallery: z.object({
    id: z.string().optional(),
    title: str,
    image,
    beforeImage: z.preprocess(
      (v) => (v === "" ? null : v),
      image.optional().nullable(),
    ),
    category: str,
  }),
  faqs: z.object({ id: z.string().optional(), question: str, answer: str }),
  settings: z.object({ key: id, value: z.string().max(10000) }),
  schedules: z.object({
    id: z.string().optional(),
    staffId: id,
    weekday: z.coerce.number().int().min(0).max(6),
    startMinute: z.coerce.number().int().min(0).max(1425).multipleOf(15),
    endMinute: z.coerce.number().int().min(15).max(1440).multipleOf(15),
  }),
  timeoff: z.object({
    id: z.string().optional(),
    staffId: id,
    start: z.coerce.date(),
    end: z.coerce.date(),
  }),
  brands: z.object({ id, name: str }),
  productcategories: z.object({ id, name: str }),
};
export type Entity = keyof typeof schemas;
export async function listEntity(entity: string) {
  switch (entity) {
    case "assignments":
      return db.staffService.findMany();
    case "users":
      return db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          staffId: true,
          emailVerified: true,
        },
      });
    case "services":
      return db.service.findMany();
    case "categories":
      return db.serviceCategory.findMany();
    case "addons":
      return db.addOn.findMany();
    case "staff":
      return db.staff.findMany();
    case "branches":
      return db.branch.findMany();
    case "products":
      return db.product.findMany();
    case "coupons":
      return db.coupon.findMany();
    case "vouchers":
      return db.voucher.findMany();
    case "blog":
      return db.blogPost.findMany();
    case "reviews":
      return db.review.findMany();
    case "gallery":
      return db.galleryItem.findMany();
    case "faqs":
      return db.faq.findMany();
    case "settings":
      return db.setting.findMany({
        where: { NOT: { key: { startsWith: "rate:" } } },
      });
    case "clients":
      return db.client.findMany({
        include: {
          bookings: {
            select: { id: true, start: true, status: true, total: true },
          },
        },
      });
    case "messages":
      return db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    case "subscribers":
      return db.newsletterSubscriber.findMany();
    case "orders":
      return db.order.findMany({
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      });
    case "schedules":
      return db.staffSchedule.findMany();
    case "timeoff":
      return db.timeOff.findMany();
    case "brands":
      return db.brand.findMany();
    case "productcategories":
      return db.productCategory.findMany();
    default:
      throw new Error("Unknown collection.");
  }
}
export async function saveEntity(entity: Entity, raw: unknown) {
  switch (entity) {
    case "assignments": {
      const v = schemas.assignments.parse(raw);
      return db.staffService.upsert({
        where: { staffId_serviceId: v },
        create: v,
        update: v,
      });
    }
    case "services": {
      const v = schemas.services.parse(raw);
      return db.service.upsert({ where: { id: v.id }, create: v, update: v });
    }
    case "categories": {
      const v = schemas.categories.parse(raw);
      return db.serviceCategory.upsert({
        where: { id: v.id },
        create: v,
        update: v,
      });
    }
    case "addons": {
      const v = schemas.addons.parse(raw);
      return db.addOn.upsert({ where: { id: v.id }, create: v, update: v });
    }
    case "staff": {
      const v = schemas.staff.parse(raw);
      return db.staff.upsert({ where: { id: v.id }, create: v, update: v });
    }
    case "branches": {
      const v = schemas.branches.parse(raw);
      return db.branch.upsert({ where: { id: v.id }, create: v, update: v });
    }
    case "products": {
      const v = schemas.products.parse(raw);
      return db.product.upsert({ where: { id: v.id }, create: v, update: v });
    }
    case "coupons": {
      const v = schemas.coupons.parse(raw);
      return db.coupon.upsert({
        where: { code: v.code },
        create: v,
        update: v,
      });
    }
    case "vouchers": {
      const v = schemas.vouchers.parse(raw);
      return db.voucher.upsert({
        where: { code: v.code },
        create: v,
        update: v,
      });
    }
    case "blog": {
      const v = schemas.blog.parse(raw);
      return db.blogPost.upsert({ where: { id: v.id }, create: v, update: v });
    }
    case "reviews": {
      const v = schemas.reviews.parse(raw);
      return v.id
        ? db.review.update({ where: { id: v.id }, data: v })
        : db.review.create({ data: v });
    }
    case "gallery": {
      const v = schemas.gallery.parse(raw);
      return v.id
        ? db.galleryItem.update({ where: { id: v.id }, data: v })
        : db.galleryItem.create({ data: v });
    }
    case "faqs": {
      const v = schemas.faqs.parse(raw);
      return v.id
        ? db.faq.update({ where: { id: v.id }, data: v })
        : db.faq.create({ data: v });
    }
    case "settings": {
      const v = schemas.settings.parse(raw);
      if (v.key in settingSchemas) {
        const key = v.key as keyof typeof settingSchemas;
        v.value = JSON.stringify(
          settingSchemas[key].parse(JSON.parse(v.value)),
        );
      }
      if (
        ![
          "holidays",
          "business",
          "bookingRules",
          "emailTemplates",
          "seoDefaults",
          "offers",
        ].includes(v.key)
      )
        throw new Error("Unsupported setting key.");
      return db.setting.upsert({ where: { key: v.key }, create: v, update: v });
    }
    case "schedules": {
      const v = schemas.schedules.parse(raw);
      if (v.endMinute <= v.startMinute)
        throw new Error("Closing time must follow opening time.");
      return db.staffSchedule.upsert({
        where: { staffId_weekday: { staffId: v.staffId, weekday: v.weekday } },
        create: v,
        update: v,
      });
    }
    case "timeoff": {
      const v = schemas.timeoff.parse(raw);
      if (v.end <= v.start) throw new Error("End must follow start.");
      return v.id
        ? db.timeOff.update({ where: { id: v.id }, data: v })
        : db.timeOff.create({ data: v });
    }
    case "brands": {
      const v = schemas.brands.parse(raw);
      return db.brand.upsert({ where: { id: v.id }, create: v, update: v });
    }
    case "productcategories": {
      const v = schemas.productcategories.parse(raw);
      return db.productCategory.upsert({
        where: { id: v.id },
        create: v,
        update: v,
      });
    }
  }
}
export async function deleteEntity(entity: Entity, id: string) {
  switch (entity) {
    case "assignments": {
      const [staffId, serviceId] = id.split("|");
      return db.staffService.delete({
        where: { staffId_serviceId: { staffId, serviceId } },
      });
    }
    case "services":
      return db.service.update({ where: { id }, data: { active: false } });
    case "categories":
      return db.serviceCategory.delete({ where: { id } });
    case "addons":
      return db.addOn.delete({ where: { id } });
    case "staff":
      return db.staff.delete({ where: { id } });
    case "branches":
      return db.branch.delete({ where: { id } });
    case "products":
      return db.product.delete({ where: { id } });
    case "coupons":
      return db.coupon.delete({ where: { code: id } });
    case "vouchers":
      return db.voucher.delete({ where: { code: id } });
    case "blog":
      return db.blogPost.delete({ where: { id } });
    case "reviews":
      return db.review.delete({ where: { id } });
    case "gallery":
      return db.galleryItem.delete({ where: { id } });
    case "faqs":
      return db.faq.delete({ where: { id } });
    case "settings":
      return db.setting.delete({ where: { key: id } });
    case "schedules":
      return db.staffSchedule.delete({ where: { id } });
    case "timeoff":
      return db.timeOff.delete({ where: { id } });
    case "brands":
      return db.brand.delete({ where: { id } });
    case "productcategories":
      return db.productCategory.delete({ where: { id } });
  }
}
