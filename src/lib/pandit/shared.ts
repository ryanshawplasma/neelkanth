/**
 * Pure helpers shared by pandit-portal server code and client components.
 * (No "server-only" here — client components import from this file.)
 */
import type { ServiceType } from "@prisma/client";

/** Service types a pandit can actually perform (catalog rows with requiresPandit). */
export const PANDIT_SERVICE_TYPES = ["ONLINE_POOJA", "PANDIT_AT_HOME", "KATHA", "ASTROLOGY"] as const;
export type PanditServiceType = (typeof PANDIT_SERVICE_TYPES)[number];

/** Booking statuses grouped into the tabs shown on /pandit/bookings. */
export const BOOKING_TABS = ["upcoming", "inprogress", "completed", "cancelled"] as const;
export type BookingTab = (typeof BOOKING_TABS)[number];

export function isBookingTab(v: unknown): v is BookingTab {
  return typeof v === "string" && (BOOKING_TABS as readonly string[]).includes(v);
}

/** What the pandit keeps after platform commission (integer rupees). */
export function netEarning(amountTotal: number, commissionPct: number) {
  const pct = Math.min(100, Math.max(0, commissionPct));
  return Math.round((amountTotal * (100 - pct)) / 100);
}

// ─────────────── validation ───────────────

export const AADHAAR_RE = /^\d{12}$/;
export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export const PINCODE_RE = /^\d{6}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
export const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Doc types that additionally need a (masked) document number. */
export const DOC_NUMBER_TYPES: Record<string, "aadhaar" | "pan"> = {
  AADHAAR_FRONT: "aadhaar",
  PAN: "pan",
};

export function validateDocNumber(kind: "aadhaar" | "pan", raw: string) {
  const clean = raw.replace(/[\s-]/g, "").toUpperCase();
  if (kind === "aadhaar") return AADHAAR_RE.test(clean);
  return PAN_RE.test(clean);
}

// ─────────────── month helpers ───────────────

/** "YYYY-MM" for a date (local time). */
export function monthKey(d: Date = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function isMonthKey(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
}

/** [start, end) Date range covering the given "YYYY-MM". */
export function monthRange(key: string) {
  const [y, m] = key.split("-").map(Number);
  return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1) };
}

export function addMonths(key: string, delta: number) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d);
}

/** Last `n` month keys ending with `endKey` (oldest first). */
export function lastMonths(n: number, endKey = monthKey()) {
  return Array.from({ length: n }, (_, i) => addMonths(endKey, i - (n - 1)));
}

export function monthLabel(key: string, locale: "en" | "hi") {
  const { start } = monthRange(key);
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { month: "short", year: "2-digit" }).format(start);
}

export function monthLabelLong(key: string, locale: "en" | "hi") {
  const { start } = monthRange(key);
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { month: "long", year: "numeric" }).format(start);
}

/** Google Maps link for an at-home booking address. */
export function mapsUrl(parts: (string | null | undefined)[]) {
  const q = parts.filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export type ServiceTypeValue = ServiceType;
