import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CalendarCheck2, IndianRupee, ShieldCheck, Star, Video } from "lucide-react";
import { getT } from "@/i18n/server";
import { getDashboardData } from "@/lib/pandit/queries";
import { formatDate, formatINR } from "@/lib/utils";
import { Stat, EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { EnablePushButton } from "@/components/push-register";
import { PortalHeader } from "@/components/pandit/shell";
import { BookingCard, KycBadge, Panel } from "@/components/pandit/common";
import { NotificationList } from "@/components/pandit/notification-list";

export const metadata: Metadata = { title: "Dashboard" };

export default async function PanditDashboardPage() {
  const { t, locale } = await getT();
  const d = await getDashboardData();
  const hour = new Date().getHours();
  const greetKey = hour < 12 ? "greetingMorning" : hour < 17 ? "greetingAfternoon" : "greetingEvening";
  const shortName = (d.pandit.displayName || "").split(" ").slice(-1)[0] || d.pandit.displayName;
  const kycOk = d.pandit.kycStatus === "APPROVED";

  return (
    <div className="pb-8">
      <PortalHeader title={t(`pandit.${greetKey}`, { name: shortName })} subtitle={t("pandit.dashSubtitle")} action={<EnablePushButton />} />

      <div className="space-y-4 px-4 pt-2">
        {!kycOk && (
          <div className="rounded-2xl border border-warning/30 bg-warning-soft p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t("pandit.kycBannerTitle")}</p>
                <p className="mt-0.5 text-xs text-muted">{t("pandit.kycBannerBody")}</p>
                <div className="mt-3 flex items-center gap-2">
                  <ButtonLink href="/pandit/kyc" size="sm">
                    {t("pandit.kycCta")}
                  </ButtonLink>
                  <KycBadge status={d.pandit.kycStatus} />
                </div>
              </div>
            </div>
          </div>
        )}

        {kycOk && (
          <div className="flex items-center gap-2 rounded-2xl border border-success/30 bg-success-soft px-4 py-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
            <p className="text-sm font-semibold text-success">{t("pandit.kycVerified")}</p>
            <Link href="/pandit/kyc" className="ml-auto text-xs font-semibold text-success hover:underline">
              {t("common.seeMore")}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label={t("pandit.statUpcoming")} value={d.upcomingCount} icon={<CalendarCheck2 className="h-4 w-4" />} />
          <Stat label={t("pandit.statCompletedMonth")} value={d.completedMonthCount} tone="success" icon={<ShieldCheck className="h-4 w-4" />} />
          <Stat label={t("pandit.statEarningsMonth")} value={formatINR(d.earningsMonth, locale)} tone="warning" icon={<IndianRupee className="h-4 w-4" />} />
          <Stat
            label={t("pandit.statRating")}
            value={d.pandit.ratingCount > 0 ? d.pandit.ratingAvg.toFixed(1) : "—"}
            sub={d.pandit.ratingCount > 0 ? t("pandit.fromReviews", { n: d.pandit.ratingCount }) : t("pandit.noRatingYet")}
            tone="info"
            icon={<Star className="h-4 w-4" />}
          />
        </div>

        {d.needsLiveLink.length > 0 && (
          <Panel title={t("pandit.pendingActions")}>
            <ul className="space-y-2">
              {d.needsLiveLink.map((b) => (
                <li key={b.id} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
                  <Video className="h-4.5 w-4.5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{locale === "hi" ? b.service.nameHi : b.service.nameEn}</p>
                    <p className="text-xs text-muted">{t("pandit.needsLiveLink")}</p>
                  </div>
                  <ButtonLink href={`/pandit/bookings/${b.id}`} size="sm" variant="secondary">
                    {t("pandit.addLiveLink")}
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Panel title={`${t("pandit.todaysBookings")} · ${formatDate(d.today, locale)}`}>
          {d.todayBookings.length ? (
            <div className="space-y-2.5">
              {d.todayBookings.map((b) => (
                <BookingCard key={b.id} booking={b} commissionPct={d.pandit.commissionPct} />
              ))}
            </div>
          ) : (
            <EmptyState className="py-8" title={t("pandit.noBookingsToday")} hint={t("pandit.noBookingsTodayHint")} />
          )}
        </Panel>

        {d.upcoming.length > 0 && (
          <Panel
            title={t("pandit.upcomingBookings")}
            action={
              <Link href="/pandit/bookings" className="text-xs font-semibold text-primary hover:underline">
                {t("common.viewAll")}
              </Link>
            }
          >
            <div className="space-y-2.5">
              {d.upcoming.map((b) => (
                <BookingCard key={b.id} booking={b} commissionPct={d.pandit.commissionPct} />
              ))}
            </div>
          </Panel>
        )}

        <Panel
          title={t("pandit.latestNotifications")}
          action={
            <Link href="/pandit/notifications" className="text-xs font-semibold text-primary hover:underline">
              {t("common.viewAll")}
            </Link>
          }
        >
          <NotificationList items={d.notifications} unread={d.unreadCount} compact />
        </Panel>
      </div>
    </div>
  );
}
