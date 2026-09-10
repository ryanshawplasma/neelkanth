import { Search } from "lucide-react";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteIds, searchAll } from "@/lib/app/queries";
import { EmptyState } from "@/components/ui/misc";
import { ListControls } from "@/components/app/filters";
import { ContentCard, FestivalCard, ServiceRow, TempleCard } from "@/components/app/cards";
import { BackButton } from "@/components/app/bits";
import type { ContentCardData, FestivalCardData, ServiceCardData, TempleCardData } from "@/lib/app/types";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t } = await getT();
  const sp = await searchParams;
  const q = ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim();
  const user = await getCurrentUser();
  const [res, favIds] = await Promise.all([searchAll(q), getFavoriteIds(user?.id)]);
  const empty = !res.services.length && !res.temples.length && !res.festivals.length && !res.content.length;

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-surface/95 px-3 py-2.5 backdrop-blur">
        <BackButton className="bg-transparent shadow-none" />
        <h1 className="flex-1 truncate text-[15px] font-semibold">{t("app.searchTitle")}</h1>
      </header>

      <ListControls groups={[]} placeholder={t("common.searchPlaceholder")} />

      {!q ? (
        <EmptyState icon={<Search className="h-6 w-6" />} title={t("app.searchEmpty")} hint={t("app.searchEmptyHint")} />
      ) : empty ? (
        <EmptyState icon={<Search className="h-6 w-6" />} title={t("common.noResults")} hint={t("common.noResultsHint")} />
      ) : (
        <div className="pt-3 animate-fade-up">
          <p className="px-4 text-[12px] text-muted">{t("app.searchResultsFor", { q })}</p>

          {res.services.length > 0 && (
            <section className="mt-3">
              <h2 className="px-4 text-[15px] font-bold tracking-tight">{t("app.searchServices")}</h2>
              <ul className="mt-2 space-y-3 px-4">
                {res.services.map((s) => (
                  <li key={s.id}>
                    <ServiceRow s={s as ServiceCardData} favorited={favIds.has(s.id)} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {res.temples.length > 0 && (
            <section className="mt-5">
              <h2 className="px-4 text-[15px] font-bold tracking-tight">{t("app.searchTemples")}</h2>
              <div className="mt-2 grid grid-cols-2 gap-3 px-4">
                {res.temples.map((x) => (
                  <TempleCard key={x.id} tpl={x as TempleCardData} wide />
                ))}
              </div>
            </section>
          )}

          {res.festivals.length > 0 && (
            <section className="mt-5">
              <h2 className="px-4 text-[15px] font-bold tracking-tight">{t("app.searchFestivals")}</h2>
              <div className="mt-2 grid grid-cols-2 gap-3 px-4">
                {res.festivals.map((f) => (
                  <FestivalCard key={f.id} f={f as FestivalCardData} wide />
                ))}
              </div>
            </section>
          )}

          {res.content.length > 0 && (
            <section className="mt-5">
              <h2 className="px-4 text-[15px] font-bold tracking-tight">{t("app.searchContent")}</h2>
              <ul className="mt-2 space-y-2.5 px-4">
                {res.content.map((c) => (
                  <li key={c.id}>
                    <ContentCard c={c as ContentCardData} wide />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
