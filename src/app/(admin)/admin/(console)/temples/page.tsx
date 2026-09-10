import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { CellStack, DataTable, Thumb, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { ToggleAction } from "@/components/admin/action-button";
import { requireAdmin } from "@/lib/auth";
import { listTemples } from "@/lib/admin/queries";
import { toggleTempleFlagAction } from "@/lib/admin/catalog-actions";
import { getT } from "@/i18n/server";
import { INDIAN_STATES } from "@/lib/constants";
import { flatten, type SearchParams } from "@/lib/admin/util";
import { loc, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof listTemples>>["rows"][number];

export default async function AdminTemplesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { t, locale } = await getT();
  const page = await listTemples(params);

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: t("common.temples"),
      cell: (x) => (
        <div className="flex items-center gap-2.5">
          <Thumb src={x.coverUrl ?? parseJson<string[]>(x.images, [])[0]} alt={x.nameEn} />
          <CellStack top={loc(x, "name", locale)} bottom={x.slug} href={`/admin/temples/${x.id}`} />
        </div>
      ),
    },
    { key: "deity", header: t("admin.deity"), cell: (x) => <span className="text-xs">{loc(x, "deity", locale) || "—"}</span>, hideOnTablet: true },
    { key: "city", header: t("common.city"), cell: (x) => <span className="text-xs">{`${x.city}, ${x.state}`}</span> },
    { key: "timings", header: t("admin.timings"), cell: (x) => <span className="text-xs text-muted">{x.timings ?? "—"}</span>, hideOnTablet: true },
    { key: "services", header: t("admin.colServices"), align: "right", cell: (x) => <span className="tabular-nums">{x._count.services}</span> },
    { key: "pandits", header: t("admin.navPandits"), align: "right", cell: (x) => <span className="tabular-nums">{x._count.pandits}</span>, hideOnTablet: true },
    { key: "featured", header: t("common.featured"), cell: (x) => <ToggleAction checked={x.featured} action={toggleTempleFlagAction.bind(null, x.id, "featured")} /> },
    { key: "active", header: t("common.active"), cell: (x) => <ToggleAction checked={x.active} action={toggleTempleFlagAction.bind(null, x.id, "active")} /> },
  ];

  return (
    <>
      <AdminPageHeader
        title={t("admin.templesTitle")}
        subtitle={t("admin.templesSubtitle", { n: page.total })}
        actions={
          <Link href="/admin/temples/new" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-600">
            <Plus className="h-4 w-4" />
            {t("admin.newTemple")}
          </Link>
        }
      />

      <FilterBar
        basePath="/admin/temples"
        values={flatten(params)}
        fields={[
          { name: "q", type: "search", placeholder: t("admin.searchTemples") },
          { name: "state", type: "select", label: t("common.state"), options: INDIAN_STATES.map((s) => ({ value: s, label: s })) },
          {
            name: "active",
            type: "select",
            label: t("common.active"),
            options: [
              { value: "yes", label: t("common.yes") },
              { value: "no", label: t("common.no") },
            ],
          },
        ]}
      />

      <DataTable columns={columns} rows={page.rows} keyOf={(x) => x.id} href={(x) => `/admin/temples/${x.id}`} empty={t("admin.noTemples")} />
      <Pagination basePath="/admin/temples" params={params} page={page.page} pages={page.pages} total={page.total} size={page.size} />
    </>
  );
}
