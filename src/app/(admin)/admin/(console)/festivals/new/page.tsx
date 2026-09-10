import { AdminPageHeader } from "@/components/admin/page-shell";
import { FestivalEditor } from "@/components/admin/festival-editor";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminNewFestivalPage() {
  await requireAdmin();
  const { t } = await getT();
  return (
    <>
      <AdminPageHeader back="/admin/festivals" backLabel={t("admin.festivalsTitle")} title={t("admin.newFestival")} />
      <FestivalEditor festival={null} linkedServices={[]} />
    </>
  );
}
