import { AdminPageHeader } from "@/components/admin/page-shell";
import { CategoriesManager, type CategoryRow } from "@/components/admin/categories-manager";
import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const { t } = await getT();
  const cats = await listCategories();
  const rows: CategoryRow[] = cats.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameEn: c.nameEn,
    nameHi: c.nameHi,
    icon: c.icon,
    imageUrl: c.imageUrl,
    type: c.type,
    sortOrder: c.sortOrder,
    active: c.active,
    services: c._count.services,
  }));

  return (
    <>
      <AdminPageHeader title={t("admin.categoriesTitle")} subtitle={t("admin.categoriesSubtitle", { n: rows.length })} />
      <CategoriesManager rows={rows} />
    </>
  );
}
