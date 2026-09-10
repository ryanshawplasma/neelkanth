import { AdminPageHeader } from "@/components/admin/page-shell";
import { ContentEditor } from "@/components/admin/content-editor";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminNewContentPage() {
  await requireAdmin();
  const { t } = await getT();
  return (
    <>
      <AdminPageHeader back="/admin/content" backLabel={t("admin.contentLibraryTitle")} title={t("admin.newContent")} />
      <ContentEditor item={null} />
    </>
  );
}
