"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarDays, Clock3, MapPin, Music4, Radio, Star, Users } from "lucide-react";
import { useLoc, useLocale, useT } from "@/i18n/client";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatINR, daysUntil } from "@/lib/utils";
import { imageOf } from "@/lib/app/helpers";
import { labelOf, PANDIT_CLASSIFICATIONS } from "@/lib/constants";
import type { CategoryData, ContentCardData, FestivalCardData, PanditCardData, ServiceCardData, TempleCardData } from "@/lib/app/types";
import { FavoriteButton } from "./bits";

/* ─────────────────────── layout helpers ─────────────────────── */

/** Horizontal snap scroller used by every home rail. */
export function Scroller({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1", className)}>{children}</div>
  );
}

export function Section({
  title,
  subtitle,
  href,
  children,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const t = useT();
  return (
    <section className={cn("mt-6", className)}>
      <div className="mb-3 flex items-end justify-between gap-3 px-4">
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold leading-tight tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13px] leading-snug text-muted">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="shrink-0 text-[13px] font-semibold text-primary">
            {t("common.viewAll")}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/* ─────────────────────── service ─────────────────────── */

function ServiceMeta({ s }: { s: ServiceCardData }) {
  const loc = useLoc();
  const t = useT();
  const locale = useLocale();
  return (
    <>
      {s.temple && (
        <p className="mt-1 flex items-center gap-1 truncate text-[11.5px] text-muted">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {loc(s.temple, "name")} · {s.temple.city}
          </span>
        </p>
      )}
      {!s.temple && s.durationMin ? (
        <p className="mt-1 flex items-center gap-1 truncate text-[11.5px] text-muted">
          <Clock3 className="h-3 w-3 shrink-0" />
          {t("app.durationLabel", { n: s.durationMin })}
        </p>
      ) : null}
      {s.nextDate && (
        <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] font-medium text-primary-700">
          <CalendarDays className="h-3 w-3 shrink-0" />
          {t("app.nextOn", { date: formatDate(s.nextDate, locale, { day: "numeric", month: "short" }) })}
        </p>
      )}
    </>
  );
}

function PriceRow({ s, className }: { s: ServiceCardData; className?: string }) {
  const t = useT();
  const locale = useLocale();
  return (
    <div className={cn("flex items-baseline gap-1.5", className)}>
      <span className="text-[11px] text-muted">{t("app.fromPrice")}</span>
      <span className="text-[15px] font-bold">{formatINR(s.basePrice, locale)}</span>
      {s.compareAtPrice && s.compareAtPrice > s.basePrice && (
        <span className="text-[11px] text-muted line-through">{formatINR(s.compareAtPrice, locale)}</span>
      )}
    </div>
  );
}

export function ServiceCard({
  s,
  favorited,
  showFavorite = true,
  className,
}: {
  s: ServiceCardData;
  favorited?: boolean;
  showFavorite?: boolean;
  className?: string;
}) {
  const loc = useLoc();
  const t = useT();
  return (
    <Link
      href={`/pooja/${s.slug}`}
      className={cn(
        "group relative w-[228px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)] transition-transform active:scale-[0.98]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageOf(s, "services", s.slug)} alt={loc(s, "name")} className="h-full w-full object-cover" loading="lazy" />
        {s.trending && (
          <span className="absolute left-2 top-2">
            <Badge tone="maroon">{t("common.trending")}</Badge>
          </span>
        )}
        {showFavorite && <FavoriteButton serviceId={s.id} initial={!!favorited} className="absolute right-2 top-2" />}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[2.5em] text-[13.5px] font-semibold leading-tight">{loc(s, "name")}</h3>
        <ServiceMeta s={s} />
        <div className="mt-2 flex items-center justify-between gap-2">
          <PriceRow s={s} />
          <span className="flex items-center gap-0.5 text-[11px] text-muted">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="font-semibold text-foreground">{s.ratingAvg.toFixed(1)}</span>
          </span>
        </div>
        {s.bookingCount > 0 && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-success">
            <Users className="h-3 w-3" /> {t("app.bookedCount", { n: s.bookingCount })}
          </p>
        )}
      </div>
    </Link>
  );
}

/** Full-width row used on listing pages. */
export function ServiceRow({ s, favorited, className }: { s: ServiceCardData; favorited?: boolean; className?: string }) {
  const loc = useLoc();
  const t = useT();
  return (
    <Link
      href={`/pooja/${s.slug}`}
      className={cn("relative flex gap-3 rounded-2xl border border-border bg-surface p-2.5 shadow-[var(--shadow)] active:scale-[0.99]", className)}
    >
      <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-xl bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageOf(s, "services", s.slug)} alt={loc(s, "name")} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="min-w-0 flex-1 pr-9">
        <h3 className="line-clamp-2 text-[14px] font-semibold leading-tight">{loc(s, "name")}</h3>
        <ServiceMeta s={s} />
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <PriceRow s={s} />
          <span className="flex items-center gap-0.5 text-[11px] text-muted">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="font-semibold text-foreground">{s.ratingAvg.toFixed(1)}</span>
            {s.ratingCount > 0 && <span>({s.ratingCount})</span>}
          </span>
        </div>
        {s.bookingCount > 0 && <p className="mt-0.5 text-[11px] text-success">{t("app.bookedCount", { n: s.bookingCount })}</p>}
      </div>
      <FavoriteButton serviceId={s.id} initial={!!favorited} className="absolute right-2 top-2" />
    </Link>
  );
}

/* ─────────────────────── temple ─────────────────────── */

export function TempleCard({ tpl, wide }: { tpl: TempleCardData; wide?: boolean }) {
  const loc = useLoc();
  const t = useT();
  return (
    <Link
      href={`/temple/${tpl.slug}`}
      className={cn(
        "relative shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)] active:scale-[0.98]",
        wide ? "w-full" : "w-[176px]",
      )}
    >
      <div className="relative aspect-[4/3] bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageOf(tpl, "temples", tpl.slug)} alt={loc(tpl, "name")} className="h-full w-full object-cover" loading="lazy" />
        {tpl.liveDarshanUrl && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
            <Radio className="h-3 w-3 animate-pulse" /> {t("app.liveDarshanBadge")}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-1 text-[13.5px] font-semibold leading-tight">{loc(tpl, "name")}</h3>
        <p className="mt-0.5 line-clamp-1 text-[11.5px] text-muted">
          {loc(tpl, "deity") ? `${loc(tpl, "deity")} · ` : ""}
          {tpl.city}
        </p>
      </div>
    </Link>
  );
}

/* ─────────────────────── festival ─────────────────────── */

export function FestivalCard({ f, wide }: { f: FestivalCardData; wide?: boolean }) {
  const loc = useLoc();
  const t = useT();
  const locale = useLocale();
  const d = daysUntil(f.date);
  const countdown = d === 0 ? t("common.happeningToday") : d === 1 ? t("common.dayLeft") : d > 0 ? t("common.daysLeft", { n: d }) : t("app.festivalPassed", { date: formatDate(f.date, locale) });
  return (
    <Link
      href={`/festivals/${f.slug}`}
      className={cn(
        "relative shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)] active:scale-[0.98]",
        wide ? "w-full" : "w-[168px]",
      )}
    >
      <div className="relative aspect-[16/10] bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageOf({ imageUrl: f.imageUrl }, "festivals", f.slug)} alt={loc(f, "name")} className="h-full w-full object-cover" loading="lazy" />
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold",
            d <= 0 ? "bg-success text-white" : d <= 3 ? "bg-danger text-white" : "bg-white/90 text-foreground",
          )}
        >
          {countdown}
        </span>
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-1 text-[13.5px] font-semibold leading-tight">{loc(f, "name")}</h3>
        <p className="mt-0.5 text-[11.5px] text-muted">{formatDate(f.date, locale, { weekday: "short", day: "numeric", month: "short" })}</p>
      </div>
    </Link>
  );
}

/* ─────────────────────── content (aarti / chalisa) ─────────────────────── */

export function ContentCard({ c, wide }: { c: ContentCardData; wide?: boolean }) {
  const loc = useLoc();
  return (
    <Link
      href={`/library/${c.slug}`}
      className={cn(
        "relative flex shrink-0 snap-start items-center gap-3 overflow-hidden rounded-2xl border border-border bg-surface p-2.5 shadow-[var(--shadow)] active:scale-[0.98]",
        wide ? "w-full" : "w-[212px]",
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl gradient-gold text-[#3a2a00]">
        {c.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <Music4 className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0">
        <h3 className="line-clamp-1 text-[13.5px] font-semibold leading-tight">{loc(c, "title")}</h3>
        <p className="mt-0.5 line-clamp-1 text-[11.5px] text-muted">{loc(c, "deity") || c.type}</p>
      </div>
    </Link>
  );
}

/* ─────────────────────── pandit ─────────────────────── */

export function PanditCard({ p, wide, href }: { p: PanditCardData; wide?: boolean; href?: string }) {
  const t = useT();
  const locale = useLocale();
  const loc = useLoc();
  const name = locale === "hi" && p.displayNameHi ? p.displayNameHi : p.displayName;
  void loc;
  return (
    <Link
      href={href ?? `/pandits/${p.id}`}
      className={cn(
        "flex shrink-0 snap-start gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow)] active:scale-[0.99]",
        wide ? "w-full" : "w-[232px] flex-col items-center text-center",
      )}
    >
      {p.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.photoUrl} alt={name} className={cn("rounded-full object-cover", wide ? "h-14 w-14" : "h-16 w-16")} loading="lazy" />
      ) : (
        <span
          className={cn(
            "flex items-center justify-center rounded-full gradient-kesari text-lg font-bold text-white",
            wide ? "h-14 w-14" : "h-16 w-16",
          )}
        >
          {name.slice(0, 1)}
        </span>
      )}
      <div className={cn("min-w-0", wide && "flex-1")}>
        <h3 className="line-clamp-1 text-[14px] font-semibold leading-tight">
          {name}
          {p.verified && <span className="ml-1 text-info">✔</span>}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[11.5px] text-muted">{labelOf(PANDIT_CLASSIFICATIONS, p.classification, locale)}</p>
        <p className="mt-0.5 line-clamp-1 text-[11.5px] text-muted">
          {p.city ? `${p.city} · ` : ""}
          {t("common.experience", { n: p.experienceYears })}
        </p>
        <div className={cn("mt-1 flex items-center gap-1 text-[11px] text-muted", !wide && "justify-center")}>
          <Star className="h-3 w-3 fill-gold text-gold" />
          <span className="font-semibold text-foreground">{p.ratingAvg.toFixed(1)}</span>
          {p.ratingCount > 0 && <span>({p.ratingCount})</span>}
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────── category tile ─────────────────────── */

export function CategoryTile({ c }: { c: CategoryData }) {
  const loc = useLoc();
  return (
    <Link href={`/poojas?category=${c.slug}`} className="flex flex-col items-center gap-1.5 rounded-xl p-1.5 active:scale-95">
      <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary-soft text-xl">
        {c.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span aria-hidden>{c.icon || "🪔"}</span>
        )}
      </span>
      <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight">{loc(c, "name")}</span>
    </Link>
  );
}
