"use client";

import { useState, useTransition } from "react";
import { Star, XCircle } from "lucide-react";
import { useT } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { actionErrorKey } from "@/lib/app/helpers";
import { cancelBookingAction, retryPaymentAction, submitReviewAction } from "@/lib/app/booking-actions";

export function RetryPaymentButton({ bookingId }: { bookingId: string }) {
  const t = useT();
  const [pending, start] = useTransition();
  const { toast } = useToast();
  return (
    <Button
      full
      size="lg"
      loading={pending}
      onClick={() =>
        start(async () => {
          const res = await retryPaymentAction(bookingId);
          if (res && !res.ok) toast(t(actionErrorKey(res.error)), "error");
        })
      }
    >
      {t("app.retryPayment")}
    </Button>
  );
}

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const t = useT();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/40 py-3 text-[14px] font-semibold text-danger"
      >
        <XCircle className="h-4 w-4" /> {t("app.cancelBooking")}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title={t("app.cancelConfirmTitle")}>
        <p className="text-[13px] text-muted">{t("app.cancelConfirmHint")}</p>
        <div className="mt-3">
          <Field label={t("app.cancelReason")}>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          </Field>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" full onClick={() => setOpen(false)}>
            {t("common.close")}
          </Button>
          <Button
            variant="danger"
            full
            loading={pending}
            onClick={() =>
              start(async () => {
                const res = await cancelBookingAction(bookingId, reason);
                if (res.ok) {
                  toast(t("app.cancelled"), "info");
                  setOpen(false);
                } else toast(t(actionErrorKey(res.error)), "error");
              })
            }
          >
            {t("common.confirm")}
          </Button>
        </div>
      </Sheet>
    </>
  );
}

export function ReviewBox({
  bookingId,
  existing,
}: {
  bookingId: string;
  existing: { rating: number; comment: string | null } | null;
}) {
  const t = useT();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(!!existing);

  return (
    <>
      {saved ? (
        <div className="rounded-2xl border border-border bg-surface p-3.5">
          <p className="text-[13px] font-semibold">{t("app.yourReview")}</p>
          <div className="mt-1 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={cn("h-4 w-4", i <= rating ? "fill-gold text-gold" : "text-border")} />
            ))}
          </div>
          {comment && <p className="mt-1.5 text-[13px] text-muted">{comment}</p>}
          <button onClick={() => setOpen(true)} className="mt-2 text-[12.5px] font-semibold text-primary">
            {t("common.edit")}
          </button>
        </div>
      ) : (
        <Button full variant="gold" size="lg" icon={<Star className="h-4 w-4" />} onClick={() => setOpen(true)}>
          {t("app.writeReview")}
        </Button>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={t("app.rateExperience")}>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setRating(i)} aria-label={`${i}`} className="p-1">
              <Star className={cn("h-8 w-8 transition-transform active:scale-90", i <= rating ? "fill-gold text-gold" : "text-border")} />
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Field label={t("app.yourReview")}>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder={t("app.reviewPlaceholder")} />
          </Field>
        </div>
        <Button
          full
          size="lg"
          className="mt-4"
          loading={pending}
          onClick={() =>
            start(async () => {
              const res = await submitReviewAction(bookingId, rating, comment || undefined);
              if (res.ok) {
                setSaved(true);
                setOpen(false);
                toast(t("app.reviewThanks"));
              } else toast(t(actionErrorKey(res.error)), "error");
            })
          }
        >
          {t("common.submit")}
        </Button>
      </Sheet>
    </>
  );
}
