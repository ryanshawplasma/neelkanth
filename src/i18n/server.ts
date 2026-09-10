import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { getDictionary, makeT } from "./index";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const v = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : defaultLocale;
}

/** Server-side translator: `const { t, locale } = await getT();` */
export async function getT() {
  const locale = await getLocale();
  return { t: makeT(getDictionary(locale)), locale };
}
