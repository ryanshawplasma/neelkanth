import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { CellStack, DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConsultationEditor } from "@/components/admin/consultation-editor";
import { requireAdmin } from "@/lib/auth";
import { listConsultations } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { CONSULT_TOPICS, labelOf } from "@/lib/constants";
import { CONSULT_MODES, CONSULT_STATUS_LABELS, flatten, labelFrom, optionsFrom, optionsFromList, type SearchParams } from "@/lib/admin/util";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Result = Awaited<ReturnType<typeof listConsultations>>;
type Row = Result["rows"][number];

export default async function AdminConsultationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { t, locale } = await getT();
  const page = await listConsultations(params);

  const columns: Column<Row>[] = [
    {
      key: "topic",
      header: t("admin.topic"),
      cell: (c) => <CellStack top={labelOf(CONSULT_TOPICS, c.topic, locale)} bottom={c.question ?? "—"} />,
    },
    {
      key: "user",
      header: t("admin.colDevotee"),
      cell: (c) => <CellStack top={c.user.name ?? t("admin.noName")} bottom={c.user.phone ?? ""} href={`/admin/users/${c.userId}`} />,
    },
    {
      key: "pandit",
      header: t("admin.colPandit"),
      cell: (c) =>
        c.pandit ? (
          <Link href={`/admin/pandits/${c.pandit.id}`} className="text-xs font-medium hover:text-primary hover:underline">
            {locale === "hi" ? c.pandit.displayNameHi || c.pandit.displayName : c.pandit.displayName}
          </Link>
        ) : (
          <span className="text-xs font-medium text-warning">{t("admin.unassigned")}</span>
        ),
    },
    { key: "mode", header: t("admin.mode"), cell: (c) => <span className="text-xs">{labelFrom(CONSULT_MODES, c.mode, locale)}</span>, hideOnTablet: true },
    {
      key: "scheduled",
      header: t("admin.scheduleAt"),
      cell: (c) => <span className="whitespace-nowrap text-xs">{c.scheduledAt ? formatDateTime(c.scheduledAt, locale) : "—"}</span>,
    },
    { key: "status", header: t("common.status"), cell: (c) => <StatusBadge kind="consult" value={c.status} locale={locale} /> },
    { key: "created", header: t("admin.created"), cell: (c) => <span className="whitespace-nowrap text-xs text-muted">{formatDateTime(c.createdAt, locale)}</span>, hideOnTablet: true },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (c) => (
        <ConsultationEditor
          consult={{
            id: c.id,
            panditId: c.panditId ?? "",
            mode: c.mode,
            scheduledAt: c.scheduledAt ? c.scheduledAt.toISOString() : "",
            meetingLink: c.meetingLink ?? "",
            answer: c.answer ?? "",
            status: c.status,
          }}
          jyotishis={page.jyotishis.map((j) => ({ id: j.id, displayName: j.displayName, city: j.city }))}
        />
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.consultationsTitle")} subtitle={t("admin.consultationsSubtitle", { n: page.total })} />

      <FilterBar
        basePath="/admin/consultations"
        values={flatten(params)}
        fields={[
          { name: "status", type: "select", label: t("common.status"), options: optionsFrom(CONSULT_STATUS_LABELS, locale) },
          { name: "topic", type: "select", label: t("admin.topic"), options: optionsFromList(CONSULT_TOPICS, locale) },
        ]}
      />

      <DataTable columns={columns} rows={page.rows} keyOf={(c) => c.id} empty={t("admin.noConsultations")} />
      <Pagination basePath="/admin/consultations" params={params} page={page.page} pages={page.pages} total={page.total} size={page.size} />
    </>
  );
}
