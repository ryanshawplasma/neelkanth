import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { CellStack, DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { listBookings } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { BOOKING_STATUSES, SERVICE_TYPES, labelOf } from "@/lib/constants";
import { flatten, optionsFromList, type SearchParams } from "@/lib/admin/util";
import { formatDate, formatDateTime, formatINR, loc } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof listBookings>>["rows"][number];

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { t, locale } = await getT();
  const page = await listBookings(params);

  const columns: Column<Row>[] = [
    {
      key: "code",
      header: t("admin.colCode"),
      cell: (b) => (
        <CellStack
          top={b.code}
          bottom={
            <>
              {/* Phones fold the amount column into this line. */}
              <span className="sm:hidden">
                {formatINR(b.amountTotal, locale)} · {formatDate(b.createdAt, locale, { year: undefined })}
              </span>
              <span className="max-sm:hidden">{formatDateTime(b.createdAt, locale)}</span>
            </>
          }
          href={`/admin/bookings/${b.id}`}
        />
      ),
    },
    {
      key: "service",
      header: t("admin.colService"),
      hideOnMobile: true,
      cell: (b) => <CellStack top={loc(b.service, "name", locale)} bottom={labelOf(SERVICE_TYPES, b.type, locale)} />,
    },
    {
      key: "devotee",
      header: t("admin.colDevotee"),
      hideOnTablet: true,
      cell: (b) => <CellStack top={b.user.name ?? t("admin.noName")} bottom={b.user.phone ?? b.user.email ?? ""} href={`/admin/users/${b.userId}`} />,
    },
    {
      key: "when",
      header: t("admin.colWhen"),
      hideOnTablet: true,
      cell: (b) => (
        <span className="whitespace-nowrap text-xs">
          {formatDate(b.scheduledDate, locale)}
          {b.scheduledSlot ? ` · ${b.scheduledSlot}` : ""}
        </span>
      ),
    },
    {
      key: "pandit",
      header: t("admin.colPandit"),
      hideOnTablet: true,
      cell: (b) =>
        b.pandit ? (
          <Link href={`/admin/pandits/${b.pandit.id}`} className="text-xs font-medium hover:text-primary hover:underline">
            {locale === "hi" ? b.pandit.displayNameHi || b.pandit.displayName : b.pandit.displayName}
          </Link>
        ) : b.service.requiresPandit ? (
          <span className="text-xs font-medium text-warning">{t("admin.unassigned")}</span>
        ) : (
          <span className="text-xs text-muted">—</span>
        ),
    },
    {
      key: "amount",
      header: t("admin.colAmount"),
      align: "right",
      hideOnMobile: true,
      cell: (b) => <span className="whitespace-nowrap font-semibold tabular-nums">{formatINR(b.amountTotal, locale)}</span>,
    },
    {
      key: "payment",
      header: t("admin.colPayment"),
      hideOnTablet: true,
      cell: (b) => <StatusBadge kind="payment" value={b.payment?.status} locale={locale} />,
    },
    { key: "status", header: t("common.status"), cell: (b) => <StatusBadge kind="booking" value={b.status} locale={locale} /> },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.bookingsTitle")} subtitle={t("admin.bookingsSubtitle", { n: page.total })} />

      <FilterBar
        basePath="/admin/bookings"
        values={flatten(params)}
        fields={[
          { name: "q", type: "search", placeholder: t("admin.searchBookings") },
          { name: "status", type: "select", label: t("common.status"), options: optionsFromList(BOOKING_STATUSES, locale) },
          { name: "type", type: "select", label: t("admin.colType"), options: optionsFromList(SERVICE_TYPES, locale) },
          { name: "from", type: "date", label: t("admin.dateFrom") },
          { name: "to", type: "date", label: t("admin.dateTo") },
        ]}
      />

      <DataTable columns={columns} rows={page.rows} keyOf={(b) => b.id} href={(b) => `/admin/bookings/${b.id}`} empty={t("admin.noBookings")} />
      <Pagination basePath="/admin/bookings" params={params} page={page.page} pages={page.pages} total={page.total} size={page.size} />
    </>
  );
}
