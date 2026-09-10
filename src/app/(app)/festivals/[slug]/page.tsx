import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteIds, getFestivalBySlug } from "@/lib/app/queries";
import { FESTIVAL_TYPES, labelOf } from "@/lib/constants";
import { daysUntil, formatDate, loc, locJson } from "@/lib/utils";
import { imageOf } from "@/lib/app/helpers";
import { Badge } from "@/components/ui/badge";
import { EnablePushButton } from "@/components/push-register";
import { BackButton, ShareButton } from "@/components/app/bits";
import { ServiceRow } from "@/components/app/cards";
import type { ServiceCardData } from "@/lib/app/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFestivalBySlug(slug);
  return f ? { title: f.nameEn } : {};
}

export default async function FestivalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t, locale } = await getT();
  const f = await getFestivalBySlug(slug);
  if (!f) notFound();

  const user = await getCurrentUser();
  const favIds = await getFavoriteIds(user?.id);

  const name = loc(f, "name", locale);
  const rituals = locJson<string[]>(f, "rituals", locale, []);
  const d = daysUntil(f.date);

  return (
    <div className="pb-10">
      <div className="relative">
        <div className="aspect-[16/10] w-full bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageOf({ imageUrl: f.imageUrl }, "festivals", f.slug)} alt={name} className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center gap-2 p-3">
          <BackButton fallback="/festivals" />
          <div className="ml-auto">
            <ShareButton title={name} />
          </div>
        </div>
      </div>

      <section className="px-4 pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="primary">{labelOf(FESTIVAL_TYPES, f.type, locale)}</Badge>
          {f.major && <Badge tone="gold">{t("app.majorBadge")}</Badge>}
          {loc(f, "deity", locale) && <Badge tone="muted">{loc(f, "deity", locale)}</Badge>}
        </div>
        <h1 className="mt-2 text-[21px] font-bold leading-tight tracking-tight">{name}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(f.date, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className={`mt-3 rounded-2xl px-4 py-3 text-center ${d <= 0 ? "bg-success-soft text-success" : "gradient-gold text-[#3a2a00]"}`}>
          <p className="text-[22px] font-bold leading-none">
            {d === 0 ? t("common.happeningToday") : d === 1 ? t("common.dayLeft") : d > 0 ? t("common.daysLeft", { n: d }) : t("app.festivalPassed", { date: formatDate(f.date, locale) })}
          </p>
        </div>

        <div className="mt-3 rounded-2xl border border-border bg-surface p-3.5 text-center">
          <p className="text-[13px] font-semibold">{t("app.remindMe")}</p>
          <p className="mt-0.5 text-[11.5px] text-muted">{t("app.remindMeHint")}</p>
          <div className="mt-2.5 flex justify-center">
            <EnablePushButton />
          </div>
        </div>
      </section>

      {loc(f, "description", locale) && (
        <section className="mt-6 px-4">
          <h2 className="text-[17px] font-bold tracking-tight">{t("app.aboutFestival")}</h2>
          <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-foreground/85">{loc(f, "description", locale)}</p>
        </section>
      )}

      {loc(f, "significance", locale) && (
        <section className="mt-6 px-4">
          <h2 className="text-[17px] font-bold tracking-tight">{t("app.significance")}</h2>
          <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-foreground/85">{loc(f, "significance", locale)}</p>
        </section>
      )}

      {rituals.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-[17px] font-bold tracking-tight">{t("app.rituals")}</h2>
          <ul className="mt-3 space-y-2">
            {rituals.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-xl bg-surface-2 px-3 py-2.5 text-[13px] leading-snug">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">{i + 1}</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {f.services.length > 0 && (
        <section className="mt-6">
          <h2 className="px-4 text-[17px] font-bold tracking-tight">{t("app.relatedPoojas")}</h2>
          <ul className="mt-3 space-y-3 px-4">
            {f.services.map((s) => (
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
