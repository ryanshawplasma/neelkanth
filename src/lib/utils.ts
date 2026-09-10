import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format integer rupees as ₹1,299 (Indian grouping). */
export function formatINR(amount: number, locale: "en" | "hi" = "en") {
  return new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Safe JSON parse for string[] / object[] columns stored in SQLite. */
export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toJson(value: unknown) {
  return JSON.stringify(value ?? null);
}

/** YYYY-MM-DD in local time. */
export function toDateKey(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

export function daysUntil(dateKey: string, from: Date = new Date()) {
  const target = fromDateKey(dateKey);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}

export function formatDate(key: string | Date, locale: "en" | "hi" = "en", opts?: Intl.DateTimeFormatOptions) {
  const d = typeof key === "string" ? fromDateKey(key) : key;
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(d);
}

export function formatDateTime(d: Date, locale: "en" | "hi" = "en") {
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

/** Human-friendly booking code like DD-2609-7F3K */
export function generateBookingCode() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 4; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return `DD-${yy}${mm}-${rand}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function maskDoc(num: string) {
  const clean = num.replace(/\s|-/g, "");
  if (clean.length <= 4) return clean;
  return "X".repeat(clean.length - 4).replace(/(.{4})/g, "$1-") + clean.slice(-4);
}

export function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = obj[k];
  return out;
}

/** Pick localized field: loc(service, "name", "hi") → service.nameHi ?? service.nameEn */
export function loc<T extends Record<string, unknown>>(obj: T, field: string, locale: "en" | "hi"): string {
  const hi = obj[`${field}Hi`] as string | null | undefined;
  const en = obj[`${field}En`] as string | null | undefined;
  return (locale === "hi" ? hi || en : en || hi) ?? "";
}

export function locJson<T = string[]>(obj: Record<string, unknown>, field: string, locale: "en" | "hi", fallback: T): T {
  const hi = parseJson<T>(obj[`${field}Hi`] as string, fallback);
  const en = parseJson<T>(obj[`${field}En`] as string, fallback);
  const isEmpty = (v: unknown) => Array.isArray(v) && v.length === 0;
  if (locale === "hi") return isEmpty(hi) ? en : hi;
  return isEmpty(en) ? hi : en;
}
