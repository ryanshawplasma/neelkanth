import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, ChevronRight, Clock3, FileText, MapPin, MessageCircle, Phone, Radio, Users } from "lucide-react";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getBooking } from "@/lib/app/queries";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { BOOKING_STATUSES, PANDIT_CLASSIFICATIONS, labelOf } from "@/lib/constants";
import { formatDate, formatDateTime, formatINR, loc, parseJson } from "@/lib/utils";
import { formatSlot, imageOf, mapsUrl, youtubeEmbed } from "@/lib/app/helpers";
import { BackButton, PaidBanner, ShareButton } from "@/components/app/bits";
import { CancelBookingButton, RetryPaymentButton, ReviewBox } from "@/components/app/booking-actions";
import type { BookingAddon, BookingDevotee } from "@/lib/app/types";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { t, locale } = await getT();
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/bookings/${id}`)}`);

  const b = await getBooking(user.id, id);
  if (!b) notFound();

  const devotees = parseJson<BookingDevotee[]>(b.devotees, []);
  const addons = parseJson<BookingAddon[]>(b.addons, []);
  const photos = parseJson<string[]>(b.photos, []);
  const status = BOOKING_STATUSES.find((s) => s.value === b.status);
  const embed = youtubeEmbed(b.videoUrl);
  const canCancel = ["PENDING_PAYMENT", "CONFIRMED", "ASSIGNED"].includes(b.status) && b.scheduledDate > new Date().toISOString().slice(0, 10);
  const canRetry = ["FAILED", "PENDING_PAYMENT"].includes(b.status);
  const showLive = ["ASSIGNED", "IN_PROGRESS"].includes(b.status) && !!b.liveLink;
  const serviceName = loc(b.service, "name", locale);

  return (
    <div className="pb-10">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-surface/95 px-3 py-2.5 backdrop-blur">
        <BackButton fallback="/bookings" className="bg-transparent shadow-none" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold leading-tight">{serviceName}</h1>
          <p className="truncate text-[11.5px] text-muted">{t("app.bookingCode", { code: b.code })}</p>
        </div>
        <ShareButton title={serviceName} className="bg-transparent shadow-none" />
      </header>

      <div className="space-y-4 px-4 pt-4">
        {sp.paid === "1" && <PaidBanner title={t("app.paidTitle")} body={t("app.paidBody")} />}
        {sp.failed === "1" && (
          <div className="rounded-2xl border border-danger/30 bg-danger-soft p-3.5">
            <p className="text-[14px] font-bold text-danger">{t("app.failedTitle")}</p>
            <p className="mt-1 text-[12.5px] text-danger/85">{t("app.failedBody")}</p>
          </div>
        )}

        {/* service card */}
        <Link href={`/pooja/${b.service.slug}`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageOf(b.service, "services", b.service.slug)} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold leading-tight">{serviceName}</p>
            {b.temple && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] text-muted">
                <MapPin className="h-3 w-3" />
                {loc(b.temple, "name", locale)} · {b.temple.city}
              </p>
            )}
            {b.package && <p className="mt-0.5 text-[11.5px] text-muted">{loc(b.package, "name", locale)}</p>}
          </div>
          <Badge tone={toneForStatus(status?.tone)}>{labelOf(BOOKING_STATUSES, b.status, locale)}</Badge>
        </Link>

        {/* live link */}
        {showLive && (
          <a
            href={b.liveLink!}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-danger py-3.5 text-[14.5px] font-semibold text-white"
          >
            <Radio className="h-4 w-4 animate-pulse" /> {t("app.joinLive")}
          </a>
        )}

        {/* schedule */}
        <section className="rounded-2xl border border-border bg-surface p-3.5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">{t("app.scheduleSection")}</h2>
          <p className="mt-2 flex items-center gap-2 text-[14px] font-semibold">
            <CalendarDays className="h-4 w-4 text-primary" />
            {formatDate(b.scheduledDate, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          {b.scheduledSlot && (
            <p className="mt-1 flex items-center gap-2 text-[13px] text-muted">
              <Clock3 className="h-4 w-4" /> {formatSlot(b.scheduledSlot, locale)}
            </p>
          )}
          <p className="mt-1 text-[11.5px] text-muted">
            {t("app.bookedOn")}: {formatDateTime(b.createdAt, locale)}
          </p>
        </section>

        {/* devotees */}
        {devotees.length > 0 && (
          <section className="rounded-2xl border border-border bg-surface p-3.5">
            <h2 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-muted">
              <Users className="h-3.5 w-3.5" /> {t("app.devoteesLabel")}
            </h2>
            <ul className="mt-2 space-y-1.5">
              {devotees.map((d, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-[13.5px]">
                  <span className="font-medium">{d.name}</span>
                  <span className="text-[12px] text-muted">{d.gotra || "Kashyap"}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* sankalp */}
        {b.sankalpNote && (
          <section className="rounded-2xl border border-border bg-gold-soft p-3.5">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[#8a6300]">{t("app.sankalpLabel")}</h2>
            <p className="mt-1.5 whitespace-pre-line text-[13.5px] leading-snug">{b.sankalpNote}</p>
          </section>
        )}

        {/* pandit */}
        {b.pandit && (
          <section className="rounded-2xl border border-border bg-surface p-3.5">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">{t("app.panditSection")}</h2>
            <div className="mt-2 flex items-center gap-3">
              {b.pandit.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.pandit.photoUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full gradient-kesari text-lg font-bold text-white">
                  {b.pandit.displayName.slice(0, 1)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold">
                  {locale === "hi" && b.pandit.displayNameHi ? b.pandit.displayNameHi : b.pandit.displayName}
                  {b.pandit.verified && <span className="ml-1 text-info">✔</span>}
                </p>
                <p className="truncate text-[11.5px] text-muted">{labelOf(PANDIT_CLASSIFICATIONS, b.pandit.classification, locale)}</p>
              </div>
              {b.pandit.user.phone && (
                <a
                  href={`tel:${b.pandit.user.phone}`}
                  className="flex h-10 items-center gap-1.5 rounded-full bg-success-soft px-3 text-[12.5px] font-semibold text-success"
                >
                  <Phone className="h-3.5 w-3.5" /> {t("common.call")}
                </a>
              )}
            </div>
          </section>
        )}

        {/* address */}
        {b.addressLine && (
          <section className="rounded-2xl border border-border bg-surface p-3.5">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">{t("app.addressLabel")}</h2>
            <p className="mt-1.5 text-[13.5px] leading-snug">
              {[b.addressLine, b.city, b.state, b.pincode].filter(Boolean).join(", ")}
            </p>
            <a
              href={mapsUrl(null, null, [b.addressLine, b.city, b.pincode].filter(Boolean).join(", ")) ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-[12.5px] font-semibold text-primary"
            >
              {t("app.openInMaps")}
            </a>
          </section>
        )}

        {/* video */}
        {b.videoUrl && (
          <section>
            <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted">{t("app.poojaVideo")}</h2>
            <div className="overflow-hidden rounded-2xl border border-border bg-black">
              {embed ? (
                <iframe src={embed} title={t("app.poojaVideo")} allowFullScreen className="aspect-video w-full" />
              ) : (
                <video src={b.videoUrl} controls className="aspect-video w-full" />
              )}
            </div>
          </section>
        )}

        {/* photos */}
        {photos.length > 0 && (
          <section>
            <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted">{t("app.poojaPhotos")}</h2>
            <div className="grid grid-cols-3 gap-1.5">
              {photos.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={p} alt="" className="aspect-square w-full rounded-xl object-cover" />
              ))}
            </div>
          </section>
        )}

        {/* addons */}
        {addons.length > 0 && (
          <section className="rounded-2xl border border-border bg-surface p-3.5">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">{t("app.addonsLabel")}</h2>
            <ul className="mt-2 space-y-1.5 text-[13.5px]">
              {addons.map((a) => (
                <li key={a.slug} className="flex justify-between gap-3">
                  <span>{locale === "hi" ? a.nameHi : a.nameEn}</span>
                  <span className="font-medium">{formatINR(a.price, locale)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* price */}
        <section className="rounded-2xl border border-border bg-surface p-3.5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">{t("app.priceBreakdown")}</h2>
          <dl className="mt-2 space-y-1.5 text-[13.5px]">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">{t("app.packagePrice")}</dt>
              <dd className="font-medium">{formatINR(b.amountBase, locale)}</dd>
            </div>
            {b.amountAddons > 0 && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t("app.addonsTotal")}</dt>
                <dd className="font-medium">{formatINR(b.amountAddons, locale)}</dd>
              </div>
            )}
            {b.amountDiscount > 0 && (
              <div className="flex justify-between gap-3 text-success">
                <dt>
                  {t("common.discount")}
                  {b.couponCode ? ` · ${b.couponCode}` : ""}
                </dt>
                <dd className="font-medium">− {formatINR(b.amountDiscount, locale)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-border pt-2 text-[15px] font-bold">
              <dt>{t("common.total")}</dt>
              <dd>{formatINR(b.amountTotal, locale)}</dd>
            </div>
          </dl>
          {b.payment && (
            <p className="mt-2 flex items-center justify-between gap-2 text-[12.5px]">
              <span className="text-muted">{t("app.paymentSection")}</span>
              <Badge
                tone={
                  b.payment.status === "PAID" ? "success" : b.payment.status === "FAILED" ? "danger" : b.payment.status === "REFUNDED" ? "muted" : "warning"
                }
              >
                {b.payment.status === "PAID"
                  ? t("app.paymentPaid")
                  : b.payment.status === "FAILED"
                    ? t("app.paymentFailed")
                    : b.payment.status === "REFUNDED"
                      ? t("app.paymentRefunded")
                      : t("app.paymentPending")}
                {b.payment.method ? ` · ${b.payment.method}` : ""}
              </Badge>
            </p>
          )}
          <Link
            href={`/bookings/${b.id}/receipt`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12.5px] font-semibold"
          >
            <FileText className="h-3.5 w-3.5" /> {t("app.downloadReceipt")}
          </Link>
        </section>

        {/* timeline */}
        {b.timeline.length > 0 && (
          <section className="rounded-2xl border border-border bg-surface p-3.5">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">{t("app.bookingTimeline")}</h2>
            <ol className="mt-3">
              {b.timeline.map((e, i) => (
                <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < b.timeline.length - 1 && <span className="absolute left-[7px] top-4 bottom-0 w-px bg-border" aria-hidden />}
                  <span className={`z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full ${i === b.timeline.length - 1 ? "bg-primary" : "bg-border"}`} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-tight">{labelOf(BOOKING_STATUSES, e.status, locale)}</p>
                    {e.note && <p className="mt-0.5 text-[12px] leading-snug text-muted">{e.note}</p>}
                    <p className="mt-0.5 text-[11px] text-muted">{formatDateTime(e.createdAt, locale)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* help */}
        <Link
          href={`/support?booking=${b.id}`}
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 hover:border-primary/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold leading-tight">{t("app.needHelpBooking")}</span>
            <span className="mt-0.5 block text-[12.5px] text-muted">{t("app.chatWithUs")}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>

        {/* actions */}
        <div className="space-y-2.5 pt-1">
          {canRetry && <RetryPaymentButton bookingId={b.id} />}
          {b.status === "COMPLETED" && <ReviewBox bookingId={b.id} existing={b.review ? { rating: b.review.rating, comment: b.review.comment } : null} />}
          {canCancel && <CancelBookingButton bookingId={b.id} />}
        </div>
      </div>
    </div>
  );
}
