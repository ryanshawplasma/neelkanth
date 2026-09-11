import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);

/**
 * Resolve the datasource URL:
 *  - tolerate values pasted into hosting dashboards with their quotes still attached
 *  - on serverless hosts, use Supabase's transaction pooler (port 6543, pgbouncer mode) instead of
 *    the session pooler, which caps at 15 clients and is exhausted by parallel function instances,
 *    and keep one connection per function instance (Prisma's serverless recommendation)
 */
export function datasourceUrl() {
  const raw = (process.env.DATABASE_URL ?? "").trim().replace(/^["']([\s\S]*)["']$/, "$1").trim();
  if (!raw) return undefined;
  if (!SERVERLESS || !/^postgres(ql)?:\/\//i.test(raw)) return raw;
  try {
    const u = new URL(raw);
    if (u.hostname.endsWith(".pooler.supabase.com") && u.port === "5432") {
      u.port = "6543";
      u.searchParams.set("pgbouncer", "true");
    }
    if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "1");
    if (u.hostname.endsWith(".supabase.com") && !u.searchParams.has("sslmode")) u.searchParams.set("sslmode", "require");
    return u.toString();
  } catch {
    return raw;
  }
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: datasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;
