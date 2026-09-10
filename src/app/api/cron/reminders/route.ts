import { NextResponse } from "next/server";
import { runAllReminders } from "@/lib/reminders";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/cron/reminders?secret=CRON_SECRET  (or as a logged-in admin) */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") ?? req.headers.get("x-cron-secret");
  const session = await getSession();
  if (secret !== process.env.CRON_SECRET && session?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runAllReminders();
  return NextResponse.json(result);
}
