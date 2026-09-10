import type { ServiceType } from "@prisma/client";
import { Flower2 } from "lucide-react";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { deityOptions, getFavoriteIds, listServices, templeOptions, type ServiceFilters } from "@/lib/app/queries";
import { db } from "@/lib/db";
import { loc, toDateKey, addDays } from "@/lib/utils";
import { EmptyState } from "@/components/ui/misc";
import { ListControls, type FilterGroup } from "./filters";
import { ServiceRow } from "./cards";
import type { ServiceCardData } from "@/lib/app/types";
import { SERVICE_TYPES, pickBi } from "@/lib/constants";

export type ListSearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

/** Shared catalog screen used by /poojas, /chadhava and /prasad. */
export async function ServiceListPage({
  title,
  subtitle,
  types,
  searchParams,
  typeFilter,
}: {
  title: string;
  subtitle: string;
  types: ServiceType[];
  searchParams: ListSearchParams;
  /** show a "Type" chip that narrows within `types` */
  typeFilter?: boolean;
}) {
  const { t, locale } = await getT();
  const user = await getCurrentUser();

  const selectedType = one(searchParams.type) as ServiceType | undefined;
  const filters: ServiceFilters = {
    type: selectedType && types.includes(selectedType) ? selectedType : types,
    q: one(searchParams.q),
    deity: one(searchParams.deity),
    temple: one(searchParams.temple),
    category: one(searchParams.category),
    festival: one(searchParams.festival),
    sort: one(searchParams.sort) as ServiceFilters["sort"],
  };

  const [services, favIds, deities, temples, festivals] = await Promise.all([
    listServices(filters),
    getFavoriteIds(user?.id),
    deityOptions(types),
    templeOptions(),
    db.festival.findMany({
      where: { active: true, date: { gte: toDateKey(addDays(new Date(), -15)) }, services: { some: { active: true } } },
      select: { slug: true, nameEn: true, nameHi: true },
      orderBy: { date: "asc" },
      take: 20,
    }),
  ]);

  const groups: FilterGroup[] = [];
  if (typeFilter && types.length > 1) {
    groups.push({
      key: "type",
      label: t("app.filterType"),
      options: SERVICE_TYPES.filter((s) => types.includes(s.value as ServiceType)).map((s) => ({ value: s.value, label: pickBi(s.label, locale) })),
    });
  }
  if (deities.length) {
    groups.push({ key: "deity", label: t("app.filterDeity"), options: deities.map((d) => ({ value: d.deityEn, label: loc(d, "deity", locale) })) });
  }
  if (temples.length) {
    groups.push({ key: "temple", label: t("app.filterTemple"), options: temples.map((x) => ({ value: x.slug, label: loc(x, "name", locale) })) });
  }
  if (festivals.length) {
    groups.push({ key: "festival", label: t("app.filterOccasion"), options: festivals.map((f) => ({ value: f.slug, label: loc(f, "name", locale) })) });
  }

  const sorts = [
    { value: "popular", label: t("app.sortPopular") },
    { value: "priceAsc", label: t("app.sortPriceAsc") },
    { value: "priceDesc", label: t("app.sortPriceDesc") },
    { value: "rating", label: t("app.sortRating") },
    { value: "date", label: t("app.sortDate") },
  ];

  return (
    <div className="pb-6">
      <div className="px-4 pt-4">
        <h1 className="text-[20px] font-bold leading-tight tracking-tight">{title}</h1>
        <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
      </div>

      <ListControls groups={groups} sorts={sorts} placeholder={t("common.searchPlaceholder")} />

      {services.length === 0 ? (
        <EmptyState icon={<Flower2 className="h-6 w-6" />} title={t("app.noServices")} hint={t("app.noServicesHint")} />
      ) : (
        <>
          <p className="px-4 pb-2 pt-3 text-[12px] text-muted">{t("app.resultsCount", { n: services.length })}</p>
          <ul className="space-y-3 px-4 animate-fade-up">
            {services.map((s) => (
              <li key={s.id}>
                <ServiceRow s={s as ServiceCardData} favorited={favIds.has(s.id)} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
