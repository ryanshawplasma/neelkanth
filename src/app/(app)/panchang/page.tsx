import { cookies } from "next/headers";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPanchang, serializePanchang } from "@/lib/panchang";
import { CITIES, CITY_COOKIE, cityByName, cityBySlug } from "@/lib/app/cities";
import { addDays, fromDateKey, toDateKey } from "@/lib/utils";
import { PanchangView } from "@/components/app/panchang-view";

export const dynamic = "force-dynamic";

export default async function PanchangPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t } = await getT();
  const sp = await searchParams;
  const [user, jar] = await Promise.all([getCurrentUser(), cookies()]);
  const city = cityBySlug(jar.get(CITY_COOKIE)?.value ?? cityByName(user?.city)?.slug);

  const dateParam = Array.isArray(sp.date) ? sp.date[0] : sp.date;
  const dateKey = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : toDateKey();

  const festivals = await db.festival.findMany({
    where: { active: true, date: { gte: toDateKey(addDays(new Date(), -200)), lte: toDateKey(addDays(new Date(), 400)) } },
    orderBy: { date: "asc" },
    select: { slug: true, nameEn: true, nameHi: true, type: true, date: true, major: true },
  });

  const panchang = serializePanchang(getPanchang(fromDateKey(dateKey), city.lat, city.lng));

  return (
    <div>
      <div className="px-4 pt-4">
        <h1 className="text-[20px] font-bold leading-tight tracking-tight">{t("app.panchangTitle")}</h1>
      </div>
      <PanchangView initial={panchang} cities={CITIES} initialCitySlug={city.slug} festivals={festivals} />
    </div>
  );
}
