import type { Metadata } from "next";
import { Star } from "lucide-react";
import { getT } from "@/i18n/server";
import { getReviews } from "@/lib/pandit/queries";
import { formatDate, loc } from "@/lib/utils";
import { EmptyState, Stars } from "@/components/ui/misc";
import { PortalHeader } from "@/components/pandit/shell";
import { Panel } from "@/components/pandit/common";

export const metadata: Metadata = { title: "Reviews" };

export default async function PanditReviewsPage() {
  const { t, locale } = await getT();
  const { pandit, reviews } = await getReviews();

  return (
    <div className="pb-8">
      <PortalHeader title={t("pandit.reviewsTitle")} subtitle={t("pandit.reviewsSubtitle")} />
      <div className="space-y-4 px-4 pt-2">
        <Panel>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gold-soft">
              <span className="text-xl font-bold text-[#8a6300]">{pandit.ratingCount ? pandit.ratingAvg.toFixed(1) : "—"}</span>
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t("pandit.averageRating")}</p>
              <p className="text-xs text-muted">{pandit.ratingCount ? t("pandit.fromReviews", { n: pandit.ratingCount }) : t("pandit.noRatingYet")}</p>
            </div>
          </div>
        </Panel>

        {reviews.length ? (
          <ul className="space-y-2.5">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-surface p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold">{r.user.name || t("common.devotees")}</p>
                  <Stars value={r.rating} />
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {loc(r.service, "name", locale)} · {formatDate(r.booking.scheduledDate, locale)}
                </p>
                {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<Star className="h-6 w-6" />} title={t("pandit.noReviews")} hint={t("pandit.noReviewsHint")} />
        )}
      </div>
    </div>
  );
}
