import { PrismaClient } from "@prisma/client";
import { env } from "./env";
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
export const db =
  globalDb.prisma ??
  new PrismaClient({
    datasources: env.DATABASE_URL
      ? { db: { url: env.DATABASE_URL } }
      : undefined,
  });
if (process.env.NODE_ENV !== "production") globalDb.prisma = db;
