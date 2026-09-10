import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { KpiCard } from "@/components/admin/kpi-card";
import { MarkPayoutPaidButton } from "@/components/admin/pandit-actions-ui";
import { requireAdmin } from "@/lib/auth";
import { listPayouts } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { PAYOUT_STATUS_LABELS, flatten, optionsFrom, type SearchParams } from "@/lib/admin/util";
import { formatDateTime, formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof listPayouts>>["rows"][number];

export default async function AdminPayoutsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { t, locale } = await getT();
  const page = await listPayouts(params);

  const columns: Column<Row>[] = [
    {
      key: "pandit",
      header: t("admin.colPandit"),
      cell: (x) => (
        <Link href={`/admin/pandits/${x.panditId}`} className="font-medium hover:text-primary hover:underline">
          {locale === "hi" ? x.pandit.displayNameHi || x.pandit.displayName : x.pandit.displayName}
        </Link>
      ),
    },
    { key: "amount", header: t("admin.colAmount"), align: "right", cell: (x) => <span className="whitespace-nowrap font-semibold tabular-nums">{formatINR(x.amount, locale)}</span> },
    { key: "reference", header: t("admin.payoutReference"), cell: (x) => <span className="text-xs">{x.reference ?? "—"}</span> },
    { key: "note", header: t("admin.note"), cell: (x) => <span className="text-xs text-muted">{x.note ?? "—"}</span>, hideOnTablet: true },
    { key: "created", header: t("admin.created"), cell: (x) => <span className="whitespace-nowrap text-xs">{formatDateTime(x.createdAt, locale)}</span> },
    { key: "paid", header: t("admin.paidAt"), cell: (x) => <span className="whitespace-nowrap text-xs">{x.paidAt ? formatDateTime(x.paidAt, locale) : "—"}</span>, hideOnTablet: true },
    { key: "status", header: t("common.status"), cell: (x) => <StatusBadge kind="payout" value={x.status} locale={locale} /> },
    { key: "action", header: "", align: "right", cell: (x) => (x.status === "PENDING" ? <MarkPayoutPaidButton payoutId={x.id} /> : null) },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.payoutsTitle")} subtitle={t("admin.payoutsSubtitle", { n: page.total })} />

      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label={t("admin.filteredTotal")} value={formatINR(page.sum, locale)} sub={t("admin.acrossPayouts", { n: page.total })} tone="gold" />
      </div>

      <FilterBar
        basePath="/admin/payouts"
        values={flatten(params)}
        fields={[{ name: "status", type: "select", label: t("common.status"), options: optionsFrom(PAYOUT_STATUS_LABELS, locale) }]}
      />

      <DataTable columns={columns} rows={page.rows} keyOf={(x) => x.id} empty={t("admin.noPayouts")} />
      <Pagination basePath="/admin/payouts" params={params} page={page.page} pages={page.pages} total={page.total} size={page.size} />
    </>
  );
}
