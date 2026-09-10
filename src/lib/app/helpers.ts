/**
 * Small pure helpers for the devotee app. Safe to import from client components.
 */
import type { Locale } from "@/i18n/config";

/** Placeholder art used when a service/temple/festival has no image yet. */
export function fallbackImage(kind: "services" | "temples" | "festivals" | "categories" | "content", seed: string) {
  const hues = [24, 12, 42, 350, 190, 275];
  const h = hues[hash(seed) % hues.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="hsl(${h} 90% 72%)"/><stop offset="100%" stop-color="hsl(${(h + 20) % 360} 72% 46%)"/>
  </linearGradient></defs>
  <rect width="400" height="300" fill="url(#g)"/>
  <g fill="rgba(255,255,255,.85)" transform="translate(200 160)">
    <path d="M0-70 18-30 62-24 31 8l8 44L0 30l-39 22 8-44-31-32 44-6z"/>
  </g>
  <text x="200" y="250" text-anchor="middle" font-family="sans-serif" font-size="18" fill="rgba(255,255,255,.9)">${kind}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** First usable image for a catalog row. */
export function imageOf(row: { coverUrl?: string | null; images?: string | null; imageUrl?: string | null }, kind: Parameters<typeof fallbackImage>[0], seed: string) {
  if (row.coverUrl) return row.coverUrl;
  if (row.imageUrl) return row.imageUrl;
  if (row.images) {
    try {
      const arr = JSON.parse(row.images) as string[];
      if (Array.isArray(arr) && arr[0]) return arr[0];
    } catch {
      /* ignore */
    }
  }
  return fallbackImage(kind, seed);
}

/** Turns any YouTube URL into an embeddable one; returns null for non-YouTube links. */
export function youtubeEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  const m =
    url.match(/youtu\.be\/([\w-]{6,})/) ??
    url.match(/[?&]v=([\w-]{6,})/) ??
    url.match(/youtube\.com\/embed\/([\w-]{6,})/) ??
    url.match(/youtube\.com\/live\/([\w-]{6,})/);
  if (!m) return null;
  return `https://www.youtube.com/embed/${m[1]}?rel=0`;
}

export function mapsUrl(lat?: number | null, lng?: number | null, label?: string) {
  if (lat == null || lng == null) return label ? `https://www.google.com/maps/search/${encodeURIComponent(label)}` : null;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/** "2h ago" / "2 घंटे पहले" */
export function relativeTime(iso: string | Date, locale: Locale = "en") {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const diff = Math.round((d.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { numeric: "auto" });
  if (abs < 60) return rtf.format(Math.round(diff), "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diff / 86400), "day");
  return rtf.format(Math.round(diff / 2592000), "month");
}

/** "HH:mm" → "6:30 AM" */
export function formatSlot(slot: string | null | undefined, locale: Locale = "en") {
  if (!slot) return "";
  const [h, m] = slot.split(":").map(Number);
  if (Number.isNaN(h)) return slot;
  const d = new Date(2000, 0, 1, h, m || 0);
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).format(d);
}

export const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;

/** Verb used on the primary CTA for each service type. */
export function ctaKeyFor(type: string) {
  switch (type) {
    case "CHADHAVA":
      return "common.offerNow";
    case "PRASAD":
      return "app.orderPrasad";
    case "ASTROLOGY":
      return "app.consultNow";
    case "LIVE_DARSHAN":
      return "app.bookDarshan";
    default:
      return "common.bookNow";
  }
}

/** Pick the localized side of a `{ en, hi }` pair (panchang names, constants…). */
export function biText(x: { en: string; hi: string } | null | undefined, locale: Locale): string {
  if (!x) return "";
  return (locale === "hi" ? x.hi || x.en : x.en || x.hi) ?? "";
}

/** "6:30 AM – 8:04 AM" from two ISO strings (client-side twin of `fmtPeriod`). */
export function formatIsoTime(iso: string | null | undefined, locale: Locale = "en") {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

export function formatIsoPeriod(p: { start: string; end: string } | null | undefined, locale: Locale = "en") {
  if (!p) return "—";
  return `${formatIsoTime(p.start, locale)} – ${formatIsoTime(p.end, locale)}`;
}

/** Maps a server-action error code ("dateInPast") to its dictionary key ("app.errDateInPast"). */
export function actionErrorKey(code: string | undefined) {
  if (!code) return "common.somethingWrong";
  return `app.err${code.charAt(0).toUpperCase()}${code.slice(1)}`;
}

export type DevoteeInput = { name: string; gotra?: string; relation?: string };
export type AddonInput = { slug: string; nameEn: string; nameHi: string; price: number };
