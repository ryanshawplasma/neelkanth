import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Phone, Video } from "lucide-react";
import { getT } from "@/i18n/server";
import { getBookingDetail } from "@/lib/pandit/queries";
import { mapsUrl, netEarning } from "@/lib/pandit/shared";
import { formatDate, formatDateTime, formatINR, loc, parseJson } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { InfoRow, ModeChip, Panel, StatusBadge } from "@/components/pandit/common";
import { BookingActions } from "@/components/pandit/booking-actions";

export const metadata: Metadata = { title: "Booking" };

type Devotee = { name?: string; gotra?: string; relation?: string };
type Addon = { slug?: string; name?: string; price?: number };

export default async function PanditBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, locale } = await getT();
  const data = await getBookingDetail(id);
  if (!data) notFound();
  const { pandit, booking } = data;

  const devotees = parseJson<Devotee[]>(booking.devotees, []);
  const addons = parseJson<Addon[]>(booking.addons, []);
  const photos = parseJson<string[]>(booking.photos, []);
  const net = netEarning(booking.amountTotal, pandit.commissionPct);
  const atHome = booking.type === "PANDIT_AT_HOME";
  const addressParts = [booking.addressLine, booking.city, booking.state, booking.pincode];

  return (
    <div className="space-y-4 px-4 pb-10 pt-5">
      <Link href="/pandit/bookings" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> {t("pandit.bookingsTitle")}
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <ModeChip type={booking.type} />
          <StatusBadge status={booking.status} />
          <span className="ml-auto text-xs font-semibold text-muted">{booking.code}</span>
        </div>
        <h1 className="mt-2 font-[var(--font-display)] text-xl font-bold leading-tight">{loc(booking.service, "name", locale)}</h1>
        <div className="mt-3 divide-y divide-border">
          {booking.package && <InfoRow label={t("pandit.packageLabel")} value={loc(booking.package, "name", locale)} />}
          <InfoRow
            label={t("pandit.scheduleLabel")}
            value={`${formatDate(booking.scheduledDate, locale)}${booking.scheduledSlot ? ` · ${booking.scheduledSlot}` : ""}`}
          />
          {booking.temple && <InfoRow label={t("common.atTemple")} value={`${loc(booking.temple, "name", locale)} · ${booking.temple.city}`} />}
          <InfoRow label={t("pandit.amountGross")} value={formatINR(booking.amountTotal, locale)} />
          <InfoRow label={t("pandit.commission")} value={`${pandit.commissionPct}%`} />
          <InfoRow label={t("pandit.netAmount")} value={<span className="text-success">{formatINR(net, locale)}</span>} />
          <InfoRow
            label={t("pandit.paymentLabel")}
            value={
              booking.payment?.status === "PAID" ? (
                <Badge tone="success">{t("pandit.paymentPaid")}</Badge>
              ) : (
                <Badge tone="warning">{t("pandit.paymentPending")}</Badge>
              )
            }
          />
        </div>
      </div>

      <BookingActions id={booking.id} status={booking.status} type={booking.type} liveLink={booking.liveLink} />

      {booking.liveLink && (
        <a
          href={booking.liveLink}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-2xl border border-maroon/25 bg-maroon-soft px-4 py-3 text-sm font-semibold text-maroon"
        >
          <Video className="h-4 w-4" /> {t("pandit.liveLinkLabel")} <ExternalLink className="ml-auto h-4 w-4" />
        </a>
      )}
      {booking.videoUrl && (
        <a
          href={booking.videoUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-primary"
        >
          <Video className="h-4 w-4" /> {t("pandit.watchVideoLink")} <ExternalLink className="ml-auto h-4 w-4" />
        </a>
      )}

      <Panel title={t("pandit.devoteesLabel")}>
        {devotees.length ? (
          <ul className="space-y-1.5">
            {devotees.map((d, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{d.name || `${t("common.devotees")} ${i + 1}`}</span>
                <span className="text-xs text-muted">
                  {[d.relation, d.gotra ? `${t("common.gotra")}: ${d.gotra}` : null].filter(Boolean).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">—</p>
        )}
        {booking.sankalpNote && (
          <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-sm">
            <span className="font-semibold">{t("pandit.sankalpLabel")}: </span>
            {booking.sankalpNote}
          </p>
        )}
      </Panel>

      {atHome && (
        <Panel title={t("pandit.addressLabel")}>
          <p className="text-sm">{addressParts.filter(Boolean).join(", ") || "—"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={mapsUrl(addressParts)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-2"
            >
              <MapPin className="h-4 w-4" /> {t("pandit.openInMaps")}
            </a>
            {booking.user.phone && (
              <a
                href={`tel:${booking.user.phone}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-surface-2"
              >
                <Phone className="h-4 w-4" /> {t("pandit.callDevotee")}
              </a>
            )}
          </div>
        </Panel>
      )}

      {addons.length > 0 && (
        <Panel title={t("pandit.addonsLabel")}>
          <ul className="divide-y divide-border">
            {addons.map((a, i) => (
              <li key={i} className="flex items-center justify-between py-1.5 text-sm">
                <span>{a.name || a.slug}</span>
                <span className="font-medium">{formatINR(a.price ?? 0, locale)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {photos.length > 0 && (
        <Panel title={t("pandit.poojaPhotos")}>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p} src={p} alt="" className="aspect-square w-full rounded-xl border border-border object-cover" />
            ))}
          </div>
        </Panel>
      )}

      <Panel title={t("pandit.timeline")}>
        {booking.timeline.length ? (
          <ol className="space-y-3">
            {booking.timeline.map((e) => (
              <li key={e.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    <StatusBadge status={e.status} />
                  </p>
                  {e.note && <p className="mt-1 text-xs text-muted">{e.note}</p>}
                  <p className="mt-0.5 text-[11px] text-muted">
                    {formatDateTime(e.createdAt, locale)} · {e.actorRole ?? "SYSTEM"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted">{t("pandit.noTimeline")}</p>
        )}
      </Panel>

      {booking.panditNote && (
        <Panel title={t("pandit.panditNote")}>
          <p className="text-sm">{booking.panditNote}</p>
        </Panel>
      )}
    </div>
  );
}
