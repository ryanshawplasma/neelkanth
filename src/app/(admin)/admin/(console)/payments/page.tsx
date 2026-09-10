import { AdminPageHeader } from "@/components/admin/page-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { CellStack, DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { KpiCard } from "@/components/admin/kpi-card";
import { requireAdmin } from "@/lib/auth";
import { listPayments } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { PAYMENT_STATUS_LABELS, flatten, optionsFrom, type SearchParams } from "@/lib/admin/util";
import { formatDateTime, formatINR, loc } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof listPayments>>["rows"][number];

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { t, locale } = await getT();
  const page = await listPayments(params);

  const columns: Column<Row>[] = [
    {
      key: "booking",
      header: t("admin.colCode"),
      cell: (p) => <CellStack top={p.booking.code} bottom={loc(p.booking.service, "name", locale)} href={`/admin/bookings/${p.bookingId}`} />,
    },
    { key: "devotee", header: t("admin.colDevotee"), cell: (p) => <CellStack top={p.booking.user.name ?? t("admin.noName")} bottom={p.booking.user.phone ?? ""} href={`/admin/users/${p.booking.userId}`} /> },
    { key: "amount", header: t("admin.colAmount"), align: "right", cell: (p) => <span className="whitespace-nowrap font-semibold tabular-nums">{formatINR(p.amount, locale)}</span> },
    { key: "provider", header: t("admin.provider"), cell: (p) => <span className="text-xs">{p.provider}</span>, hideOnTablet: true },
    { key: "method", header: t("admin.method"), cell: (p) => <span className="text-xs">{p.method ?? "—"}</span>, hideOnTablet: true },
    { key: "ref", header: t("admin.paymentId"), cell: (p) => <code className="text-xs text-muted">{p.paymentId ?? p.orderId ?? "—"}</code>, hideOnTablet: true },
    { key: "status", header: t("common.status"), cell: (p) => <StatusBadge kind="payment" value={p.status} locale={locale} /> },
    { key: "date", header: t("common.date"), cell: (p) => <span className="whitespace-nowrap text-xs">{formatDateTime(p.createdAt, locale)}</span> },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.paymentsTitle")} subtitle={t("admin.paymentsSubtitle", { n: page.total })} />

      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label={t("admin.filteredTotal")} value={formatINR(page.sum, locale)} sub={t("admin.acrossPayments", { n: page.total })} tone="success" />
      </div>

      <FilterBar
        basePath="/admin/payments"
        values={flatten(params)}
        fields={[
          { name: "q", type: "search", placeholder: t("admin.searchPayments") },
          { name: "status", type: "select", label: t("common.status"), options: optionsFrom(PAYMENT_STATUS_LABELS, locale) },
          {
            name: "provider",
            type: "select",
            label: t("admin.provider"),
            options: [
              { value: "mock", label: "mock" },
              { value: "razorpay", label: "razorpay" },
              { value: "manual", label: "manual" },
            ],
          },
          { name: "from", type: "date", label: t("admin.dateFrom") },
          { name: "to", type: "date", label: t("admin.dateTo") },
        ]}
      />

      <DataTable columns={columns} rows={page.rows} keyOf={(p) => p.id} href={(p) => `/admin/bookings/${p.bookingId}`} empty={t("admin.noPayments")} />
      <Pagination basePath="/admin/payments" params={params} page={page.page} pages={page.pages} total={page.total} size={page.size} />
    </>
  );
}
