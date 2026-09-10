import type { Locale } from "./config";
import { common } from "./messages/common";
import { app } from "./messages/app";
import { pandit } from "./messages/pandit";
import { admin } from "./messages/admin";

/**
 * Dictionaries are split per module so teams can work in parallel:
 *   common  → src/i18n/messages/common.ts   (shared UI)
 *   app     → src/i18n/messages/app.ts      (devotee app)
 *   pandit  → src/i18n/messages/pandit.ts   (pandit portal)
 *   admin   → src/i18n/messages/admin.ts    (admin console)
 * Keys are addressed as "<module>.<key>", e.g. t("common.bookNow").
 */
type Module = { en: Record<string, string>; hi: Record<string, string> };
const modules: Record<string, Module> = { common, app, pandit, admin };

export type Dictionary = Record<string, Record<string, string>>;

export function getDictionary(locale: Locale): Dictionary {
  const out: Dictionary = {};
  for (const [name, mod] of Object.entries(modules)) {
    // hi falls back to en for any missing key so the UI never shows raw keys
    out[name] = locale === "hi" ? { ...mod.en, ...mod.hi } : { ...mod.en };
  }
  return out;
}

export type TFunction = (key: string, params?: Record<string, string | number>) => string;

export function makeT(dict: Dictionary): TFunction {
  return (key, params) => {
    const dot = key.indexOf(".");
    const mod = dot === -1 ? "common" : key.slice(0, dot);
    const k = dot === -1 ? key : key.slice(dot + 1);
    let s = dict[mod]?.[k];
    if (s === undefined) {
      if (process.env.NODE_ENV !== "production") console.warn(`[i18n] missing key: ${key}`);
      s = k;
    }
    if (params) {
      for (const [p, v] of Object.entries(params)) s = s.replaceAll(`{${p}}`, String(v));
    }
    return s;
  };
}
