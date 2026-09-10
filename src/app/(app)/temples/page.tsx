import { Landmark } from "lucide-react";
import { getT } from "@/i18n/server";
import { listTemples } from "@/lib/app/queries";
import { EmptyState } from "@/components/ui/misc";
import { ListControls } from "@/components/app/filters";
import { TempleCard } from "@/components/app/cards";
import type { TempleCardData } from "@/lib/app/types";

export const dynamic = "force-dynamic";

export default async function TemplesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { t } = await getT();
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const temples = await listTemples(q);

  return (
    <div className="pb-6">
      <div className="px-4 pt-4">
        <h1 className="text-[20px] font-bold leading-tight tracking-tight">{t("app.templesTitle")}</h1>
        <p className="mt-0.5 text-[13px] text-muted">{t("app.templesSubtitle")}</p>
      </div>

      <ListControls groups={[]} placeholder={t("app.templesTitle")} />

      {temples.length === 0 ? (
        <EmptyState icon={<Landmark className="h-6 w-6" />} title={t("app.noTemples")} hint={t("app.noTemplesHint")} />
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pt-3 animate-fade-up">
          {temples.map((tpl) => (
            <TempleCard key={tpl.id} tpl={tpl as TempleCardData} wide />
          ))}
        </div>
      )}
    </div>
  );
}
