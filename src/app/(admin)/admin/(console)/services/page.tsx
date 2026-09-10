import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { CellStack, DataTable, Thumb, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { ToggleAction } from "@/components/admin/action-button";
import { ServiceRowActions } from "@/components/admin/service-row-actions";
import { Stars } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth";
import { listServices, listCategories, listTemples } from "@/lib/admin/queries";
import { toggleServiceFlagAction } from "@/lib/admin/service-actions";
import { getT } from "@/i18n/server";
import { SERVICE_TYPES, labelOf } from "@/lib/constants";
import { flatten, optionsFromList, type SearchParams } from "@/lib/admin/util";
import { formatINR, loc, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof listServices>>["rows"][number];

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { t, locale } = await getT();
  const [page, categories, temples] = await Promise.all([listServices(params), listCategories(), listTemples({ size: "100" })]);

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: t("admin.colService"),
      cell: (s) => (
        <div className="flex items-center gap-2.5">
          <Thumb src={s.coverUrl ?? parseJson<string[]>(s.images, [])[0]} alt={s.nameEn} />
          <CellStack top={loc(s, "name", locale)} bottom={`${s.slug} · ${labelOf(SERVICE_TYPES, s.type, locale)}`} href={`/admin/services/${s.id}`} />
        </div>
      ),
    },
    { key: "temple", header: t("common.temples"), cell: (s) => <span className="text-xs">{s.temple ? loc(s.temple, "name", locale) : "—"}</span>, hideOnTablet: true },
    { key: "category", header: t("admin.category"), cell: (s) => <span className="text-xs">{s.category ? loc(s.category, "name", locale) : "—"}</span>, hideOnTablet: true },
    {
      key: "price",
      header: t("common.price"),
      align: "right",
      cell: (s) => (
        <span className="whitespace-nowrap tabular-nums">
          <span className="font-semibold">{formatINR(s.basePrice, locale)}</span>
          {s.compareAtPrice ? <span className="ml-1 text-xs text-muted line-through">{formatINR(s.compareAtPrice, locale)}</span> : null}
        </span>
      ),
    },
    { key: "packages", header: t("admin.packages"), align: "right", cell: (s) => <span className="tabular-nums">{s._count.packages}</span>, hideOnTablet: true },
    { key: "bookings", header: t("admin.colBookings"), align: "right", cell: (s) => <span className="tabular-nums">{s._count.bookings}</span> },
    { key: "rating", header: t("common.rating"), cell: (s) => <Stars value={s.ratingAvg} count={s.ratingCount} />, hideOnTablet: true },
    {
      key: "featured",
      header: t("common.featured"),
      cell: (s) => <ToggleAction checked={s.featured} action={toggleServiceFlagAction.bind(null, s.id, "featured")} />,
    },
    {
      key: "trending",
      header: t("common.trending"),
      cell: (s) => <ToggleAction checked={s.trending} action={toggleServiceFlagAction.bind(null, s.id, "trending")} />,
      hideOnTablet: true,
    },
    {
      key: "active",
      header: t("common.active"),
      cell: (s) => <ToggleAction checked={s.active} action={toggleServiceFlagAction.bind(null, s.id, "active")} />,
    },
    { key: "actions", header: "", align: "right", cell: (s) => <ServiceRowActions id={s.id} name={loc(s, "name", locale)} /> },
  ];

  return (
    <>
      <AdminPageHeader
        title={t("admin.servicesTitle")}
        subtitle={t("admin.servicesSubtitle", { n: page.total })}
        actions={
          <Link href="/admin/services/new" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-600">
            <Plus className="h-4 w-4" />
            {t("admin.newService")}
          </Link>
        }
      />

      <FilterBar
        basePath="/admin/services"
        values={flatten(params)}
        fields={[
          { name: "q", type: "search", placeholder: t("admin.searchServices") },
          { name: "type", type: "select", label: t("admin.colType"), options: optionsFromList(SERVICE_TYPES, locale) },
          { name: "category", type: "select", label: t("admin.category"), options: categories.map((c) => ({ value: c.id, label: loc(c, "name", locale) })) },
          { name: "temple", type: "select", label: t("common.temples"), options: temples.rows.map((x) => ({ value: x.id, label: loc(x, "name", locale) })) },
          {
            name: "active",
            type: "select",
            label: t("common.active"),
            options: [
              { value: "yes", label: t("common.yes") },
              { value: "no", label: t("common.no") },
            ],
          },
          {
            name: "featured",
            type: "select",
            label: t("common.featured"),
            options: [
              { value: "yes", label: t("common.yes") },
              { value: "no", label: t("common.no") },
            ],
          },
        ]}
      />

      <DataTable columns={columns} rows={page.rows} keyOf={(s) => s.id} empty={t("admin.noServices")} />
      <Pagination basePath="/admin/services" params={params} page={page.page} pages={page.pages} total={page.total} size={page.size} />
    </>
  );
}
