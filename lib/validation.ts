import { z } from "zod";
export const email = z
  .string()
  .email()
  .max(254)
  .transform((s) => s.toLowerCase().trim());
export const detailsSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  email,
  phone: z.string().trim().min(7, "Please enter a valid phone number.").max(30),
  notes: z.string().max(1000).optional(),
});
export const bookingSchema = detailsSchema.extend({
  branchId: z.string().min(1),
  serviceIds: z
    .array(z.string())
    .min(1)
    .max(8)
    .refine((a) => new Set(a).size === a.length, "Choose each service once."),
  addOnIds: z.array(z.string()).max(5).default([]),
  staffId: z.string().min(1),
  start: z.string().datetime(),
  coupon: z.string().max(50).optional(),
  voucher: z.string().max(100).optional(),
});
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email,
  password: z.string().min(10, "Use at least 10 characters.").max(128),
});
const postgresUrl = z
  .string()
  .url()
  .refine(
    (value) => /^postgres(?:ql)?:\/\//.test(value),
    "Use a PostgreSQL connection URL.",
  );
export const envSchema = z.object({
  DATABASE_URL: postgresUrl.optional(),
  DATABASE_URL_UNPOOLED: postgresUrl.optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(32).optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
});
