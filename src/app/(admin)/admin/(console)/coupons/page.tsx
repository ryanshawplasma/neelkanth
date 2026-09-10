import { AdminPageHeader } from "@/components/admin/page-shell";
import { CouponsManager, type CouponRow } from "@/components/admin/coupons-manager";
import { requireAdmin } from "@/lib/auth";
import { listCoupons } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireAdmin();
  const { t } = await getT();
  const rows = (await listCoupons()) as CouponRow[];
  return (
    <>
      <AdminPageHeader title={t("admin.couponsTitle")} subtitle={t("admin.couponsSubtitle", { n: rows.length })} />
      <CouponsManager rows={rows} />
    </>
  );
}
