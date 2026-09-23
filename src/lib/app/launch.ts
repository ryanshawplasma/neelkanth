import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CITIES, DEFAULT_CITY, cityByName, findCity, isCity, type City } from "./cities";

/** Settings (admin → Settings → Launch city). */
export const LAUNCH_CITY_KEY = "launch_city";
export const LAUNCH_ONLY_KEY = "launch_city_only";

/**
 * Where the app is serving right now.
 * `only` = local mode: the app shows only this city's temples, their poojas and offerings, and
 * temple-independent services (pandit at home, astrology), and takes home visits and deliveries
 * only inside the city. Everything else stays in the database and returns when local mode is off.
 */
export type LaunchScope = { city: City | null; only: boolean; templeIds: string[] };

export const getLaunchScope = cache(async (): Promise<LaunchScope> => {
  const rows = await db.setting.findMany({ where: { key: { in: [LAUNCH_CITY_KEY, LAUNCH_ONLY_KEY] } } });
  const value = (k: string) => rows.find((r) => r.key === k)?.value ?? "";
  const city = findCity(value(LAUNCH_CITY_KEY));
  const only = !!city && value(LAUNCH_ONLY_KEY) === "1";
  if (!city || !only) return { city, only: false, templeIds: [] };

  // Temple cities are free text typed by admins, so match them in code ("bahadurgarh", "बहादुरगढ़"…).
  const temples = await db.temple.findMany({ select: { id: true, city: true } });
  return { city, only, templeIds: temples.filter((t) => isCity(t.city, city)).map((t) => t.id) };
});

/** Services visible in scope: temple-independent ones plus those at the city's temples. */
export function serviceScope(scope: LaunchScope): Prisma.ServiceWhereInput {
  if (!scope.only) return {};
  return { OR: [{ templeId: null }, { templeId: { in: scope.templeIds } }] };
}

export function templeScope(scope: LaunchScope): Prisma.TempleWhereInput {
  return scope.only ? { id: { in: scope.templeIds } } : {};
}

export function isServiceInScope(scope: LaunchScope, templeId: string | null) {
  return !scope.only || templeId === null || scope.templeIds.includes(templeId);
}

/** Addresses for home visits and deliveries must be in the launch city while local mode is on. */
export function isAddressInScope(scope: LaunchScope, cityText: string | null | undefined) {
  return !scope.only || !scope.city || isCity(cityText, scope.city);
}

/**
 * The city shown in the top bar and used for panchang timings:
 * the visitor's own pick, then their profile city, then the launch city, then Delhi.
 */
export async function resolveCity(cookieSlug: string | null | undefined, profileCity: string | null | undefined): Promise<City> {
  const picked = findCity(cookieSlug) ?? cityByName(profileCity);
  if (picked) return picked;
  const scope = await getLaunchScope();
  return scope.city ?? DEFAULT_CITY;
}

export { CITIES };
