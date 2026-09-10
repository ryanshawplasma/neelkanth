import { UserSearch } from "lucide-react";
import { getT } from "@/i18n/server";
import { listPandits, panditCities } from "@/lib/app/queries";
import { LANGUAGES, PANDIT_CLASSIFICATIONS, pickBi } from "@/lib/constants";
import { EmptyState } from "@/components/ui/misc";
import { ListControls, type FilterGroup } from "@/components/app/filters";
import { PanditCard } from "@/components/app/cards";
import type { PanditCardData } from "@/lib/app/types";

export const dynamic = "force-dynamic";

export default async function PanditsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t, locale } = await getT();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

  const [pandits, cities] = await Promise.all([
    listPandits({
      classification: one(sp.classification),
      city: one(sp.city),
      language: one(sp.language),
      verifiedOnly: one(sp.verified) === "1",
      q: one(sp.q),
    }),
    panditCities(),
  ]);

  const groups: FilterGroup[] = [
    { key: "classification", label: t("app.anyClassification"), options: PANDIT_CLASSIFICATIONS.map((c) => ({ value: c.value, label: pickBi(c.label, locale) })) },
    ...(cities.length ? [{ key: "city", label: t("app.anyCity"), options: cities.map((c) => ({ value: c, label: c })) }] : []),
    { key: "language", label: t("app.anyLanguage"), options: LANGUAGES.map((l) => ({ value: l.value, label: pickBi(l.label, locale) })) },
    { key: "verified", label: t("common.all"), options: [{ value: "1", label: t("app.verifiedOnly") }] },
  ];

  return (
    <div className="pb-6">
      <div className="px-4 pt-4">
        <h1 className="text-[20px] font-bold leading-tight tracking-tight">{t("app.panditsTitle")}</h1>
        <p className="mt-0.5 text-[13px] text-muted">{t("app.panditsSubtitle")}</p>
      </div>

      <ListControls groups={groups} placeholder={t("app.panditsTitle")} />

      {pandits.length === 0 ? (
        <EmptyState icon={<UserSearch className="h-6 w-6" />} title={t("app.noPandits")} hint={t("app.noPanditsHint")} />
      ) : (
        <ul className="space-y-2.5 px-4 pt-3 animate-fade-up">
          {pandits.map((p) => (
            <li key={p.id}>
              <PanditCard p={p as PanditCardData} wide />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
