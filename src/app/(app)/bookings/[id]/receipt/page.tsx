import { notFound, redirect } from "next/navigation";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getBooking } from "@/lib/app/queries";
import { formatDate, formatDateTime, formatINR, loc, parseJson } from "@/lib/utils";
import { formatSlot } from "@/lib/app/helpers";
import { BackButton, PrintButton } from "@/components/app/bits";
import type { BookingAddon, BookingDevotee } from "@/lib/app/types";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, locale } = await getT();
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/bookings/${id}/receipt`)}`);
  const b = await getBooking(user.id, id);
  if (!b) notFound();

  const devotees = parseJson<BookingDevotee[]>(b.devotees, []);
  const addons = parseJson<BookingAddon[]>(b.addons, []);

  return (
    <div className="pb-10">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-surface/95 px-3 py-2.5 backdrop-blur print:hidden">
        <BackButton fallback={`/bookings/${b.id}`} className="bg-transparent shadow-none" />
        <h1 className="flex-1 truncate text-[15px] font-semibold">{t("app.receiptTitle")}</h1>
      </header>

      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-border bg-surface p-5 print:border-0 print:shadow-none">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-kesari text-lg text-white">ॐ</span>
            <div>
              <p className="text-[15px] font-bold leading-tight">{t("common.appName")}</p>
              <p className="text-[11px] text-muted">{t("app.receiptTitle")}</p>
            </div>
            <p className="ml-auto text-right text-[11px] text-muted">
              {t("app.bookingCode", { code: b.code })}
              <br />
              {formatDateTime(b.createdAt, locale)}
            </p>
          </div>

          <dl className="mt-4 space-y-2 text-[13px]">
            <Row label={t("common.name")} value={b.user.name ?? "—"} />
            <Row label={t("common.phone")} value={b.user.phone ?? "—"} />
            <Row label={t("common.poojas")} value={loc(b.service, "name", locale)} />
            {b.package && <Row label={t("app.packagePrice")} value={loc(b.package, "name", locale)} />}
            <Row
              label={t("common.date")}
              value={`${formatDate(b.scheduledDate, locale, { day: "numeric", month: "long", year: "numeric" })}${
                b.scheduledSlot ? ` · ${formatSlot(b.scheduledSlot, locale)}` : ""
              }`}
            />
            {devotees.length > 0 && <Row label={t("app.devoteesLabel")} value={devotees.map((d) => `${d.name} (${d.gotra || "Kashyap"})`).join(", ")} />}
            {b.addressLine && <Row label={t("app.addressLabel")} value={[b.addressLine, b.city, b.state, b.pincode].filter(Boolean).join(", ")} />}
          </dl>

          <div className="mt-4 border-t border-border pt-3">
            <dl className="space-y-2 text-[13px]">
              <Row label={t("app.packagePrice")} value={formatINR(b.amountBase, locale)} />
              {addons.map((a) => (
                <Row key={a.slug} label={locale === "hi" ? a.nameHi : a.nameEn} value={formatINR(a.price, locale)} />
              ))}
              {b.amountDiscount > 0 && <Row label={`${t("common.discount")}${b.couponCode ? ` (${b.couponCode})` : ""}`} value={`− ${formatINR(b.amountDiscount, locale)}`} />}
              <div className="flex justify-between gap-3 border-t border-border pt-2 text-[15px] font-bold">
                <dt>{t("common.total")}</dt>
                <dd>{formatINR(b.amountTotal, locale)}</dd>
              </div>
            </dl>
          </div>

          <p className="mt-4 text-[11.5px] text-muted">
            {t("app.paymentSection")}: {b.payment?.status ?? "—"}
            {b.payment?.method ? ` · ${b.payment.method}` : ""}
            {b.payment?.paymentId ? ` · ${b.payment.paymentId}` : ""}
          </p>
          <p className="mt-4 border-t border-border pt-3 text-center text-[11px] text-muted">{t("common.poweredBy")}</p>
        </div>

        <div className="mt-4 flex justify-center print:hidden">
          <PrintButton label={t("app.print")} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-right font-medium">{value}</dd>
    </div>
  );
}
