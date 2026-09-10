import { AdminPageHeader } from "@/components/admin/page-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { CellStack, DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { Avatar } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { flatten, type SearchParams } from "@/lib/admin/util";
import { formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof listUsers>>["rows"][number];

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { t, locale } = await getT();
  const page = await listUsers(params);

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: t("admin.colUser"),
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar src={u.avatarUrl} name={u.name} size={32} />
          <CellStack top={u.name ?? t("admin.noName")} bottom={u.phone ?? u.email ?? ""} href={`/admin/users/${u.id}`} />
        </div>
      ),
    },
    {
      key: "role",
      header: t("admin.role"),
      cell: (u) => <Badge tone={u.role === "ADMIN" ? "maroon" : u.role === "PANDIT" ? "info" : "muted"}>{u.role}</Badge>,
    },
    { key: "city", header: t("common.city"), cell: (u) => <span className="text-xs">{[u.city, u.state].filter(Boolean).join(", ") || "—"}</span>, hideOnTablet: true },
    { key: "locale", header: t("common.language"), cell: (u) => <span className="text-xs uppercase">{u.locale}</span>, hideOnTablet: true },
    {
      key: "state",
      header: t("common.status"),
      cell: (u) => (
        <span className="flex gap-1">
          {u.isBlocked ? <Badge tone="danger">{t("admin.blocked")}</Badge> : <Badge tone="success">{t("common.active")}</Badge>}
          {u.onboarded ? <Badge tone="muted">{t("admin.onboarded")}</Badge> : null}
        </span>
      ),
    },
    { key: "bookings", header: t("admin.colBookings"), align: "right", cell: (u) => <span className="tabular-nums">{u._count.bookings}</span> },
    { key: "seen", header: t("admin.lastSeen"), cell: (u) => <span className="whitespace-nowrap text-xs text-muted">{u.lastSeenAt ? formatDateTime(u.lastSeenAt, locale) : "—"}</span>, hideOnTablet: true },
    { key: "joined", header: t("admin.colJoined"), cell: (u) => <span className="whitespace-nowrap text-xs">{formatDate(u.createdAt, locale)}</span> },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.usersTitle")} subtitle={t("admin.usersSubtitle", { n: page.total })} />

      <FilterBar
        basePath="/admin/users"
        values={flatten(params)}
        fields={[
          { name: "q", type: "search", placeholder: t("admin.searchUsers") },
          {
            name: "role",
            type: "select",
            label: t("admin.role"),
            options: [
              { value: "USER", label: t("admin.roleUser") },
              { value: "PANDIT", label: t("admin.rolePandit") },
              { value: "ADMIN", label: t("admin.roleAdmin") },
            ],
          },
          {
            name: "onboarded",
            type: "select",
            label: t("admin.onboarded"),
            options: [
              { value: "yes", label: t("common.yes") },
              { value: "no", label: t("common.no") },
            ],
          },
          {
            name: "blocked",
            type: "select",
            label: t("admin.blocked"),
            options: [
              { value: "yes", label: t("common.yes") },
              { value: "no", label: t("common.no") },
            ],
          },
        ]}
      />

      <DataTable columns={columns} rows={page.rows} keyOf={(u) => u.id} href={(u) => `/admin/users/${u.id}`} empty={t("admin.noUsers")} />
      <Pagination basePath="/admin/users" params={params} page={page.page} pages={page.pages} total={page.total} size={page.size} />
    </>
  );
}
