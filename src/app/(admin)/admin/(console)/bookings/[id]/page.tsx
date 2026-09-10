import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, CreditCard, ExternalLink, MapPin, Star, UserCheck, Users } from "lucide-react";
import { AdminPageHeader, DetailList, DetailRow, Panel } from "@/components/admin/page-shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { JsonView } from "@/components/admin/json-view";
import {
  AssignPanditSheet,
  BookingMediaForm,
  MarkPaidButton,
  RefundButton,
  StatusActions,
  type Candidate,
} from "@/components/admin/booking-actions-ui";
import { Avatar, Stars } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { getBookingDetail, getEligiblePandits } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import { BOOKING_STATUSES, SERVICE_TYPES, labelOf } from "@/lib/constants";
import { BOOKING_TRANSITIONS } from "@/lib/admin/util";
import { formatDate, formatDateTime, formatINR, loc, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Devotee = { name?: string; gotra?: string; relation?: string };
type Addon = { slug?: string; name?: string; nameEn?: string; price?: number };

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { t, locale } = await getT();
  const booking = await getBookingDetail(id);
  if (!booking) notFound();

  const eligible = booking.service.requiresPandit ? await getEligiblePandits(booking.serviceId, booking.city) : [];
  const candidates: Candidate[] = eligible.map((p) => ({
    id: p.id,
    name: locale === "hi" ? p.displayNameHi || p.displayName : p.displayName,
    city: p.city,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    verified: p.verified,
    photoUrl: p.photoUrl,
    overridePrice: p.overridePrice,
    sameCity: !!(booking.city && p.city && booking.city.toLowerCase() === p.city.toLowerCase()),
  }));

  const devotees = parseJson<Devotee[]>(booking.devotees, []);
  const addons = parseJson<Addon[]>(booking.addons, []);
  const photos = parseJson<string[]>(booking.photos, []);
  const allowed = BOOKING_TRANSITIONS[booking.status] ?? [];
  const statusLabels = Object.fromEntries(BOOKING_STATUSES.map((s) => [s.value, labelOf(BOOKING_STATUSES, s.value, locale)]));
  const canRefund = booking.payment?.status === "PAID" && booking.status !== "REFUNDED";

  return (
    <>
      <AdminPageHeader
        back="/admin/bookings"
        backLabel={t("admin.bookingsTitle")}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {booking.code}
            <StatusBadge kind="booking" value={booking.status} locale={locale} />
          </span>
        }
        subtitle={`${loc(booking.service, "name", locale)} · ${formatDateTime(booking.createdAt, locale)}`}
        actions={
          <>
            <Link
              href={`/bookings/${booking.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-surface-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("admin.viewAsDevotee")}
            </Link>
            {booking.status === "PENDING_PAYMENT" && <MarkPaidButton bookingId={booking.id} />}
            {canRefund && <RefundButton bookingId={booking.id} amount={booking.amountTotal} />}
            {booking.service.requiresPandit && (
              <AssignPanditSheet
                bookingId={booking.id}
                candidates={candidates}
                currentPanditId={booking.panditId}
                canAutoAssign={!booking.panditId && candidates.length > 0}
              />
            )}
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title={t("admin.bookingDetails")} icon={<CalendarCheck className="h-4 w-4 text-muted" />}>
            <DetailList>
              <DetailRow label={t("admin.colService")}>
                <Link href={`/admin/services/${booking.serviceId}`} className="font-medium hover:text-primary hover:underline">
                  {loc(booking.service, "name", locale)}
                </Link>
                <span className="ml-2 text-xs text-muted">{labelOf(SERVICE_TYPES, booking.type, locale)}</span>
              </DetailRow>
              <DetailRow label={t("admin.package")}>
                {booking.package ? `${loc(booking.package, "name", locale)} · ${formatINR(booking.package.price, locale)}` : "—"}
              </DetailRow>
              <DetailRow label={t("admin.addons")}>
                {addons.length ? (
                  <ul className="space-y-0.5">
                    {addons.map((a, i) => (
                      <li key={i} className="text-sm">
                        {a.name ?? a.nameEn ?? a.slug} {a.price !== undefined && <span className="text-muted">· {formatINR(a.price, locale)}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label={t("admin.schedule")}>
                {formatDate(booking.scheduledDate, locale)}
                {booking.scheduledSlot ? ` · ${booking.scheduledSlot}` : ""}
              </DetailRow>
              <DetailRow label={t("common.devotees")}>
                {devotees.length ? (
                  <ul className="space-y-0.5">
                    {devotees.map((d, i) => (
                      <li key={i} className="text-sm">
                        {d.name}
                        {d.gotra && <span className="text-muted"> · {t("common.gotra")}: {d.gotra}</span>}
                        {d.relation && <span className="text-muted"> · {d.relation}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label={t("admin.sankalp")}>{booking.sankalpNote || "—"}</DetailRow>
              {(booking.addressLine || booking.city) && (
                <DetailRow label={t("common.address")}>
                  <span className="inline-flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                    <span>
                      {[booking.addressLine, booking.city, booking.state, booking.pincode].filter(Boolean).join(", ")}
                    </span>
                  </span>
                </DetailRow>
              )}
              <DetailRow label={t("admin.amounts")}>
                <span className="tabular-nums">
                  {t("admin.amountBase")}: {formatINR(booking.amountBase, locale)}
                  {booking.amountAddons > 0 && <> · {t("admin.addons")}: {formatINR(booking.amountAddons, locale)}</>}
                  {booking.amountDiscount > 0 && <> · {t("common.discount")}: −{formatINR(booking.amountDiscount, locale)}</>}
                  {booking.couponCode && <> · {booking.couponCode}</>}
                </span>
                <div className="mt-1 text-base font-bold">{formatINR(booking.amountTotal, locale)}</div>
              </DetailRow>
              {booking.panditNote && <DetailRow label={t("admin.panditNote")}>{booking.panditNote}</DetailRow>}
              {booking.cancelReason && <DetailRow label={t("admin.cancelReason")}>{booking.cancelReason}</DetailRow>}
            </DetailList>
          </Panel>

          <Panel title={t("admin.changeStatus")}>
            <StatusActions bookingId={booking.id} allowed={allowed} labels={statusLabels} />
          </Panel>

          <Panel title={t("admin.mediaAndNotes")}>
            <BookingMediaForm
              bookingId={booking.id}
              liveLink={booking.liveLink ?? ""}
              videoUrl={booking.videoUrl ?? ""}
              photos={photos}
              adminNote={booking.adminNote ?? ""}
            />
          </Panel>

          <Panel title={t("admin.timeline")} bodyClassName="p-0">
            <ol className="divide-y divide-border">
              {booking.timeline.map((e) => (
                <li key={e.id} className="flex items-start gap-3 px-4 py-2.5">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{statusLabels[e.status] ?? e.status}</p>
                    {e.note && <p className="text-xs text-muted">{e.note}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {formatDateTime(e.createdAt, locale)} · {e.actorRole ?? "—"}
                  </span>
                </li>
              ))}
              {!booking.timeline.length && <li className="px-4 py-6 text-center text-sm text-muted">{t("admin.noEvents")}</li>}
            </ol>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title={t("admin.devotee")} icon={<Users className="h-4 w-4 text-muted" />}>
            <div className="flex items-center gap-3">
              <Avatar src={booking.user.avatarUrl} name={booking.user.name} size={44} />
              <div className="min-w-0">
                <Link href={`/admin/users/${booking.userId}`} className="block truncate font-medium hover:text-primary hover:underline">
                  {booking.user.name ?? t("admin.noName")}
                </Link>
                <p className="truncate text-xs text-muted">{booking.user.phone ?? booking.user.email ?? "—"}</p>
              </div>
            </div>
            <DetailList className="mt-3">
              <DetailRow label={t("common.city")}>{[booking.user.city, booking.user.state].filter(Boolean).join(", ") || "—"}</DetailRow>
              <DetailRow label={t("common.gotra")}>{booking.user.gotra || "—"}</DetailRow>
              <DetailRow label={t("common.language")}>{booking.user.locale === "hi" ? t("common.hindi") : t("common.english")}</DetailRow>
            </DetailList>
          </Panel>

          <Panel title={t("admin.payment")} icon={<CreditCard className="h-4 w-4 text-muted" />}>
            {booking.payment ? (
              <DetailList>
                <DetailRow label={t("common.status")}>
                  <StatusBadge kind="payment" value={booking.payment.status} locale={locale} />
                </DetailRow>
                <DetailRow label={t("common.total")}>{formatINR(booking.payment.amount, locale)}</DetailRow>
                <DetailRow label={t("admin.provider")}>{booking.payment.provider}</DetailRow>
                <DetailRow label={t("admin.method")}>{booking.payment.method ?? "—"}</DetailRow>
                <DetailRow label={t("admin.paymentId")}>
                  <code className="break-all text-xs">{booking.payment.paymentId ?? booking.payment.orderId ?? "—"}</code>
                </DetailRow>
                {booking.payment.refundId && <DetailRow label={t("admin.refundId")}>{booking.payment.refundId}</DetailRow>}
                {booking.payment.raw && (
                  <DetailRow label={t("admin.rawPayload")}>
                    <JsonView value={booking.payment.raw} max={400} />
                  </DetailRow>
                )}
              </DetailList>
            ) : (
              <p className="text-sm text-muted">{t("admin.noPayment")}</p>
            )}
          </Panel>

          <Panel title={t("admin.pandit")} icon={<UserCheck className="h-4 w-4 text-muted" />}>
            {booking.pandit ? (
              <>
                <div className="flex items-center gap-3">
                  <Avatar src={booking.pandit.photoUrl} name={booking.pandit.displayName} size={44} />
                  <div className="min-w-0">
                    <Link href={`/admin/pandits/${booking.pandit.id}`} className="block truncate font-medium hover:text-primary hover:underline">
                      {locale === "hi" ? booking.pandit.displayNameHi || booking.pandit.displayName : booking.pandit.displayName}
                    </Link>
                    <p className="truncate text-xs text-muted">{booking.pandit.user.phone ?? "—"}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Stars value={booking.pandit.ratingAvg} count={booking.pandit.ratingCount} />
                  {booking.pandit.verified && <Badge tone="success">{t("common.verified")}</Badge>}
                  <Badge tone="muted">{booking.pandit.city ?? "—"}</Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">{booking.service.requiresPandit ? t("admin.noPanditAssigned") : t("admin.panditNotRequired")}</p>
            )}
          </Panel>

          {booking.review && (
            <Panel title={t("common.reviews")} icon={<Star className="h-4 w-4 text-muted" />}>
              <Stars value={booking.review.rating} />
              <p className="mt-2 text-sm">{booking.review.comment ?? "—"}</p>
              <p className="mt-1 text-xs text-muted">{formatDateTime(booking.review.createdAt, locale)}</p>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
