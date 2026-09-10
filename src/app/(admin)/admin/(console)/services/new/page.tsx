import { AdminPageHeader } from "@/components/admin/page-shell";
import { ServiceEditor } from "@/components/admin/service-editor";
import { requireAdmin } from "@/lib/auth";
import { getServiceEditorData } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminNewServicePage() {
  await requireAdmin();
  const { t } = await getT();
  const { categories, temples, festivals } = await getServiceEditorData();

  return (
    <>
      <AdminPageHeader back="/admin/services" backLabel={t("admin.servicesTitle")} title={t("admin.newService")} subtitle={t("admin.newServiceHint")} />
      <ServiceEditor service={null} categories={categories} temples={temples} festivals={festivals} />
    </>
  );
}
