import { NextResponse } from "next/server";
import { runAllReminders } from "@/lib/reminders";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/reminders
 * Auth: `?secret=CRON_SECRET`, header `x-cron-secret`, `Authorization: Bearer CRON_SECRET`
 * (Vercel Cron sends the bearer form automatically), or a logged-in admin.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const secret = url.searchParams.get("secret") ?? req.headers.get("x-cron-secret") ?? bearer;
  const session = await getSession();
  const authorised = (!!process.env.CRON_SECRET && secret === process.env.CRON_SECRET) || session?.role === "ADMIN";
  if (!authorised) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await runAllReminders();
  return NextResponse.json(result);
}
