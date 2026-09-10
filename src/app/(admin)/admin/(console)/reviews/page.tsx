import Link from "next/link";
import { Check, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { FilterBar } from "@/components/admin/filter-bar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Pagination } from "@/components/admin/pagination";
import { ActionButton } from "@/components/admin/action-button";
import { Stars } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { listReviews } from "@/lib/admin/queries";
import { deleteReviewAction, setReviewApprovedAction } from "@/lib/admin/review-actions";
import { getT } from "@/i18n/server";
import { flatten, type SearchParams } from "@/lib/admin/util";
import { formatDate, loc } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof listReviews>>["rows"][number];

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const { t, locale } = await getT();
  const page = await listReviews(params);

  const columns: Column<Row>[] = [
    { key: "rating", header: t("common.rating"), cell: (r) => <Stars value={r.rating} /> },
    {
      key: "comment",
      header: t("admin.comment"),
      cell: (r) => (
        <div className="max-w-md">
          <p className="text-sm">{r.comment ?? "—"}</p>
          <p className="mt-0.5 text-xs text-muted">
            {r.user.name ?? r.user.phone ?? "—"} · {formatDate(r.createdAt, locale)}
          </p>
        </div>
      ),
    },
    {
      key: "service",
      header: t("admin.colService"),
      cell: (r) => (
        <Link href={`/admin/services/${r.serviceId}`} className="text-xs font-medium hover:text-primary hover:underline">
          {loc(r.service, "name", locale)}
        </Link>
      ),
    },
    {
      key: "pandit",
      header: t("admin.colPandit"),
      hideOnTablet: true,
      cell: (r) =>
        r.pandit ? (
          <Link href={`/admin/pandits/${r.pandit.id}`} className="text-xs hover:text-primary hover:underline">
            {locale === "hi" ? r.pandit.displayNameHi || r.pandit.displayName : r.pandit.displayName}
          </Link>
        ) : (
          <span className="text-xs text-muted">—</span>
        ),
    },
    {
      key: "booking",
      header: t("admin.colCode"),
      hideOnTablet: true,
      cell: (r) => (
        <Link href={`/admin/bookings/${r.booking.id}`} className="text-xs hover:text-primary hover:underline">
          {r.booking.code}
        </Link>
      ),
    },
    { key: "approved", header: t("common.status"), cell: (r) => <Badge tone={r.approved ? "success" : "warning"}>{r.approved ? t("admin.approved") : t("admin.hidden")}</Badge> },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) => (
        <div className="flex justify-end gap-1.5">
          <ActionButton
            action={setReviewApprovedAction.bind(null, r.id, !r.approved)}
            icon={r.approved ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            successMessage={t("admin.ratingsRecomputed")}
          >
            {r.approved ? t("admin.unapprove") : t("admin.approve")}
          </ActionButton>
          <ActionButton
            action={deleteReviewAction.bind(null, r.id)}
            variant="ghost"
            className="text-danger"
            confirm={{ title: t("admin.deleteReview"), description: t("admin.deleteReviewWarning"), danger: true }}
            successMessage={t("admin.deleted")}
          >
            {t("common.delete")}
          </ActionButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.reviewsTitle")} subtitle={t("admin.reviewsSubtitle", { n: page.total })} />

      <FilterBar
        basePath="/admin/reviews"
        values={flatten(params)}
        fields={[
          { name: "q", type: "search", placeholder: t("admin.searchReviews") },
          {
            name: "approved",
            type: "select",
            label: t("admin.approved"),
            options: [
              { value: "yes", label: t("common.yes") },
              { value: "no", label: t("common.no") },
            ],
          },
          { name: "rating", type: "select", label: t("common.rating"), options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} ★` })) },
        ]}
      />

      <DataTable columns={columns} rows={page.rows} keyOf={(r) => r.id} empty={t("admin.noReviews")} />
      <Pagination basePath="/admin/reviews" params={params} page={page.page} pages={page.pages} total={page.total} size={page.size} />
    </>
  );
}
