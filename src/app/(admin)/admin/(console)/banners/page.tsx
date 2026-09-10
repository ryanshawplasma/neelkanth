import { AdminPageHeader } from "@/components/admin/page-shell";
import { BannersManager, type BannerRow } from "@/components/admin/banners-manager";
import { requireAdmin } from "@/lib/auth";
import { listBanners } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  await requireAdmin();
  const { t } = await getT();
  const rows = (await listBanners()) as BannerRow[];
  return (
    <>
      <AdminPageHeader title={t("admin.bannersTitle")} subtitle={t("admin.bannersSubtitle", { n: rows.length })} />
      <BannersManager rows={rows} />
    </>
  );
}
