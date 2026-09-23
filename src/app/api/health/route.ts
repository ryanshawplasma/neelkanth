import { NextResponse } from "next/server";
import { db, datasourceUrl } from "@/lib/db";
import { publicUploadBackend } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXPECTED_ENV = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "CRON_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
  "SMS_PROVIDER",
  "RENFLAIR_API_KEY",
  "PAYMENT_PROVIDER",
  "BLOB_READ_WRITE_TOKEN",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
] as const;

/** Mask anything that looks like credentials inside a URL. */
const mask = (s: string) => s.replace(/(\/\/[^:/@\s]+:)[^@\s]*@/g, "$1***@");

/**
 * GET /api/health — deployment self-check (no secrets are returned).
 * Reports whether the database is reachable and seeded, which optional services are configured,
 * and which expected environment variables are present (names only, plus their length).
 */
export async function GET() {
  const url = datasourceUrl() ?? "";
  const provider = /^postgres(ql)?:\/\//i.test(url) ? "postgresql" : url.startsWith("file:") ? "sqlite" : url ? "unknown" : "unset";
  const host = provider === "postgresql" ? url.replace(/^.*@/, "").replace(/\/.*$/, "") : undefined;

  let database: { ok: true; services: number; users: number; festivals: number } | { ok: false; error: string };
  try {
    const [services, users, festivals] = await Promise.all([db.service.count(), db.user.count(), db.festival.count()]);
    database = { ok: true, services, users, festivals };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const lines = message.split("\n").map((l) => l.trim()).filter(Boolean);
    database = { ok: false, error: mask(lines.slice(-6).join(" | ")).slice(0, 700) };
  }

  const env = Object.fromEntries(
    EXPECTED_ENV.map((k) => {
      const v = process.env[k];
      return [k, v === undefined ? "missing" : v.length === 0 ? "empty" : `set (${v.length} chars${/^["']/.test(v) ? ", starts with a quote" : ""})`];
    }),
  );

  return NextResponse.json(
    {
      ok: database.ok,
      time: new Date().toISOString(),
      database: { provider, host, ...database },
      push: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
      sms: process.env.SMS_PROVIDER === "renflair" && process.env.RENFLAIR_API_KEY ? "renflair" : "console",
      payments: process.env.PAYMENT_PROVIDER === "razorpay" && process.env.RAZORPAY_KEY_ID ? "razorpay" : "mock",
      // Public images; KYC documents always stay private in the database.
      uploads: ({ blob: "vercel-blob", database: "database", disk: "local-disk" } as const)[publicUploadBackend()],
      cron: Boolean(process.env.CRON_SECRET),
      region: process.env.VERCEL_REGION ?? null,
      env,
    },
    { status: database.ok ? 200 : 503 },
  );
}
