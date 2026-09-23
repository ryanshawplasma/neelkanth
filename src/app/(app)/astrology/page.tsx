import { cookies } from "next/headers";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteIds, listConsultations, listJyotishis, listServices } from "@/lib/app/queries";
import { CITY_COOKIE } from "@/lib/app/cities";
import { resolveCity } from "@/lib/app/launch";
import { getPanchang } from "@/lib/panchang";
import { allRashifal } from "@/lib/app/rashifal";
import { CONSULT_TOPICS, pickBi } from "@/lib/constants";
import { formatDate, toDateKey } from "@/lib/utils";
import { ConsultForm, RashifalPanel } from "@/components/app/astrology-bits";
import { PanditCard, Scroller, ServiceRow } from "@/components/app/cards";
import type { PanditCardData, ServiceCardData } from "@/lib/app/types";

export const dynamic = "force-dynamic";

export default async function AstrologyPage() {
  const { t, locale } = await getT();
  const [user, jar] = await Promise.all([getCurrentUser(), cookies()]);
  const city = await resolveCity(jar.get(CITY_COOKIE)?.value, user?.city);
  const p = getPanchang(new Date(), city.lat, city.lng);
  const today = toDateKey();
  const rashifal = allRashifal(today, `${p.nakshatra.index}-${p.tithi.index}`);

  const [jyotishis, services, favIds, consultations] = await Promise.all([
    listJyotishis(8),
    listServices({ type: "ASTROLOGY", take: 12 }),
    getFavoriteIds(user?.id),
    user ? listConsultations(user.id) : Promise.resolve([]),
  ]);

  return (
    <div className="pb-8">
      <div className="px-4 pt-4">
        <h1 className="text-[20px] font-bold leading-tight tracking-tight">{t("app.astrologyTitle")}</h1>
        <p className="mt-0.5 text-[13px] text-muted">{t("app.astrologySubtitle")}</p>
      </div>

      <RashifalPanel items={rashifal} initialRashi={user?.rashi} />

      <section className="mt-6 px-4">
        <h2 className="text-[17px] font-bold tracking-tight">{t("app.askAstrologer")}</h2>
        <p className="mt-0.5 text-[12.5px] text-muted">{t("app.askAstrologerHint")}</p>
        <ConsultForm isLoggedIn={!!user} />
      </section>

      {consultations.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-[17px] font-bold tracking-tight">{t("app.myConsultations")}</h2>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
            {consultations.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-3.5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold">{pickBi(CONSULT_TOPICS.find((x) => x.value === c.topic)?.label, locale) || c.topic}</p>
                  <p className="truncate text-[11.5px] text-muted">{formatDate(c.createdAt, locale)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                  {c.status === "REQUESTED" ? t("app.consultRequested") : c.status === "SCHEDULED" ? t("app.consultScheduled") : c.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {jyotishis.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 px-4 text-[17px] font-bold tracking-tight">{t("app.ourAstrologers")}</h2>
          <Scroller>
            {jyotishis.map((j) => (
              <PanditCard key={j.id} p={j as PanditCardData} />
            ))}
          </Scroller>
        </section>
      )}

      {services.length > 0 && (
        <section className="mt-7">
          <h2 className="px-4 text-[17px] font-bold tracking-tight">{t("app.astrologyServices")}</h2>
          <ul className="mt-3 space-y-3 px-4">
            {services.map((s) => (
              <li key={s.id}>
                <ServiceRow s={s as ServiceCardData} favorited={favIds.has(s.id)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
