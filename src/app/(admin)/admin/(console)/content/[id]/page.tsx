import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { ContentEditor, type ContentDraft } from "@/components/admin/content-editor";
import { requireAdmin } from "@/lib/auth";
import { getContentItem } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { CONTENT_TYPE_LABELS, labelFrom } from "@/lib/admin/util";
import { loc, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminEditContentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { t, locale } = await getT();
  const item = await getContentItem(id);
  if (!item) notFound();

  const draft: ContentDraft = {
    id: item.id,
    slug: item.slug,
    type: item.type,
    titleEn: item.titleEn,
    titleHi: item.titleHi,
    deityEn: item.deityEn ?? "",
    deityHi: item.deityHi ?? "",
    bodyHi: item.bodyHi,
    bodyEn: item.bodyEn ?? "",
    audioUrl: item.audioUrl ?? "",
    imageUrl: item.imageUrl ?? "",
    tags: parseJson<string[]>(item.tags, []),
    featured: item.featured,
    active: item.active,
  };

  return (
    <>
      <AdminPageHeader
        back="/admin/content"
        backLabel={t("admin.contentLibraryTitle")}
        title={loc(item, "title", locale)}
        subtitle={`${labelFrom(CONTENT_TYPE_LABELS, item.type, locale)} · ${item.slug}`}
      />
      <ContentEditor item={draft} />
    </>
  );
}
