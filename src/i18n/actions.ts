"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, LOCALE_COOKIE } from "./config";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return;
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  const s = await getSession();
  if (s) await db.user.update({ where: { id: s.uid }, data: { locale } }).catch(() => {});
  revalidatePath("/", "layout");
}
