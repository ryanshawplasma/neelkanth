import { AdminPageHeader } from "@/components/admin/page-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { CellStack, DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { Avatar, Stars } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { listPandits } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { KYC_STATUSES, PANDIT_CLASSIFICATIONS, labelOf } from "@/lib/constants";
import { flatten, optionsFromList, type SearchParams } from "@/lib/admin/util";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof listPandits>>["rows"][number];

export default async function AdminPanditsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { t, locale } = await getT();
  const page = await listPandits(params);

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: t("admin.colPandit"),
      cell: (p) => (
        <div className="flex items-center gap-2.5">
          <Avatar src={p.photoUrl} name={p.displayName} size={32} />
          <CellStack
            top={locale === "hi" ? p.displayNameHi || p.displayName : p.displayName}
            bottom={p.user.phone ?? p.user.email ?? ""}
            href={`/admin/pandits/${p.id}`}
          />
        </div>
      ),
    },
    { key: "classification", header: t("common.classification"), cell: (p) => <span className="text-xs">{labelOf(PANDIT_CLASSIFICATIONS, p.classification, locale)}</span> },
    { key: "city", header: t("common.city"), cell: (p) => <span className="text-xs">{[p.city, p.state].filter(Boolean).join(", ") || "—"}</span>, hideOnTablet: true },
    { key: "kyc", header: t("admin.kyc"), cell: (p) => <StatusBadge kind="kyc" value={p.kycStatus} locale={locale} /> },
    {
      key: "flags",
      header: t("admin.flags"),
      cell: (p) => (
        <span className="flex flex-wrap gap-1">
          {p.verified && <Badge tone="success">{t("common.verified")}</Badge>}
          {p.featured && <Badge tone="gold">{t("common.featured")}</Badge>}
          {!p.isActive && <Badge tone="muted">{t("common.inactive")}</Badge>}
          {p.user.isBlocked && <Badge tone="danger">{t("admin.blocked")}</Badge>}
        </span>
      ),
    },
    { key: "rating", header: t("common.rating"), cell: (p) => <Stars value={p.ratingAvg} count={p.ratingCount} />, hideOnTablet: true },
    { key: "bookings", header: t("admin.colBookings"), align: "right", cell: (p) => <span className="tabular-nums">{p._count.bookings}</span> },
    { key: "services", header: t("admin.colServices"), align: "right", cell: (p) => <span className="tabular-nums">{p._count.services}</span>, hideOnTablet: true },
    { key: "joined", header: t("admin.colJoined"), cell: (p) => <span className="whitespace-nowrap text-xs">{formatDate(p.createdAt, locale)}</span>, hideOnTablet: true },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.panditsTitle")} subtitle={t("admin.panditsSubtitle", { n: page.total })} />

      <FilterBar
        basePath="/admin/pandits"
        values={flatten(params)}
        fields={[
          { name: "q", type: "search", placeholder: t("admin.searchPandits") },
          { name: "kyc", type: "select", label: t("admin.kyc"), options: optionsFromList(KYC_STATUSES, locale) },
          { name: "classification", type: "select", label: t("common.classification"), options: optionsFromList(PANDIT_CLASSIFICATIONS, locale) },
          {
            name: "verified",
            type: "select",
            label: t("common.verified"),
            options: [
              { value: "yes", label: t("common.yes") },
              { value: "no", label: t("common.no") },
            ],
          },
          { name: "city", type: "search", placeholder: t("common.city"), className: "min-w-40 max-w-48" },
        ]}
      />

      <DataTable columns={columns} rows={page.rows} keyOf={(p) => p.id} href={(p) => `/admin/pandits/${p.id}`} empty={t("admin.noPandits")} />
      <Pagination basePath="/admin/pandits" params={params} page={page.page} pages={page.pages} total={page.total} size={page.size} />
    </>
  );
}
