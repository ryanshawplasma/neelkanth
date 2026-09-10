import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { JsonView } from "@/components/admin/json-view";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { listAudit } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { flatten, type SearchParams } from "@/lib/admin/util";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof listAudit>>["rows"][number];

const ENTITY_LINK: Record<string, string> = {
  Booking: "/admin/bookings/",
  PanditProfile: "/admin/pandits/",
  User: "/admin/users/",
  Service: "/admin/services/",
  Temple: "/admin/temples/",
  Festival: "/admin/festivals/",
  ContentItem: "/admin/content/",
};

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { t, locale } = await getT();
  const page = await listAudit(params);

  const columns: Column<Row>[] = [
    { key: "when", header: t("admin.when"), cell: (a) => <span className="whitespace-nowrap text-xs">{formatDateTime(a.createdAt, locale)}</span> },
    { key: "actor", header: t("admin.actor"), cell: (a) => <span className="text-xs">{a.actor?.name ?? a.actor?.email ?? a.actor?.phone ?? t("admin.system")}</span> },
    { key: "action", header: t("admin.action"), cell: (a) => <Badge tone="muted">{a.action}</Badge> },
    {
      key: "entity",
      header: t("admin.entity"),
      cell: (a) => {
        const prefix = a.entity ? ENTITY_LINK[a.entity] : undefined;
        const label = `${a.entity ?? "—"}${a.entityId ? ` · ${a.entityId.slice(-6)}` : ""}`;
        return prefix && a.entityId ? (
          <Link href={`${prefix}${a.entityId}`} className="text-xs text-primary hover:underline">
            {label}
          </Link>
        ) : (
          <span className="text-xs text-muted">{label}</span>
        );
      },
    },
    { key: "meta", header: t("admin.meta"), cell: (a) => (a.meta ? <JsonView value={a.meta} max={200} className="max-w-lg" /> : <span className="text-xs text-muted">—</span>), hideOnTablet: true },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.auditTitle")} subtitle={t("admin.auditSubtitle", { n: page.total })} />

      <FilterBar
        basePath="/admin/audit"
        values={flatten(params)}
        fields={[
          { name: "q", type: "search", placeholder: t("admin.searchAudit") },
          { name: "entity", type: "select", label: t("admin.entity"), options: page.entities.map((e) => ({ value: e, label: e })) },
          { name: "action", type: "search", placeholder: t("admin.action"), className: "min-w-40 max-w-52" },
        ]}
      />

      <DataTable columns={columns} rows={page.rows} keyOf={(a) => a.id} empty={t("admin.noAudit")} />
      <Pagination basePath="/admin/audit" params={params} page={page.page} pages={page.pages} total={page.total} size={page.size} />
    </>
  );
}
