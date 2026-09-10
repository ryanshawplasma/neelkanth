import Link from "next/link";
import { CalendarHeart } from "lucide-react";
import { getT } from "@/i18n/server";
import { listFestivals } from "@/lib/app/queries";
import { FESTIVAL_TYPES, pickBi } from "@/lib/constants";
import { daysUntil, formatDate, loc } from "@/lib/utils";
import { imageOf } from "@/lib/app/helpers";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { ChipFilter } from "@/components/app/filters";

export const dynamic = "force-dynamic";

export default async function FestivalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t, locale } = await getT();
  const sp = await searchParams;
  const type = (Array.isArray(sp.type) ? sp.type[0] : sp.type) ?? "";
  const festivals = await listFestivals(type || undefined);

  const months = new Map<string, typeof festivals>();
  for (const f of festivals) {
    const key = f.date.slice(0, 7);
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(f);
  }

  return (
    <div className="pb-6">
      <div className="px-4 pt-4">
        <h1 className="text-[20px] font-bold leading-tight tracking-tight">{t("app.festivalsTitle")}</h1>
        <p className="mt-0.5 text-[13px] text-muted">{t("app.festivalsSubtitle")}</p>
      </div>

      <div className="sticky top-[57px] z-20 border-b border-border bg-background/95 backdrop-blur">
        <ChipFilter param="type" allLabel={t("common.all")} options={FESTIVAL_TYPES.map((f) => ({ value: f.value, label: pickBi(f.label, locale) }))} />
      </div>

      {festivals.length === 0 ? (
        <EmptyState icon={<CalendarHeart className="h-6 w-6" />} title={t("app.noFestivals")} hint={t("app.noFestivalsHint")} />
      ) : (
        <div className="animate-fade-up">
          {[...months.entries()].map(([month, rows]) => (
            <section key={month} className="mt-4">
              <h2 className="px-4 text-[13px] font-semibold uppercase tracking-wide text-muted">
                {formatDate(`${month}-01`, locale, { month: "long", year: "numeric", day: undefined })}
              </h2>
              <ul className="mt-2 space-y-2.5 px-4">
                {rows.map((f) => {
                  const d = daysUntil(f.date);
                  return (
                    <li key={f.id}>
                      <Link
                        href={`/festivals/${f.slug}`}
                        className={`flex items-center gap-3 rounded-2xl border bg-surface p-2.5 shadow-[var(--shadow)] active:scale-[0.99] ${
                          f.major ? "border-gold" : "border-border"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageOf({ imageUrl: f.imageUrl }, "festivals", f.slug)} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="line-clamp-1 flex-1 text-[14px] font-semibold leading-tight">{loc(f, "name", locale)}</h3>
                            {f.major && <Badge tone="gold">{t("app.majorBadge")}</Badge>}
                          </div>
                          <p className="mt-0.5 text-[11.5px] text-muted">
                            {formatDate(f.date, locale, { weekday: "short", day: "numeric", month: "short" })}
                            {loc(f, "deity", locale) ? ` · ${loc(f, "deity", locale)}` : ""}
                          </p>
                          <p className={`mt-1 text-[11.5px] font-semibold ${d <= 0 ? "text-success" : d <= 3 ? "text-danger" : "text-primary-700"}`}>
                            {d === 0 ? t("common.happeningToday") : d === 1 ? t("common.dayLeft") : d > 0 ? t("common.daysLeft", { n: d }) : t("app.festivalPassed", { date: formatDate(f.date, locale) })}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
