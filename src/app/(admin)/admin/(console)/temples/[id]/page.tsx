import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { TempleEditor, type TempleDraft } from "@/components/admin/temple-editor";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { getTemple } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { loc, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminEditTemplePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { t, locale } = await getT();
  const temple = await getTemple(id);
  if (!temple) notFound();

  const draft: TempleDraft = {
    id: temple.id,
    slug: temple.slug,
    nameEn: temple.nameEn,
    nameHi: temple.nameHi,
    deityEn: temple.deityEn ?? "",
    deityHi: temple.deityHi ?? "",
    city: temple.city,
    state: temple.state,
    descriptionEn: temple.descriptionEn ?? "",
    descriptionHi: temple.descriptionHi ?? "",
    historyEn: temple.historyEn ?? "",
    historyHi: temple.historyHi ?? "",
    images: parseJson<string[]>(temple.images, []),
    latitude: temple.latitude,
    longitude: temple.longitude,
    timings: temple.timings ?? "",
    liveDarshanUrl: temple.liveDarshanUrl ?? "",
    featured: temple.featured,
    active: temple.active,
  };

  return (
    <>
      <AdminPageHeader
        back="/admin/temples"
        backLabel={t("admin.templesTitle")}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {loc(temple, "name", locale)}
            {temple.featured && <Badge tone="gold">{t("common.featured")}</Badge>}
            {!temple.active && <Badge tone="muted">{t("common.inactive")}</Badge>}
          </span>
        }
        subtitle={`${temple.city}, ${temple.state} · ${t("admin.servicesCount", { n: temple._count.services })} · ${t("admin.bookingCountInfo", { n: temple._count.bookings })}`}
      />
      <TempleEditor temple={draft} />
    </>
  );
}
