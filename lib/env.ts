import { z } from "zod";
import { envSchema } from "./validation";
export const env = envSchema
  .extend({ SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587) })
  .parse(process.env);
