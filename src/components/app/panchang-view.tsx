"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Loader2, MapPin, Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { useLoc, useLocale, useT } from "@/i18n/client";
import type { PanchangJson } from "@/lib/panchang";
import type { City } from "@/lib/app/cities";
import { setPanchangCityAction } from "@/lib/app/misc-actions";
import { biText, formatIsoPeriod, formatIsoTime } from "@/lib/app/helpers";
import { cn, addDays, formatDate, fromDateKey, toDateKey } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { FESTIVAL_TYPES, labelOf } from "@/lib/constants";

const CITY_KEY = "dd_panchang_city";

type FestivalLite = { slug: string; nameEn: string; nameHi: string; type: string; date: string; major: boolean };

export function PanchangView({
  initial,
  cities,
  initialCitySlug,
  festivals,
}: {
  initial: PanchangJson;
  cities: City[];
  initialCitySlug: string;
  festivals: FestivalLite[];
}) {
  const t = useT();
  const loc = useLoc();
  const locale = useLocale();
  const [, startAction] = useTransition();

  const [citySlug, setCitySlug] = useState(initialCitySlug);
  const [date, setDate] = useState(initial.date);
  const [data, setData] = useState<PanchangJson>(initial);
  const [loading, setLoading] = useState(false);

  const city = cities.find((c) => c.slug === citySlug) ?? cities[0];

  // restore the last city the devotee picked
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(CITY_KEY) : null;
    if (stored && stored !== initialCitySlug && cities.some((c) => c.slug === stored)) setCitySlug(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (date === initial.date && citySlug === initialCitySlug) {
      setData(initial);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/panchang?date=${date}&lat=${city.lat}&lng=${city.lng}`)
      .then((r) => r.json())
      .then((json: PanchangJson) => {
        if (!cancelled && json && !("error" in json)) setData(json);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [date, citySlug, city.lat, city.lng, initial, initialCitySlug]);

  function pickCity(slug: string) {
    setCitySlug(slug);
    try {
      window.localStorage.setItem(CITY_KEY, slug);
    } catch {
      /* private mode */
    }
    startAction(() => void setPanchangCityAction(slug));
  }

  const shift = (n: number) => setDate(toDateKey(addDays(fromDateKey(date), n)));
  const month = date.slice(0, 7);
  const monthFestivals = festivals.filter((f) => f.date.startsWith(month));

  return (
    <div className="pb-8">
      {/* header */}
      <div className="sticky top-[57px] z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button onClick={() => shift(-1)} aria-label={t("app.prevDay")} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[14.5px] font-bold leading-tight">{formatDate(date, locale, { weekday: "long", day: "numeric", month: "long" })}</p>
            <p className="truncate text-[11px] text-muted">
              {biText(data.masa.purnimanta, locale)} · {t("common.samvat")} {data.samvat.vikram}
            </p>
          </div>
          <button onClick={() => shift(1)} aria-label={t("app.nextDay")} className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            aria-label={t("common.date")}
            className="h-9 flex-1 rounded-xl border border-border bg-surface px-3 text-[12.5px]"
          />
          <button
            onClick={() => setDate(toDateKey())}
            className={cn("h-9 shrink-0 rounded-xl border px-3 text-[12.5px] font-semibold", date === toDateKey() ? "border-primary bg-primary-soft text-primary-700" : "border-border bg-surface")}
          >
            {t("app.jumpToday")}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted" />
          <Select value={citySlug} onChange={(e) => pickCity(e.target.value)} className="h-9 text-[12.5px]" aria-label={t("app.changeCity")}>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {loc(c, "name")}
              </option>
            ))}
          </Select>
          {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted" />}
        </div>
      </div>

      <div className={cn("px-4 pt-4 transition-opacity", loading && "opacity-60")}>
        {/* specials */}
        {(data.special.length > 0 || !data.isAuspiciousDay) && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {data.special.map((s, i) => (
              <Badge key={i} tone="gold">
                {biText(s, locale)}
              </Badge>
            ))}
            <Badge tone={data.isAuspiciousDay ? "success" : "warning"}>{data.isAuspiciousDay ? t("app.auspiciousDay") : t("app.inauspiciousDay")}</Badge>
          </div>
        )}

        {/* main panchang card */}
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)]">
          <div className="gradient-maroon px-4 py-3 text-white">
            <p className="text-[17px] font-bold leading-tight">
              {biText(data.tithi, locale)} · {biText(data.paksha, locale)}
            </p>
            {data.tithi.endsAt && <p className="mt-0.5 text-[11.5px] opacity-85">{t("app.tithiEndsAt", { time: formatIsoTime(data.tithi.endsAt, locale) })}</p>}
          </div>
          <dl className="divide-y divide-border">
            <Item label={t("common.nakshatra")} value={biText(data.nakshatra, locale)} sub={data.nakshatra.endsAt ? t("app.tithiEndsAt", { time: formatIsoTime(data.nakshatra.endsAt, locale) }) : undefined} />
            <Item label={t("common.yoga")} value={biText(data.yoga, locale)} sub={data.yoga.endsAt ? t("app.tithiEndsAt", { time: formatIsoTime(data.yoga.endsAt, locale) }) : undefined} />
            <Item label={t("common.karana")} value={biText(data.karana, locale)} sub={data.karana.endsAt ? t("app.tithiEndsAt", { time: formatIsoTime(data.karana.endsAt, locale) }) : undefined} />
            <Item label={t("app.moonSign")} value={biText(data.rashi, locale)} />
            <Item label={t("app.masaPurnimanta")} value={biText(data.masa.purnimanta, locale)} />
            <Item label={t("app.masaAmanta")} value={biText(data.masa.amanta, locale) + (data.masa.adhik ? " (Adhik)" : "")} />
            <Item label={t("app.ritu")} value={biText(data.ritu, locale)} />
            <Item label={t("common.samvat")} value={String(data.samvat.vikram)} sub={`${t("app.shakaSamvat")} ${data.samvat.shaka}`} />
          </dl>
        </section>

        {/* sun & moon */}
        <section className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">{t("app.sunAndMoon")}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Tile icon={<Sunrise className="h-4 w-4" />} label={t("common.sunrise")} value={formatIsoTime(data.sunrise, locale)} />
            <Tile icon={<Sunset className="h-4 w-4" />} label={t("common.sunset")} value={formatIsoTime(data.sunset, locale)} />
            <Tile icon={<Moon className="h-4 w-4" />} label={t("common.moonrise")} value={formatIsoTime(data.moonrise, locale)} />
            <Tile icon={<Moon className="h-4 w-4" />} label={t("app.moonset")} value={formatIsoTime(data.moonset, locale)} />
          </div>
        </section>

        {/* muhurat */}
        <section className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <h2 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-muted">
            <Sun className="h-3.5 w-3.5" /> {t("app.muhuratSection")}
          </h2>
          <dl className="mt-2 divide-y divide-border">
            <Item label={t("app.brahmaMuhurat")} value={formatIsoPeriod(data.brahmaMuhurat, locale)} tone="success" />
            <Item label={t("common.abhijitMuhurat")} value={formatIsoPeriod(data.abhijit, locale)} tone="success" />
            <Item label={t("common.rahuKaal")} value={formatIsoPeriod(data.rahuKaal, locale)} tone="danger" />
            <Item label={t("app.yamaganda")} value={formatIsoPeriod(data.yamaganda, locale)} tone="danger" />
            <Item label={t("app.gulikaKaal")} value={formatIsoPeriod(data.gulikaKaal, locale)} tone="danger" />
          </dl>
        </section>

        {/* month festivals */}
        <section className="mt-4">
          <h2 className="text-[15px] font-bold tracking-tight">{t("app.monthFestivals")}</h2>
          {monthFestivals.length === 0 ? (
            <p className="mt-2 rounded-2xl border border-dashed border-border p-4 text-center text-[12.5px] text-muted">{t("app.noMonthFestivals")}</p>
          ) : (
            <ul className="mt-2 divide-y divide-border rounded-2xl border border-border bg-surface">
              {monthFestivals.map((f) => (
                <li key={f.slug}>
                  <Link href={`/festivals/${f.slug}`} className="flex items-center gap-3 px-3.5 py-2.5">
                    <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-primary-700">
                      <span className="text-[13px] font-bold leading-none">{Number(f.date.slice(8, 10))}</span>
                      <span className="text-[9px] leading-none">{formatDate(f.date, locale, { month: "short", day: undefined, year: undefined })}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium">{loc(f, "name")}</span>
                      <span className="block text-[11px] text-muted">{labelOf(FESTIVAL_TYPES, f.type, locale)}</span>
                    </span>
                    {f.major && <Badge tone="gold">{t("app.majorBadge")}</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Item({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "success" | "danger" }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 py-2.5">
      <dt className="text-[12.5px] text-muted">{label}</dt>
      <dd className="min-w-0 text-right">
        <span className={cn("block text-[13.5px] font-semibold", tone === "success" && "text-success", tone === "danger" && "text-danger")}>{value}</span>
        {sub && <span className="block text-[11px] text-muted">{sub}</span>}
      </dd>
    </div>
  );
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-[14px] font-bold">{value}</p>
    </div>
  );
}
