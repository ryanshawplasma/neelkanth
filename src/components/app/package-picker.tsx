"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Users } from "lucide-react";
import { useLoc, useLocale, useT } from "@/i18n/client";
import { cn, formatINR, parseJson } from "@/lib/utils";

export type PackageData = {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  descriptionEn: string | null;
  descriptionHi: string | null;
  price: number;
  compareAtPrice: number | null;
  maxDevotees: number;
  featuresEn: string;
  featuresHi: string;
  popular: boolean;
};

export type AddonData = { id: string; slug: string; nameEn: string; nameHi: string; price: number; imageUrl: string | null };

/**
 * Package radio cards + add-on checkboxes + the sticky "Book now" bar.
 * Keeps the running total in sync and builds the /checkout link.
 */
export function PackagePicker({
  serviceSlug,
  basePrice,
  packages,
  addons,
  ctaLabel,
}: {
  serviceSlug: string;
  basePrice: number;
  packages: PackageData[];
  addons: AddonData[];
  ctaLabel: string;
}) {
  const t = useT();
  const loc = useLoc();
  const locale = useLocale();
  const params = useSearchParams();
  const panditId = params.get("pandit");

  const [pkgSlug, setPkgSlug] = useState(packages.find((p) => p.popular)?.slug ?? packages[0]?.slug ?? "");
  const [picked, setPicked] = useState<string[]>([]);

  const pkg = packages.find((p) => p.slug === pkgSlug);
  const total = useMemo(
    () => (pkg?.price ?? basePrice) + addons.filter((a) => picked.includes(a.slug)).reduce((s, a) => s + a.price, 0),
    [pkg, basePrice, addons, picked],
  );

  const href =
    `/checkout/${serviceSlug}?` +
    new URLSearchParams({
      ...(pkgSlug ? { package: pkgSlug } : {}),
      ...(picked.length ? { addons: picked.join(",") } : {}),
      ...(panditId ? { pandit: panditId } : {}),
    }).toString();

  return (
    <>
      {packages.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-[17px] font-bold tracking-tight">{t("app.packagesSection")}</h2>
          <div className="mt-3 space-y-2.5">
            {packages.map((p) => {
              const on = p.slug === pkgSlug;
              const features = parseJson<string[]>(locale === "hi" ? p.featuresHi : p.featuresEn, []);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPkgSlug(p.slug)}
                  className={cn(
                    "relative block w-full rounded-2xl border-2 bg-surface p-3.5 text-left transition-colors",
                    on ? "border-primary bg-primary-soft/40" : "border-border",
                  )}
                >
                  {p.popular && (
                    <span className="absolute -top-2 right-3 rounded-full gradient-gold px-2 py-0.5 text-[10px] font-bold text-[#3a2a00]">
                      {t("common.popular")}
                    </span>
                  )}
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        on ? "border-primary bg-primary text-white" : "border-border",
                      )}
                    >
                      {on && <Check className="h-3 w-3" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[14.5px] font-semibold leading-tight">{loc(p, "name")}</p>
                        <p className="shrink-0 text-[15px] font-bold">{formatINR(p.price, locale)}</p>
                      </div>
                      {loc(p, "description") && <p className="mt-0.5 text-[12px] leading-snug text-muted">{loc(p, "description")}</p>}
                      <p className="mt-1 flex items-center gap-1 text-[11.5px] text-muted">
                        <Users className="h-3 w-3" /> {p.maxDevotees === 1 ? t("app.oneDevotee") : t("app.upToDevotees", { n: p.maxDevotees })}
                      </p>
                      {features.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {features.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[12px] leading-snug text-foreground/80">
                              <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <p className="mt-1.5 text-[11.5px] text-muted">
                          <span className="line-through">{formatINR(p.compareAtPrice, locale)}</span>{" "}
                          <span className="font-semibold text-success">
                            {Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)}% off
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {addons.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-[17px] font-bold tracking-tight">{t("app.addonsSection")}</h2>
          <div className="mt-3 space-y-2">
            {addons.map((a) => {
              const on = picked.includes(a.slug);
              return (
                <label
                  key={a.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border bg-surface p-2.5 transition-colors",
                    on ? "border-primary bg-primary-soft/40" : "border-border",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setPicked((xs) => (on ? xs.filter((x) => x !== a.slug) : [...xs, a.slug]))}
                    className="h-4.5 w-4.5 shrink-0 rounded border-border accent-primary"
                  />
                  {a.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  )}
                  <span className="min-w-0 flex-1 text-[13.5px] font-medium">{loc(a, "name")}</span>
                  <span className="shrink-0 text-[13.5px] font-semibold">+{formatINR(a.price, locale)}</span>
                </label>
              );
            })}
          </div>
        </section>
      )}

      {/* sticky CTA */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <div className="pointer-events-auto w-full max-w-md border-t border-border bg-surface/95 px-4 pb-safe pt-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-[11px] leading-none text-muted">{t("common.total")}</p>
              <p className="mt-1 text-[18px] font-bold leading-none">{formatINR(total, locale)}</p>
            </div>
            <Link
              href={href}
              className="ml-auto inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-primary px-5 text-[15px] font-semibold text-white shadow-sm active:bg-primary-700"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
