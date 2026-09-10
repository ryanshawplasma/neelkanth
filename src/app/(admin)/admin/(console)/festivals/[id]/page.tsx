import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { FestivalEditor, type FestivalDraft } from "@/components/admin/festival-editor";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { getFestival } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { formatDate, loc, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminEditFestivalPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { t, locale } = await getT();
  const f = await getFestival(id);
  if (!f) notFound();

  const draft: FestivalDraft = {
    id: f.id,
    slug: f.slug,
    nameEn: f.nameEn,
    nameHi: f.nameHi,
    type: f.type,
    date: f.date,
    endDate: f.endDate ?? "",
    deityEn: f.deityEn ?? "",
    deityHi: f.deityHi ?? "",
    descriptionEn: f.descriptionEn ?? "",
    descriptionHi: f.descriptionHi ?? "",
    significanceEn: f.significanceEn ?? "",
    significanceHi: f.significanceHi ?? "",
    ritualsEn: parseJson<string[]>(f.ritualsEn, []),
    ritualsHi: parseJson<string[]>(f.ritualsHi, []),
    imageUrl: f.imageUrl ?? "",
    major: f.major,
    remindDaysBefore: parseJson<number[]>(f.remindDaysBefore, [7, 3, 1, 0]),
    pushEnabled: f.pushEnabled,
    active: f.active,
  };

  return (
    <>
      <AdminPageHeader
        back="/admin/festivals"
        backLabel={t("admin.festivalsTitle")}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {loc(f, "name", locale)}
            {f.major && <Badge tone="gold">{t("admin.major")}</Badge>}
            {!f.active && <Badge tone="muted">{t("common.inactive")}</Badge>}
          </span>
        }
        subtitle={formatDate(f.date, locale)}
      />
      <FestivalEditor
        festival={draft}
        linkedServices={f.services.map((s) => ({ id: s.id, slug: s.slug, name: loc(s, "name", locale) }))}
      />
    </>
  );
}
