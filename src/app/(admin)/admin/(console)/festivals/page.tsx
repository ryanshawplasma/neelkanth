import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { AdminPageHeader, Panel } from "@/components/admin/page-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { SendFestivalReminderButton } from "@/components/admin/festival-editor";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { listFestivals } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { FESTIVAL_TYPES, labelOf } from "@/lib/constants";
import { flatten, optionsFromList, type SearchParams } from "@/lib/admin/util";
import { daysUntil, formatDate, loc, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminFestivalsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { t, locale } = await getT();
  const page = await listFestivals(params);

  const groups = new Map<string, typeof page.rows>();
  for (const f of page.rows) {
    const key = f.date.slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(f);
  }

  const year = new Date().getFullYear();

  return (
    <>
      <AdminPageHeader
        title={t("admin.festivalsTitle")}
        subtitle={t("admin.festivalsSubtitle", { n: page.total })}
        actions={
          <Link href="/admin/festivals/new" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-600">
            <Plus className="h-4 w-4" />
            {t("admin.newFestival")}
          </Link>
        }
      />

      <FilterBar
        basePath="/admin/festivals"
        values={flatten(params)}
        fields={[
          { name: "q", type: "search", placeholder: t("admin.searchFestivals") },
          { name: "type", type: "select", label: t("admin.colType"), options: optionsFromList(FESTIVAL_TYPES, locale) },
          {
            name: "year",
            type: "select",
            label: t("admin.year"),
            options: [year - 1, year, year + 1, year + 2].map((y) => ({ value: String(y), label: String(y) })),
          },
          {
            name: "major",
            type: "select",
            label: t("admin.major"),
            options: [
              { value: "yes", label: t("common.yes") },
              { value: "no", label: t("common.no") },
            ],
          },
          {
            name: "push",
            type: "select",
            label: t("admin.push"),
            options: [
              { value: "yes", label: t("common.yes") },
              { value: "no", label: t("common.no") },
            ],
          },
        ]}
      />

      {groups.size === 0 && <p className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">{t("admin.noFestivals")}</p>}

      <div className="space-y-4">
        {[...groups.entries()].map(([month, items]) => (
          <Panel key={month} title={formatDate(`${month}-01`, locale, { month: "long", year: "numeric", day: undefined })} subtitle={t("admin.festivalCount", { n: items.length })} bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {items.map((f) => {
                const d = daysUntil(f.date);
                const offsets = parseJson<number[]>(f.remindDaysBefore, []);
                return (
                  <li key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-[10px] font-bold uppercase leading-none text-primary-700">
                      <span className="text-base">{f.date.slice(8)}</span>
                      {formatDate(f.date, "en", { month: "short", day: undefined, year: undefined })}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-1.5 truncate text-sm font-medium">
                        <Link href={`/admin/festivals/${f.id}`} className="hover:text-primary hover:underline">
                          {loc(f, "name", locale)}
                        </Link>
                        <Badge tone="muted">{labelOf(FESTIVAL_TYPES, f.type, locale)}</Badge>
                        {f.major && <Badge tone="gold">{t("admin.major")}</Badge>}
                        {!f.active && <Badge tone="muted">{t("common.inactive")}</Badge>}
                        {!f.pushEnabled && <Badge tone="danger">{t("admin.pushOff")}</Badge>}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {formatDate(f.date, locale)}
                        {d >= 0 && d <= 60 ? ` · ${d === 0 ? t("common.today") : t("common.daysLeft", { n: d })}` : ""}
                        {` · ${t("admin.remindOffsets", { list: offsets.join(", ") || "—" })}`}
                        {f._count.services > 0 ? ` · ${t("admin.servicesCount", { n: f._count.services })}` : ""}
                      </p>
                    </div>
                    <SendFestivalReminderButton festivalId={f.id} />
                    <Link href={`/admin/festivals/${f.id}`} className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-primary" aria-label={t("common.edit")}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>
        ))}
      </div>

      <Pagination basePath="/admin/festivals" params={params} page={page.page} pages={page.pages} total={page.total} size={page.size} />
    </>
  );
}
