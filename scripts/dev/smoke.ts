/* Route smoke test: signs session cookies for admin / pandit / devotee and fetches every route. */
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(readFileSync(".env", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }));
const secret = new TextEncoder().encode(env.AUTH_SECRET ?? "dev-secret");
const db = new PrismaClient();
const BASE = process.env.BASE ?? "http://localhost:3000";

async function token(uid: string, role: string) {
  return new SignJWT({ uid, role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1d").sign(secret);
}

async function main() {
  const admin = await db.user.findFirstOrThrow({ where: { role: "ADMIN" } });
  const panditUser = await db.user.findFirstOrThrow({ where: { phone: "+919000000001" }, include: { pandit: true } });
  const devotee = await db.user.findFirstOrThrow({ where: { phone: "+919111111111" } });
  const svc = await db.service.findFirstOrThrow({ where: { type: "ONLINE_POOJA" } });
  const chad = await db.service.findFirstOrThrow({ where: { type: "CHADHAVA" } });
  const temple = await db.temple.findFirstOrThrow();
  const fest = await db.festival.findFirstOrThrow({ where: { major: true } });
  const content = await db.contentItem.findFirstOrThrow();
  const booking = await db.booking.findFirstOrThrow({ where: { userId: devotee.id } });
  const pBooking = await db.booking.findFirst({ where: { panditId: panditUser.pandit?.id } });
  const payment = await db.payment.findFirstOrThrow({ where: { status: "PENDING" } }).catch(() => db.payment.findFirstOrThrow());
  const anyUser = devotee;
  const supportThread = await db.supportThread.upsert({ where: { userId: devotee.id }, create: { userId: devotee.id }, update: {} });
  const panditProfile = panditUser.pandit!;

  const cookies = {
    admin: `dd_session=${await token(admin.id, "ADMIN")}`,
    pandit: `dd_session=${await token(panditUser.id, "PANDIT")}`,
    devotee: `dd_session=${await token(devotee.id, "USER")}`,
    anon: "",
  };

  const routes: [string, keyof typeof cookies][] = [
    ["/", "anon"], ["/poojas", "anon"], ["/chadhava", "anon"], ["/prasad", "anon"], ["/astrology", "anon"], [`/pooja/${svc.slug}`, "anon"], [`/pooja/${chad.slug}`, "anon"],
    ["/temples", "anon"], [`/temple/${temple.slug}`, "anon"], ["/panchang", "anon"], ["/panchang?date=2026-11-08", "anon"], ["/festivals", "anon"], [`/festivals/${fest.slug}`, "anon"],
    ["/library", "anon"], [`/library/${content.slug}`, "anon"], ["/pandits", "anon"], [`/pandits/${panditProfile.id}`, "anon"], ["/search?q=shiv", "anon"], ["/login", "anon"], ["/legal/privacy", "anon"], ["/legal/terms", "anon"],
    ["/api/panchang?date=2026-10-11", "anon"], ["/manifest.webmanifest", "anon"], ["/sw.js", "anon"], ["/does-not-exist", "anon"],
    ["/account", "devotee"], ["/bookings", "devotee"], [`/bookings/${booking.id}`, "devotee"], [`/bookings/${booking.id}/receipt`, "devotee"], ["/notifications", "devotee"], [`/checkout/${svc.slug}?package=single`, "devotee"], [`/checkout/${chad.slug}`, "devotee"], [`/pay/${payment.id}`, "devotee"], ["/onboarding", "devotee"],
    ["/pandit/login", "anon"], ["/pandit/register", "pandit"], ["/pandit/dashboard", "pandit"], ["/pandit/kyc", "pandit"], ["/pandit/bookings", "pandit"], [pBooking ? `/pandit/bookings/${pBooking.id}` : "/pandit/bookings", "pandit"], ["/pandit/services", "pandit"], ["/pandit/availability", "pandit"], ["/pandit/earnings", "pandit"], ["/pandit/profile", "pandit"], ["/pandit/reviews", "pandit"], ["/pandit/notifications", "pandit"],
    ["/admin/login", "anon"], ["/admin", "admin"], ["/admin/bookings", "admin"], [`/admin/bookings/${booking.id}`, "admin"], ["/admin/pandits", "admin"], [`/admin/pandits/${panditProfile.id}`, "admin"], ["/admin/users", "admin"], [`/admin/users/${anyUser.id}`, "admin"],
    ["/admin/services", "admin"], ["/admin/services/new", "admin"], [`/admin/services/${svc.id}`, "admin"], ["/admin/categories", "admin"], ["/admin/temples", "admin"], [`/admin/temples/${temple.id}`, "admin"], ["/admin/temples/new", "admin"], ["/admin/festivals", "admin"], [`/admin/festivals/${fest.id}`, "admin"], ["/admin/festivals/new", "admin"],
    ["/admin/content", "admin"], [`/admin/content/${content.id}`, "admin"], ["/admin/content/new", "admin"], ["/admin/banners", "admin"], ["/admin/coupons", "admin"], ["/admin/notifications", "admin"], ["/admin/payments", "admin"], ["/admin/payouts", "admin"], ["/admin/reviews", "admin"], ["/admin/consultations", "admin"], ["/admin/settings", "admin"], ["/admin/audit", "admin"], ["/admin/search?q=ram", "admin"],
    ["/admin", "devotee"], ["/pandit/dashboard", "devotee"], ["/bookings", "anon"],
    // support chat + account switching
    ["/support", "devotee"], [`/support?booking=${booking.id}`, "devotee"], ["/support", "anon"], ["/api/support/messages", "devotee"], ["/api/support/messages?read=1", "devotee"],
    ["/admin/support", "admin"], ["/admin/support?f=all", "admin"], ["/admin/support?f=unread&q=9", "admin"], [`/admin/support/${supportThread.id}`, "admin"], [`/api/admin/support/${supportThread.id}/messages`, "admin"],
    ["/login?add=1", "devotee"], ["/pandit/login?add=1", "pandit"], ["/admin/login?add=1", "admin"],
  ];

  let bad = 0;
  for (const [path, who] of routes) {
    const t0 = Date.now();
    const res = await fetch(BASE + path, { headers: { cookie: cookies[who] }, redirect: "manual" });
    const body = await res.text();
    const ms = Date.now() - t0;
    const loc = res.headers.get("location");
    const errMarks = ["Application error", "Internal Server Error", "Unhandled Runtime Error", "[i18n] missing", "NEXT_NOT_FOUND"].filter((m) => body.includes(m));
    const status = res.status;
    const ok = (status === 200 || status === 307 || status === 308 || (status === 404 && path === "/does-not-exist")) && errMarks.length === 0;
    if (!ok) bad++;
    console.log(`${ok ? "OK " : "BAD"} ${status} ${String(ms).padStart(5)}ms ${who.padEnd(7)} ${path}${loc ? " -> " + loc : ""}${errMarks.length ? " !! " + errMarks.join(",") : ""}`);
  }
  console.log(bad ? `\n${bad} route(s) failed` : "\nALL ROUTES OK");
}
main().finally(() => db.$disconnect());
