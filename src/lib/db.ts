import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Tolerate values pasted into hosting dashboards with their quotes still attached. */
export function datasourceUrl() {
  const raw = (process.env.DATABASE_URL ?? "").trim().replace(/^["']([\s\S]*)["']$/, "$1").trim();
  return raw || undefined;
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: datasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;
