"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import { makeT, type Dictionary, type TFunction } from "./index";

type Ctx = { locale: Locale; dict: Dictionary; t: TFunction };
const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ locale, dict, children }: { locale: Locale; dict: Dictionary; children: ReactNode }) {
  const value = useMemo(() => ({ locale, dict, t: makeT(dict) }), [locale, dict]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  return ctx?.locale ?? "en";
}

/** Client-side translator: `const t = useT(); t("common.bookNow")` */
export function useT(): TFunction {
  const ctx = useContext(LocaleContext);
  if (!ctx) return (k) => k;
  return ctx.t;
}

/** Pick localized field from a DB row on the client: useLoc()(service, "name") */
export function useLoc() {
  const locale = useLocale();
  return (obj: Record<string, unknown>, field: string) => {
    const hi = obj[`${field}Hi`] as string | null | undefined;
    const en = obj[`${field}En`] as string | null | undefined;
    return (locale === "hi" ? hi || en : en || hi) ?? "";
  };
}
