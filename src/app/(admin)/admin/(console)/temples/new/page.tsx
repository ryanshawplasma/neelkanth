import { AdminPageHeader } from "@/components/admin/page-shell";
import { TempleEditor } from "@/components/admin/temple-editor";
import { requireAdmin } from "@/lib/auth";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminNewTemplePage() {
  await requireAdmin();
  const { t } = await getT();
  return (
    <>
      <AdminPageHeader back="/admin/temples" backLabel={t("admin.templesTitle")} title={t("admin.newTemple")} />
      <TempleEditor temple={null} />
    </>
  );
}
