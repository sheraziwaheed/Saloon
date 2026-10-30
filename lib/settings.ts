import { z } from "zod";
import { db } from "./db";
export const rulesSchema = z.object({
  leadMinutes: z.number().int().min(0).max(10080).default(60),
  horizonDays: z.number().int().min(1).max(365).default(120),
  cancellationHours: z.number().int().min(0).max(168).default(24),
  depositPence: z.number().int().min(0).max(100000).default(2000),
});
export const templateSchema = z.object({
  confirmationSubject: z
    .string()
    .min(1)
    .max(200)
    .default("Your Luxe moment is booked"),
  confirmationBody: z
    .string()
    .min(1)
    .max(5000)
    .default(
      "Hello {name},\nYour appointment at Luxe {branch} is confirmed for {date}.\nManage your booking: {link}\nChanges require {hours} hours’ notice.",
    ),
  reminderSubject: z
    .string()
    .min(1)
    .max(200)
    .default("A little reminder from Luxe"),
  reminderBody: z
    .string()
    .min(1)
    .max(5000)
    .default(
      "Hello {name}, your salon moment at Luxe {branch} is tomorrow: {date}. We look forward to welcoming you.",
    ),
});
export const businessSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().regex(/^\d+$/).optional(),
});
export const seoSchema = z.object({
  title: z.string().max(100).optional(),
  description: z.string().max(300).optional(),
});
export const offerSchema = z.object({
  enabled: z.boolean().default(true),
  code: z.string().min(1).max(50).default("WELCOME15"),
  text: z.string().max(100).default("Enjoy 15% off with code"),
});
export const settingSchemas = {
  bookingRules: rulesSchema,
  emailTemplates: templateSchema,
  business: businessSchema,
  seoDefaults: seoSchema,
  offers: offerSchema,
};
export async function getSetting<K extends keyof typeof settingSchemas>(
  key: K,
) {
  const row = await db.setting.findUnique({ where: { key } });
  let raw: unknown = {};
  try {
    raw = row ? JSON.parse(row.value) : {};
  } catch {}
  return settingSchemas[key].parse(raw) as z.infer<(typeof settingSchemas)[K]>;
}
export function renderTemplate(
  template: string,
  values: Record<string, string>,
) {
  return template.replace(
    /\{(\w+)\}/g,
    (match, key: string) => values[key] ?? match,
  );
}
