import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, Languages as LanguagesIcon, MapPin, Star } from "lucide-react";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteIds, getPanditById } from "@/lib/app/queries";
import { LANGUAGES, PANDIT_CLASSIFICATIONS, SPECIALITIES, labelOf, pickBi } from "@/lib/constants";
import { formatDate, formatINR, loc, parseJson } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, Stars } from "@/components/ui/misc";
import { BackButton, ShareButton } from "@/components/app/bits";
import { ServiceRow } from "@/components/app/cards";
import type { ServiceCardData } from "@/lib/app/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getPanditById(id);
  return p ? { title: p.displayName } : {};
}

export default async function PanditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, locale } = await getT();
  const p = await getPanditById(id);
  if (!p) notFound();

  const user = await getCurrentUser();
  const favIds = await getFavoriteIds(user?.id);

  const name = locale === "hi" && p.displayNameHi ? p.displayNameHi : p.displayName;
  const languages = parseJson<string[]>(p.languages, []);
  const specialities = parseJson<string[]>(p.specialities, []);
  const homeService = p.services.find((ps) => ps.service.type === "PANDIT_AT_HOME") ?? p.services[0];

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-surface/95 px-3 py-2.5 backdrop-blur">
        <BackButton fallback="/pandits" className="bg-transparent shadow-none" />
        <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold">{name}</h1>
        <ShareButton title={name} className="bg-transparent shadow-none" />
      </header>

      <section className="flex flex-col items-center px-4 pt-5 text-center">
        <Avatar src={p.photoUrl} name={p.displayName} size={88} />
        <h2 className="mt-3 text-[19px] font-bold leading-tight">
          {name}
          {p.verified && <span className="ml-1 text-info">✔</span>}
        </h2>
        <p className="mt-1 text-[13px] text-muted">{labelOf(PANDIT_CLASSIFICATIONS, p.classification, locale)}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] text-muted">
          <Stars value={p.ratingAvg} count={p.ratingCount} />
          <span className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5" /> {t("common.experience", { n: p.experienceYears })}
          </span>
          {p.city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {p.city}
            </span>
          )}
        </div>
        {p.completedCount > 0 && <p className="mt-1.5 text-[12px] font-medium text-success">{t("app.poojasDone", { n: p.completedCount })}</p>}
        {p.temple && (
          <Link href={`/temple/${p.temple.slug}`} className="mt-2 text-[12.5px] font-semibold text-primary">
            {loc(p.temple, "name", locale)}
          </Link>
        )}
      </section>

      {(languages.length > 0 || specialities.length > 0) && (
        <section className="mt-5 px-4">
          {languages.length > 0 && (
            <p className="flex flex-wrap items-center gap-1.5 text-[12.5px]">
              <LanguagesIcon className="h-3.5 w-3.5 text-muted" />
              {languages.map((l) => (
                <Badge key={l} tone="muted">
                  {pickBi(LANGUAGES.find((x) => x.value === l)?.label, locale) || l}
                </Badge>
              ))}
            </p>
          )}
          {specialities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {specialities.map((s) => (
                <Badge key={s} tone="primary">
                  {pickBi(SPECIALITIES.find((x) => x.value === s)?.label, locale) || s}
                </Badge>
              ))}
            </div>
          )}
        </section>
      )}

      {loc(p, "bio", locale) && (
        <section className="mt-5 px-4">
          <h3 className="text-[17px] font-bold tracking-tight">{t("app.aboutPandit")}</h3>
          <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-foreground/85">{loc(p, "bio", locale)}</p>
        </section>
      )}

      {p.services.length > 0 && (
        <section className="mt-6">
          <h3 className="px-4 text-[17px] font-bold tracking-tight">{t("app.servicesOffered")}</h3>
          <ul className="mt-3 space-y-3 px-4">
            {p.services.map((ps) => (
              <li key={ps.id} className="relative">
                <ServiceRow s={ps.service as ServiceCardData} favorited={favIds.has(ps.service.id)} />
                {ps.price != null && (
                  <span className="absolute bottom-3 right-10 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                    {formatINR(ps.price, locale)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {p.reviews.length > 0 && (
        <section className="mt-6 px-4">
          <h3 className="text-[17px] font-bold tracking-tight">{t("app.reviewsSection")}</h3>
          <ul className="mt-3 space-y-3">
            {p.reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-surface p-3">
                <div className="flex items-center gap-2.5">
                  <Avatar src={r.user.avatarUrl} name={r.user.name} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{r.user.name ?? t("app.welcome")}</p>
                    <p className="truncate text-[11px] text-muted">
                      {loc(r.service, "name", locale)} · {formatDate(r.createdAt, locale)}
                    </p>
                  </div>
                  <span className="flex items-center gap-0.5 rounded-full bg-success-soft px-2 py-0.5 text-[11.5px] font-bold text-success">
                    {r.rating} <Star className="h-3 w-3 fill-current" />
                  </span>
                </div>
                {r.comment && <p className="mt-2 text-[13px] leading-snug text-foreground/85">{r.comment}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {homeService && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
          <div className="w-full max-w-md border-t border-border bg-surface/95 px-4 pb-safe pt-3 backdrop-blur">
            <Link
              href={`/pooja/${homeService.service.slug}?pandit=${p.id}`}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-[15px] font-semibold text-white"
            >
              {t("app.bookHomePooja")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
