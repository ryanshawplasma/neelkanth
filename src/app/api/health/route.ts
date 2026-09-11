import { NextResponse } from "next/server";
import { db, datasourceUrl } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health — deployment self-check (no secrets are returned).
 * Reports whether the database is reachable and seeded, plus which optional services are configured.
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
    database = { ok: false, error: message.replace(/\/\/[^@]*@/g, "//***@").split("\n").slice(0, 3).join(" ").slice(0, 400) };
  }

  return NextResponse.json(
    {
      ok: database.ok,
      time: new Date().toISOString(),
      database: { provider, host, ...database },
      push: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
      sms: process.env.SMS_PROVIDER === "renflair" && process.env.RENFLAIR_API_KEY ? "renflair" : "console",
      payments: process.env.PAYMENT_PROVIDER === "razorpay" && process.env.RAZORPAY_KEY_ID ? "razorpay" : "mock",
      uploads: process.env.BLOB_READ_WRITE_TOKEN ? "vercel-blob" : process.env.VERCEL ? "unconfigured" : "local-disk",
      cron: Boolean(process.env.CRON_SECRET),
      region: process.env.VERCEL_REGION ?? null,
    },
    { status: database.ok ? 200 : 503 },
  );
}
