import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { CellStack, DataTable, Thumb, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { listContent } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { CONTENT_TYPE_LABELS, flatten, labelFrom, optionsFrom, type SearchParams } from "@/lib/admin/util";
import { formatDate, loc } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof listContent>>["rows"][number];

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { t, locale } = await getT();
  const page = await listContent(params);

  const columns: Column<Row>[] = [
    {
      key: "title",
      header: t("admin.contentTitle"),
      cell: (c) => (
        <div className="flex items-center gap-2.5">
          <Thumb src={c.imageUrl} alt={c.titleEn} />
          <CellStack top={loc(c, "title", locale)} bottom={c.slug} href={`/admin/content/${c.id}`} />
        </div>
      ),
    },
    { key: "type", header: t("admin.colType"), cell: (c) => <Badge tone="muted">{labelFrom(CONTENT_TYPE_LABELS, c.type, locale)}</Badge> },
    { key: "deity", header: t("admin.deity"), cell: (c) => <span className="text-xs">{loc(c, "deity", locale) || "—"}</span>, hideOnTablet: true },
    { key: "audio", header: t("admin.audio"), cell: (c) => <span className="text-xs">{c.audioUrl ? "🔊" : "—"}</span>, hideOnTablet: true },
    { key: "views", header: t("admin.views"), align: "right", cell: (c) => <span className="tabular-nums">{c.views}</span> },
    {
      key: "flags",
      header: t("admin.flags"),
      cell: (c) => (
        <span className="flex gap-1">
          {c.featured && <Badge tone="gold">{t("common.featured")}</Badge>}
          <Badge tone={c.active ? "success" : "muted"}>{c.active ? t("common.active") : t("common.inactive")}</Badge>
        </span>
      ),
    },
    { key: "updated", header: t("admin.updated"), cell: (c) => <span className="whitespace-nowrap text-xs text-muted">{formatDate(c.updatedAt, locale)}</span>, hideOnTablet: true },
  ];

  return (
    <>
      <AdminPageHeader
        title={t("admin.contentLibraryTitle")}
        subtitle={t("admin.contentSubtitle", { n: page.total })}
        actions={
          <Link href="/admin/content/new" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-600">
            <Plus className="h-4 w-4" />
            {t("admin.newContent")}
          </Link>
        }
      />

      <FilterBar
        basePath="/admin/content"
        values={flatten(params)}
        fields={[
          { name: "q", type: "search", placeholder: t("admin.searchContent") },
          { name: "type", type: "select", label: t("admin.colType"), options: optionsFrom(CONTENT_TYPE_LABELS, locale) },
        ]}
      />

      <DataTable columns={columns} rows={page.rows} keyOf={(c) => c.id} href={(c) => `/admin/content/${c.id}`} empty={t("admin.noContent")} />
      <Pagination basePath="/admin/content" params={params} page={page.page} pages={page.pages} total={page.total} size={page.size} />
    </>
  );
}
