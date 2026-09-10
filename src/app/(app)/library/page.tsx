import { BookOpen } from "lucide-react";
import { getT } from "@/i18n/server";
import { contentDeities, listContent } from "@/lib/app/queries";
import { loc } from "@/lib/utils";
import { EmptyState } from "@/components/ui/misc";
import { ChipFilter, ListControls } from "@/components/app/filters";
import { ContentCard } from "@/components/app/cards";
import type { ContentCardData } from "@/lib/app/types";

export const dynamic = "force-dynamic";

const TYPES = ["AARTI", "CHALISA", "MANTRA", "STOTRA", "BHAJAN"] as const;

export default async function LibraryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t, locale } = await getT();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

  const [items, deities] = await Promise.all([
    listContent({ type: one(sp.type), q: one(sp.q), deity: one(sp.deity) }),
    contentDeities(),
  ]);

  return (
    <div className="pb-6">
      <div className="px-4 pt-4">
        <h1 className="text-[20px] font-bold leading-tight tracking-tight">{t("app.libraryTitle")}</h1>
        <p className="mt-0.5 text-[13px] text-muted">{t("app.librarySubtitle")}</p>
      </div>

      <ListControls
        groups={deities.length ? [{ key: "deity", label: t("app.filterDeity"), options: deities.map((d) => ({ value: d.deityEn, label: loc(d, "deity", locale) })) }] : []}
        placeholder={t("app.libraryTitle")}
      />
      <ChipFilter param="type" allLabel={t("common.all")} options={TYPES.map((x) => ({ value: x, label: t(`app.type${x}`) }))} />

      {items.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-6 w-6" />} title={t("app.noContent")} hint={t("app.noContentHint")} />
      ) : (
        <ul className="space-y-2.5 px-4 pt-1 animate-fade-up">
          {items.map((c) => (
            <li key={c.id}>
              <ContentCard c={c as ContentCardData} wide />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
