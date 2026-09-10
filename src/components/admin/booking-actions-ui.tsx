"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, IndianRupee, Save, UserCheck, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input, Textarea } from "@/components/ui/input";
import { MultiImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/ui/toast";
import { Avatar, Stars } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/i18n/client";
import { formatINR } from "@/lib/utils";
import {
  assignPanditAction,
  autoAssignAction,
  markPaidManuallyAction,
  refundBookingAction,
  transitionBookingAction,
  updateBookingMediaAction,
} from "@/lib/admin/booking-actions";
import { tErr } from "./action-button";

export type Candidate = {
  id: string;
  name: string;
  city: string | null;
  ratingAvg: number;
  ratingCount: number;
  verified: boolean;
  photoUrl: string | null;
  overridePrice: number | null;
  sameCity: boolean;
};

/** Assign / reassign the pandit from a side sheet of eligible candidates. */
export function AssignPanditSheet({
  bookingId,
  candidates,
  currentPanditId,
  canAutoAssign,
}: {
  bookingId: string;
  candidates: Candidate[];
  currentPanditId: string | null;
  canAutoAssign: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    start(async () => {
      const res = await fn();
      if (!res.ok) {
        toast(tErr(t, res.error), "error");
        return;
      }
      toast(okMsg, "success");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button size="sm" variant="primary" icon={<UserCheck className="h-4 w-4" />} onClick={() => setOpen(true)}>
        {currentPanditId ? t("admin.reassignPandit") : t("admin.assignPandit")}
      </Button>

      <Sheet open={open} onClose={() => setOpen(false)} title={t("admin.assignPanditTitle")} side="center" className="sm:max-w-xl">
        {canAutoAssign && (
          <Button
            full
            variant="secondary"
            className="mb-3"
            loading={pending}
            icon={<Wand2 className="h-4 w-4" />}
            onClick={() => run(() => autoAssignAction(bookingId), t("admin.assigned"))}
          >
            {t("admin.autoAssign")}
          </Button>
        )}

        <Field label={t("admin.assignNote")} hint={t("admin.assignNoteHint")}>
          <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-10" />
        </Field>

        <ul className="mt-3 space-y-2">
          {candidates.length === 0 && <li className="rounded-xl bg-surface-2 p-4 text-center text-sm text-muted">{t("admin.noEligiblePandits")}</li>}
          {candidates.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
              <Avatar src={c.photoUrl} name={c.name} size={36} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                  {c.name}
                  {c.verified && <Badge tone="success">{t("common.verified")}</Badge>}
                  {c.sameCity && <Badge tone="info">{t("admin.sameCity")}</Badge>}
                </p>
                <p className="flex items-center gap-2 text-xs text-muted">
                  {c.city ?? "—"}
                  <Stars value={c.ratingAvg} count={c.ratingCount} />
                  {c.overridePrice !== null && <span>{formatINR(c.overridePrice)}</span>}
                </p>
              </div>
              <Button
                size="sm"
                variant={c.id === currentPanditId ? "outline" : "primary"}
                disabled={c.id === currentPanditId || pending}
                onClick={() => run(() => assignPanditAction(bookingId, c.id, note || undefined), t("admin.assigned"))}
              >
                {c.id === currentPanditId ? t("admin.current") : t("admin.assign")}
              </Button>
            </li>
          ))}
        </ul>

        {currentPanditId && (
          <Button
            full
            variant="ghost"
            className="mt-3 text-danger"
            icon={<X className="h-4 w-4" />}
            loading={pending}
            onClick={() => run(() => assignPanditAction(bookingId, null, note || undefined), t("admin.panditRemoved"))}
          >
            {t("admin.unassignPandit")}
          </Button>
        )}
      </Sheet>
    </>
  );
}

/** Status transition buttons with an optional note. */
export function StatusActions({ bookingId, allowed, labels }: { bookingId: string; allowed: string[]; labels: Record<string, string> }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [target, setTarget] = useState<string | null>(null);

  function apply(status: string) {
    start(async () => {
      const res = await transitionBookingAction(bookingId, status, note || undefined);
      if (!res.ok) {
        toast(tErr(t, res.error), "error");
        return;
      }
      toast(t("admin.statusUpdated"), "success");
      setTarget(null);
      setNote("");
      router.refresh();
    });
  }

  if (!allowed.length) return <p className="text-xs text-muted">{t("admin.noTransitions")}</p>;

  return (
    <div className="space-y-2">
      <Field label={t("admin.transitionNote")}>
        <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-9 text-sm" placeholder={t("admin.transitionNoteHint")} />
      </Field>
      <div className="flex flex-wrap gap-2">
        {allowed.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={s === "CANCELLED" || s === "FAILED" ? "outline" : "secondary"}
            className={s === "CANCELLED" || s === "FAILED" ? "text-danger" : undefined}
            loading={pending && target === s}
            onClick={() => {
              setTarget(s);
              apply(s);
            }}
          >
            {labels[s] ?? s}
          </Button>
        ))}
      </div>
    </div>
  );
}

/** Live link, recording URL, pooja photos and the internal note. */
export function BookingMediaForm({
  bookingId,
  liveLink,
  videoUrl,
  photos,
  adminNote,
}: {
  bookingId: string;
  liveLink: string;
  videoUrl: string;
  photos: string[];
  adminNote: string;
}) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ liveLink, videoUrl, adminNote });
  const [pics, setPics] = useState<string[]>(photos);

  return (
    <div className="space-y-3">
      <Field label={t("admin.liveLink")} hint={t("admin.liveLinkHint")}>
        <Input value={form.liveLink} onChange={(e) => setForm({ ...form, liveLink: e.target.value })} placeholder="https://youtube.com/live/…" className="h-10" />
      </Field>
      <Field label={t("admin.videoUrl")} hint={t("admin.videoUrlHint")}>
        <Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://…" className="h-10" />
      </Field>
      <div>
        <p className="mb-1.5 text-sm font-medium">{t("admin.poojaPhotos")}</p>
        <MultiImageUpload value={pics} onChange={setPics} folder="pooja-photos" max={9} />
      </div>
      <Field label={t("admin.adminNote")} hint={t("admin.adminNoteHint")}>
        <Textarea value={form.adminNote} onChange={(e) => setForm({ ...form, adminNote: e.target.value })} rows={3} />
      </Field>
      <Button
        size="sm"
        loading={pending}
        icon={<Save className="h-4 w-4" />}
        onClick={() =>
          start(async () => {
            const res = await updateBookingMediaAction(bookingId, { ...form, photos: pics });
            toast(res.ok ? t("common.saved") : tErr(t, res.error), res.ok ? "success" : "error");
            if (res.ok) router.refresh();
          })
        }
      >
        {t("common.save")}
      </Button>
    </div>
  );
}

/** Refund with a mandatory reason. */
export function RefundButton({ bookingId, amount }: { bookingId: string; amount: number }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();

  return (
    <>
      <Button size="sm" variant="outline" className="text-danger" icon={<IndianRupee className="h-4 w-4" />} onClick={() => setOpen(true)}>
        {t("admin.refund")}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t("admin.refundTitle")} side="center">
        <p className="mb-3 text-sm text-muted">{t("admin.refundDescription", { amount: formatINR(amount) })}</p>
        <Field label={t("admin.refundReason")} required>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        </Field>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" full onClick={() => setOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="danger"
            full
            loading={pending}
            disabled={reason.trim().length < 3}
            onClick={() =>
              start(async () => {
                const res = await refundBookingAction(bookingId, reason.trim());
                if (!res.ok) {
                  toast(tErr(t, res.error), "error");
                  return;
                }
                toast(t("admin.refundDone"), "success");
                setOpen(false);
                router.refresh();
              })
            }
          >
            {t("admin.confirmRefund")}
          </Button>
        </div>
      </Sheet>
    </>
  );
}

/** Records an offline payment for a PENDING_PAYMENT booking. */
export function MarkPaidButton({ bookingId }: { bookingId: string }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reference, setReference] = useState("");
  const [pending, start] = useTransition();

  return (
    <>
      <Button size="sm" variant="secondary" icon={<Check className="h-4 w-4" />} onClick={() => setOpen(true)}>
        {t("admin.markPaid")}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t("admin.markPaidTitle")} side="center">
        <p className="mb-3 text-sm text-muted">{t("admin.markPaidHint")}</p>
        <Field label={t("admin.paymentReference")}>
          <Input value={reference} onChange={(e) => setReference(e.target.value)} className="h-10" placeholder="UTR / receipt no." />
        </Field>
        <Button
          full
          className="mt-4"
          loading={pending}
          onClick={() =>
            start(async () => {
              const res = await markPaidManuallyAction(bookingId, reference || undefined);
              if (!res.ok) {
                toast(tErr(t, res.error), "error");
                return;
              }
              toast(t("admin.markPaidDone"), "success");
              setOpen(false);
              router.refresh();
            })
          }
        >
          {t("admin.markPaid")}
        </Button>
      </Sheet>
    </>
  );
}
