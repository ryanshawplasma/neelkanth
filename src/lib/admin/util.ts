/**
 * Pure helpers shared by admin pages, components and actions.
 * No "use server" here — this module exports non-async values on purpose.
 */
import type { Tone } from "@/components/ui/badge";
import { bi, type Bi, BOOKING_STATUSES, KYC_STATUSES } from "@/lib/constants";
import type { Locale } from "@/i18n/config";

export const PAGE_SIZES = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

/** Raw `searchParams` shape given by Next 15 pages. */
export type SearchParams = Record<string, string | string[] | undefined>;

export function sp(params: SearchParams, key: string): string {
  const v = params[key];
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

export type Paging = { page: number; size: number; skip: number; take: number };

export function parsePaging(params: SearchParams, fallbackSize = DEFAULT_PAGE_SIZE): Paging {
  const page = Math.max(1, Number.parseInt(sp(params, "page") || "1", 10) || 1);
  const raw = Number.parseInt(sp(params, "size") || String(fallbackSize), 10) || fallbackSize;
  const size = (PAGE_SIZES as readonly number[]).includes(raw) ? raw : fallbackSize;
  return { page, size, skip: (page - 1) * size, take: size };
}

/** Build "?a=1&b=2" from a params record, dropping empties. */
export function qs(params: Record<string, string | number | undefined | null>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}

/** Keep only the string entries of a searchParams object (for building links). */
export function flatten(params: SearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    const s = Array.isArray(v) ? v[0] : v;
    if (typeof s === "string" && s !== "") out[k] = s;
  }
  return out;
}

const TONES: Record<string, Tone> = {
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
  muted: "muted",
  gold: "gold",
  maroon: "maroon",
};

export function toneOf(list: readonly { value: string; tone?: string }[], value: string | null | undefined): Tone {
  const found = list.find((x) => x.value === value);
  return TONES[found?.tone ?? "muted"] ?? "muted";
}

export const bookingTone = (v: string | null | undefined) => toneOf(BOOKING_STATUSES, v);
export const kycTone = (v: string | null | undefined) => toneOf(KYC_STATUSES, v);

export const PAYMENT_STATUS_TONE: Record<string, Tone> = {
  CREATED: "muted",
  PENDING: "warning",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "info",
};

export const PAYOUT_STATUS_TONE: Record<string, Tone> = { PENDING: "warning", PAID: "success" };

export const CONSULT_STATUS_TONE: Record<string, Tone> = {
  REQUESTED: "warning",
  SCHEDULED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export const CAMPAIGN_STATUS_TONE: Record<string, Tone> = { DRAFT: "muted", SCHEDULED: "info", SENT: "success" };

export const KYC_DOC_STATUS_TONE: Record<string, Tone> = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" };

export const PAYMENT_STATUSES = ["CREATED", "PENDING", "PAID", "FAILED", "REFUNDED"] as const;
export const PAYOUT_STATUSES = ["PENDING", "PAID"] as const;
export const CONSULT_STATUSES = ["REQUESTED", "SCHEDULED", "COMPLETED", "CANCELLED"] as const;
export const CONTENT_TYPES = ["AARTI", "CHALISA", "MANTRA", "STOTRA", "BHAJAN", "KATHA", "ARTICLE"] as const;
export const AUDIENCES = ["ALL", "USERS", "PANDITS", "ONBOARDED", "CITY"] as const;
export const REMIND_OFFSETS = [14, 7, 3, 1, 0] as const;
export const BANNER_PLACEMENTS = ["home", "poojas", "chadhava", "temples", "astrology"] as const;

/** Mask a document number for display: 1234 5678 9012 → XXXX-XXXX-9012 */
export function maskNumber(num?: string | null) {
  if (!num) return "—";
  const clean = num.replace(/[\s-]/g, "");
  if (clean.length <= 4) return clean;
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

export function isPdf(url?: string | null) {
  return !!url && /\.pdf($|\?)/i.test(url);
}

/** ISO datetime → value for <input type="datetime-local"> */
export function toLocalInput(d?: Date | string | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Settings keys managed by /admin/settings */
export const SETTING_KEYS = [
  "app_name",
  "tagline_en",
  "tagline_hi",
  "support_phone",
  "support_email",
  "support_whatsapp",
  "commission_pct",
  "currency",
  "home_notice_en",
  "home_notice_hi",
  "maintenance_banner_en",
  "maintenance_banner_hi",
  "terms_url",
  "privacy_url",
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

export const REMINDERS_LAST_RUN_KEY = "reminders_last_run";

// ─────────────────────────── Bilingual status labels ───────────────────────────
// (BOOKING_STATUSES / KYC_STATUSES live in src/lib/constants.ts; these cover the
//  string-typed statuses that only the console needs.)

export const PAYMENT_STATUS_LABELS: Record<string, Bi> = {
  CREATED: bi("Created", "बनाया गया"),
  PENDING: bi("Pending", "लंबित"),
  PAID: bi("Paid", "भुगतान हुआ"),
  FAILED: bi("Failed", "असफल"),
  REFUNDED: bi("Refunded", "धनवापसी"),
};

export const PAYOUT_STATUS_LABELS: Record<string, Bi> = {
  PENDING: bi("Pending", "लंबित"),
  PAID: bi("Paid", "भुगतान हुआ"),
};

export const CONSULT_STATUS_LABELS: Record<string, Bi> = {
  REQUESTED: bi("Requested", "अनुरोधित"),
  SCHEDULED: bi("Scheduled", "निर्धारित"),
  COMPLETED: bi("Completed", "पूर्ण"),
  CANCELLED: bi("Cancelled", "रद्द"),
};

export const CAMPAIGN_STATUS_LABELS: Record<string, Bi> = {
  DRAFT: bi("Draft", "प्रारूप"),
  SCHEDULED: bi("Scheduled", "निर्धारित"),
  SENT: bi("Sent", "भेजा गया"),
};

export const DOC_STATUS_LABELS: Record<string, Bi> = {
  PENDING: bi("Pending", "लंबित"),
  APPROVED: bi("Approved", "स्वीकृत"),
  REJECTED: bi("Rejected", "अस्वीकृत"),
};

export const CONTENT_TYPE_LABELS: Record<string, Bi> = {
  AARTI: bi("Aarti", "आरती"),
  CHALISA: bi("Chalisa", "चालीसा"),
  MANTRA: bi("Mantra", "मंत्र"),
  STOTRA: bi("Stotra", "स्तोत्र"),
  BHAJAN: bi("Bhajan", "भजन"),
  KATHA: bi("Katha", "कथा"),
  ARTICLE: bi("Article", "लेख"),
};

export const AUDIENCE_LABELS: Record<string, Bi> = {
  ALL: bi("Everyone", "सभी"),
  USERS: bi("Devotees only", "केवल भक्त"),
  PANDITS: bi("Pandits only", "केवल पंडित"),
  ONBOARDED: bi("Onboarded users", "पंजीकृत उपयोगकर्ता"),
  CITY: bi("By city", "शहर अनुसार"),
};

export const CONSULT_MODES: Record<string, Bi> = {
  chat: bi("Chat", "चैट"),
  call: bi("Call", "कॉल"),
  video: bi("Video", "वीडियो"),
};

export function labelFrom(map: Record<string, Bi>, value: string | null | undefined, locale: Locale) {
  const b = value ? map[value] : undefined;
  return b ? b[locale] || b.en : (value ?? "—");
}

/** Options for a <Select> built from a Bi map. */
export function optionsFrom(map: Record<string, Bi>, locale: Locale) {
  return Object.entries(map).map(([value, b]) => ({ value, label: b[locale] || b.en }));
}

/** Options for a <Select> built from a constants list ({ value, label: Bi }). */
export function optionsFromList(list: readonly { value: string; label: Bi }[], locale: Locale) {
  return list.map((x) => ({ value: x.value, label: x.label[locale] || x.label.en }));
}

/** `2026-09-10T14:03` (datetime-local) → Date, else null. */
export function fromLocalInput(v?: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Number → INR-ish compact string for KPI tiles (₹1.2L, ₹18.4K). */
export function compactINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

/**
 * Mirrors the state machine in `src/lib/bookings.ts` so the console can show
 * only the transitions that will actually be accepted.
 */
export const BOOKING_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED", "FAILED"],
  CONFIRMED: ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REFUNDED"],
  ASSIGNED: ["IN_PROGRESS", "COMPLETED", "CANCELLED", "REFUNDED", "CONFIRMED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: ["REFUNDED"],
  REFUNDED: [],
  FAILED: ["PENDING_PAYMENT", "CANCELLED"],
};

/** Common `href` targets offered by the notification composer. */
export const HREF_PRESETS = [
  { value: "/", label: bi("Home", "होम") },
  { value: "/poojas", label: bi("All poojas", "सभी पूजाएँ") },
  { value: "/chadhava", label: bi("Chadhava", "चढ़ावा") },
  { value: "/temples", label: bi("Temples", "मंदिर") },
  { value: "/festivals", label: bi("Festivals", "त्योहार") },
  { value: "/panchang", label: bi("Panchang", "पंचांग") },
  { value: "/library", label: bi("Library", "पुस्तकालय") },
  { value: "/astrology", label: bi("Astrology", "ज्योतिष") },
  { value: "/bookings", label: bi("My bookings", "मेरी बुकिंग") },
] as const;
