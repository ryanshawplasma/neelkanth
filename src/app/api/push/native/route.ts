import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { nativeEndpoint } from "@/lib/fcm";

export const runtime = "nodejs";

/**
 * The DivyaDham phone app registers its Firebase token here.
 *
 * Stored in PushSubscription beside the browsers' web-push rows, as endpoint
 * `fcm:<token>`, so lib/notify.ts reaches every device a person has with one
 * query and no schema change. `p256dh`/`auth` are web push's keys and mean
 * nothing for a token; they hold "fcm" and the platform so a row explains itself.
 */

const PLATFORMS = new Set(["android", "ios"]);

// FCM tokens are long URL-safe strings; anything else is not one.
const looksLikeToken = (t: unknown): t is string =>
  typeof t === "string" && t.length >= 20 && t.length <= 4096 && /^[A-Za-z0-9_:\-]+$/.test(t);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { token?: unknown; platform?: unknown };
  if (!looksLikeToken(body.token)) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  const platform = typeof body.platform === "string" && PLATFORMS.has(body.platform) ? body.platform : "android";
  const endpoint = nativeEndpoint(body.token);
  await db.pushSubscription.upsert({
    where: { endpoint },
    // A phone that changes hands (one person signs out, another signs in) moves
    // with the person now holding it: the update sets userId.
    create: { userId: session.uid, endpoint, p256dh: "fcm", auth: platform, userAgent: req.headers.get("user-agent") ?? undefined },
    update: { userId: session.uid, auth: platform },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { token?: unknown };
  if (looksLikeToken(body.token)) {
    await db.pushSubscription.deleteMany({ where: { endpoint: nativeEndpoint(body.token), userId: session.uid } });
  }
  return NextResponse.json({ ok: true });
}
