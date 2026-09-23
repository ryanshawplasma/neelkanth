import Link from "next/link";
import { cookies } from "next/headers";
import { CalendarDays, ChevronRight, Search, Sparkles, Sun, Sunset } from "lucide-react";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteIds, getHomeData } from "@/lib/app/queries";
import { CITY_COOKIE } from "@/lib/app/cities";
import { resolveCity } from "@/lib/app/launch";
import { getPanchang, fmtPeriod, fmtTime } from "@/lib/panchang";
import { formatDate, loc, toDateKey } from "@/lib/utils";
import { biText } from "@/lib/app/helpers";
import { EnablePushButton } from "@/components/push-register";
import { BannerCarousel } from "@/components/app/bits";
import { CategoryTile, ContentCard, FestivalCard, Scroller, Section, ServiceCard, TempleCard } from "@/components/app/cards";
import type { BannerData, CategoryData, ContentCardData, FestivalCardData, ServiceCardData, TempleCardData } from "@/lib/app/types";

export default async function HomePage() {
  const { t, locale } = await getT();
  const [user, jar] = await Promise.all([getCurrentUser(), cookies()]);
  const city = await resolveCity(jar.get(CITY_COOKIE)?.value, user?.city);
  const [data, favIds] = await Promise.all([getHomeData(), getFavoriteIds(user?.id)]);
  const p = getPanchang(new Date(), city.lat, city.lng);

  const festivals = [...data.festivals].sort((a, b) => Number(b.major) - Number(a.major) || a.date.localeCompare(b.date));
  const upcoming = (festivals.filter((f) => f.major).length >= 3 ? festivals.filter((f) => f.major) : festivals).slice(0, 3);

  const fav = (s: { id: string }) => favIds.has(s.id);

  return (
    <div className="pb-8 animate-fade-up">
      {/* greeting + search */}
      <section className="px-4 pt-4">
        <h1 className="text-[22px] font-bold leading-tight tracking-tight">
          {user?.name ? t("app.welcomeNamed", { name: user.name.split(" ")[0] }) : t("app.welcome")} 🙏
        </h1>
        <p className="mt-0.5 text-[13px] text-muted">{t("app.welcomeSub")}</p>
        <Link
          href="/search"
          className="mt-3 flex h-11 items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 text-sm text-muted shadow-[var(--shadow)]"
        >
          <Search className="h-4 w-4" />
          {t("common.searchPlaceholder")}
        </Link>
      </section>

      {/* today's panchang strip */}
      <section className="mt-4 px-4">
        <Link href="/panchang" className="block overflow-hidden rounded-2xl gradient-maroon p-3.5 text-white shadow-[var(--shadow)] active:scale-[0.99]">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 opacity-90" />
            <p className="text-[12.5px] font-semibold uppercase tracking-wide opacity-90">{t("app.todayPanchang")}</p>
            <span className="ml-auto text-[11.5px] opacity-80">{formatDate(toDateKey(), locale, { weekday: "short", day: "numeric", month: "short" })}</span>
          </div>
          <p className="mt-2 text-[16px] font-bold leading-tight">
            {biText(p.tithi, locale)} · {biText(p.paksha, locale)}
          </p>
          <p className="mt-0.5 text-[12px] opacity-85">
            {t("common.masa")}: {biText(p.masa.purnimanta, locale)} · {t("common.nakshatra")}: {biText(p.nakshatra, locale)}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-xl bg-white/15 px-2 py-1.5">
              <p className="flex items-center gap-1 opacity-80">
                <Sun className="h-3 w-3" /> {t("common.sunrise")}
              </p>
              <p className="mt-0.5 font-semibold">{fmtTime(p.sunrise, locale)}</p>
            </div>
            <div className="rounded-xl bg-white/15 px-2 py-1.5">
              <p className="flex items-center gap-1 opacity-80">
                <Sunset className="h-3 w-3" /> {t("common.sunset")}
              </p>
              <p className="mt-0.5 font-semibold">{fmtTime(p.sunset, locale)}</p>
            </div>
            <div className="rounded-xl bg-white/15 px-2 py-1.5">
              <p className="opacity-80">{t("common.rahuKaal")}</p>
              <p className="mt-0.5 truncate font-semibold">{fmtPeriod(p.rahuKaal, locale)}</p>
            </div>
          </div>
          <p className="mt-2 flex items-center justify-end gap-0.5 text-[11.5px] font-semibold opacity-90">
            {t("app.fullPanchang")} <ChevronRight className="h-3.5 w-3.5" />
          </p>
        </Link>
      </section>

      {/* upcoming festivals */}
      {upcoming.length > 0 && (
        <Section title={t("app.upcomingFestivals")} subtitle={t("app.upcomingFestivalsSub")} href="/festivals">
          <Scroller>
            {upcoming.map((f) => (
              <div key={f.id} className="w-[168px] shrink-0 snap-start">
                <FestivalCard f={f as FestivalCardData} wide />
                {f.services[0] && (
                  <Link
                    href={`/pooja/${f.services[0].slug}`}
                    className="mt-1.5 block rounded-xl bg-primary-soft px-2 py-1.5 text-center text-[11px] font-semibold text-primary-700"
                  >
                    {t("common.bookNow")}
                  </Link>
                )}
              </div>
            ))}
          </Scroller>
        </Section>
      )}

      {/* banners */}
      <BannerCarousel banners={data.banners as BannerData[]} />

      {/* categories */}
      {data.categories.length > 0 && (
        <Section title={t("app.exploreCategories")} href="/poojas">
          <div className="grid grid-cols-4 gap-1 px-3">
            {data.categories.map((c) => (
              <CategoryTile key={c.slug} c={c as CategoryData} />
            ))}
          </div>
        </Section>
      )}

      {/* featured online poojas */}
      {data.featured.length > 0 && (
        <Section title={t("app.featuredPoojas")} subtitle={t("app.featuredPoojasSub")} href="/poojas?type=ONLINE_POOJA">
          <Scroller>
            {data.featured.map((s) => (
              <ServiceCard key={s.id} s={s as ServiceCardData} favorited={fav(s)} />
            ))}
          </Scroller>
        </Section>
      )}

      {/* trending */}
      {data.trending.length > 0 && (
        <Section title={t("app.trendingNow")} subtitle={t("app.trendingNowSub")} href="/poojas?sort=popular">
          <Scroller>
            {data.trending.map((s) => (
              <ServiceCard key={s.id} s={s as ServiceCardData} favorited={fav(s)} />
            ))}
          </Scroller>
        </Section>
      )}

      {/* chadhava */}
      {data.chadhava.length > 0 && (
        <Section title={t("app.chadhavaAtTemples")} subtitle={t("app.chadhavaAtTemplesSub")} href="/chadhava">
          <Scroller>
            {data.chadhava.map((s) => (
              <ServiceCard key={s.id} s={s as ServiceCardData} favorited={fav(s)} />
            ))}
          </Scroller>
        </Section>
      )}

      {/* temples */}
      {data.temples.length > 0 && (
        <Section
          title={data.localCity ? t("app.templesIn", { city: loc(data.localCity, "name", locale) }) : t("app.famousTemples")}
          subtitle={t("app.famousTemplesSub")}
          href="/temples"
        >
          <Scroller>
            {data.temples.map((tp) => (
              <TempleCard key={tp.id} tpl={tp as TempleCardData} />
            ))}
          </Scroller>
        </Section>
      )}

      {/* pandit at home */}
      {data.atHome.length > 0 && (
        <Section title={t("app.panditAtHomeTitle")} subtitle={t("app.panditAtHomeSub")} href="/poojas?type=PANDIT_AT_HOME">
          <Scroller>
            {data.atHome.map((s) => (
              <ServiceCard key={s.id} s={s as ServiceCardData} favorited={fav(s)} />
            ))}
          </Scroller>
        </Section>
      )}

      {/* astrology CTA */}
      <section className="mt-6 px-4">
        <Link
          href="/astrology"
          className="flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow)] active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl gradient-gold text-2xl">🔮</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold leading-tight">{t("app.astrologyCta")}</span>
            <span className="mt-0.5 block text-[12px] leading-snug text-muted">{t("app.astrologyCtaSub")}</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
        </Link>
      </section>

      {/* jyotishis */}
      {data.astrology.length > 0 && (
        <Section title={t("app.astrologyServices")} href="/astrology">
          <Scroller>
            {data.astrology.map((s) => (
              <ServiceCard key={s.id} s={s as ServiceCardData} favorited={fav(s)} />
            ))}
          </Scroller>
        </Section>
      )}

      {/* library */}
      {data.content.length > 0 && (
        <Section title={t("app.aartiChalisa")} subtitle={t("app.aartiChalisaSub")} href="/library">
          <Scroller>
            {data.content.map((c) => (
              <ContentCard key={c.id} c={c as ContentCardData} />
            ))}
          </Scroller>
        </Section>
      )}

      {/* push + pandit CTA + footer */}
      <section className="mt-7 px-4">
        <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-[var(--shadow)]">
          <p className="text-[14px] font-semibold">{t("app.onbNotifyTitle")}</p>
          <p className="mt-1 text-[12px] text-muted">{t("app.onbNotifySub")}</p>
          <div className="mt-3 flex justify-center">
            <EnablePushButton />
          </div>
        </div>

        <Link
          href="/pandit/register"
          className="mt-4 flex items-center gap-3 overflow-hidden rounded-2xl gradient-kesari p-4 text-white shadow-[var(--shadow)] active:scale-[0.99]"
        >
          <Sparkles className="h-6 w-6 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold leading-tight">{t("app.joinPanditTitle")}</span>
            <span className="mt-0.5 block text-[12px] leading-snug opacity-90">{t("app.joinPanditSub")}</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0" />
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11.5px] text-muted">
          <Link href="/legal/about">{t("common.about")}</Link>
          <span aria-hidden>·</span>
          <Link href="/legal/privacy">{t("common.privacy")}</Link>
          <span aria-hidden>·</span>
          <Link href="/legal/terms">{t("common.terms")}</Link>
          <span aria-hidden>·</span>
          <Link href="/legal/contact">{t("common.contact")}</Link>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">{t("app.footerNote")}</p>
        <p className="mt-1 text-center text-[11px] text-muted">{t("common.poweredBy")}</p>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";
