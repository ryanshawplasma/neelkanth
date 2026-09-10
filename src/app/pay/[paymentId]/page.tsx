import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { formatDate, loc } from "@/lib/utils";
import { formatSlot, imageOf } from "@/lib/app/helpers";
import { PayForm } from "@/components/app/pay-form";

export const dynamic = "force-dynamic";

export default async function PayPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const { locale } = await getT();
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/pay/${paymentId}`)}`);

  const payment = await db.payment.findFirst({
    where: { id: paymentId, booking: { userId: user.id } },
    include: { booking: { include: { service: true } } },
  });
  if (!payment) notFound();
  if (payment.status === "PAID") redirect(`/bookings/${payment.bookingId}?paid=1`);

  const b = payment.booking;
  const schedule = `${formatDate(b.scheduledDate, locale, { weekday: "short", day: "numeric", month: "short" })}${
    b.scheduledSlot ? ` · ${formatSlot(b.scheduledSlot, locale)}` : ""
  }`;

  return (
    <div className="bg-devotional flex min-h-dvh flex-1 justify-center">
      <div className="relative flex w-full max-w-md flex-col bg-background shadow-[0_0_60px_-20px_rgba(139,30,45,0.35)]">
        <PayForm
          paymentId={payment.id}
          amount={payment.amount}
          provider={payment.provider}
          razorpayKey={process.env.RAZORPAY_KEY_ID ?? null}
          orderId={payment.orderId}
          serviceName={loc(b.service, "name", locale)}
          bookingCode={b.code}
          imageUrl={imageOf(b.service, "services", b.service.slug)}
          scheduleLine={schedule}
        />
      </div>
    </div>
  );
}
