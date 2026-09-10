"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, FileText, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { formatINR } from "@/lib/utils";
import {
  approveKycAction,
  createPayoutAction,
  markPayoutPaidAction,
  rejectKycAction,
  reviewKycDocAction,
  setCommissionAction,
  setPanditServicePriceAction,
  togglePanditServiceAction,
} from "@/lib/admin/pandit-actions";
import { toggleBlockUserAction } from "@/lib/admin/user-actions";
import { tErr } from "./action-button";

function useRun() {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg?: string, after?: () => void) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) {
        toast(tErr(t, res.error), "error");
        return;
      }
      toast(okMsg ?? t("common.saved"), "success");
      after?.();
      router.refresh();
    });
  return { run, pending, t };
}

/** Per-document approve / reject with a note. */
export function KycDocActions({ docId, status }: { docId: string; status: string }) {
  const { run, pending, t } = useRun();
  const [note, setNote] = useState("");
  const [rejecting, setRejecting] = useState(false);

  return (
    <div className="mt-2 space-y-2">
      {rejecting && (
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("admin.rejectReasonPlaceholder")} className="h-9 text-sm" />
      )}
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant={status === "APPROVED" ? "secondary" : "outline"}
          icon={<Check className="h-3.5 w-3.5" />}
          loading={pending}
          onClick={() => run(() => reviewKycDocAction(docId, "APPROVED"), t("admin.docApproved"), () => setRejecting(false))}
        >
          {t("admin.approve")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-danger"
          icon={<X className="h-3.5 w-3.5" />}
          loading={pending}
          onClick={() => {
            if (!rejecting) {
              setRejecting(true);
              return;
            }
            run(() => reviewKycDocAction(docId, "REJECTED", note), t("admin.docRejected"), () => {
              setRejecting(false);
              setNote("");
            });
          }}
        >
          {t("admin.reject")}
        </Button>
      </div>
    </div>
  );
}

/** Overall KYC decision. Rejection requires a reason and notifies the pandit. */
export function KycDecision({ panditId, kycStatus }: { panditId: string; kycStatus: string }) {
  const { run, pending, t } = useRun();
  const [note, setNote] = useState("");
  const [open, setOpen] = useState<"approve" | "reject" | null>(null);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="primary" icon={<Check className="h-4 w-4" />} onClick={() => setOpen("approve")} disabled={kycStatus === "APPROVED"}>
          {t("admin.approveKyc")}
        </Button>
        <Button size="sm" variant="outline" className="text-danger" icon={<X className="h-4 w-4" />} onClick={() => setOpen("reject")}>
          {t("admin.rejectKyc")}
        </Button>
      </div>

      <Sheet open={open !== null} onClose={() => setOpen(null)} side="center" title={open === "reject" ? t("admin.rejectKyc") : t("admin.approveKyc")}>
        <p className="mb-3 text-sm text-muted">{open === "reject" ? t("admin.rejectKycHint") : t("admin.approveKycHint")}</p>
        <Field label={open === "reject" ? t("admin.rejectReason") : t("admin.reviewNote")} required={open === "reject"}>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
        </Field>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" full onClick={() => setOpen(null)}>
            {t("common.cancel")}
          </Button>
          <Button
            full
            variant={open === "reject" ? "danger" : "primary"}
            loading={pending}
            disabled={open === "reject" && note.trim().length < 5}
            onClick={() =>
              open === "reject"
                ? run(() => rejectKycAction(panditId, note.trim()), t("admin.kycRejected"), () => setOpen(null))
                : run(() => approveKycAction(panditId, note.trim() || undefined), t("admin.kycApproved"), () => setOpen(null))
            }
          >
            {t("common.confirm")}
          </Button>
        </div>
      </Sheet>
    </>
  );
}

export function CommissionField({ panditId, value }: { panditId: string; value: number }) {
  const { run, pending, t } = useRun();
  const [pct, setPct] = useState(value);
  return (
    <div className="flex items-end gap-2">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">{t("admin.commissionPct")}</span>
        <Input type="number" min={0} max={60} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="h-9 w-24 text-sm" />
      </label>
      <Button size="sm" variant="outline" loading={pending} disabled={pct === value} onClick={() => run(() => setCommissionAction(panditId, pct))}>
        {t("common.save")}
      </Button>
    </div>
  );
}

export type ServiceRow = { id: string; name: string; basePrice: number; offered: boolean; active: boolean; price: number | null };

/** Toggle which services this pandit offers and override the price. */
export function PanditServicesEditor({ panditId, rows }: { panditId: string; rows: ServiceRow[] }) {
  const { run, pending, t } = useRun();
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(rows.map((r) => [r.id, r.price === null ? "" : String(r.price)])),
  );
  const [filter, setFilter] = useState("");
  const visible = rows.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t("admin.filterServices")} className="mb-2 h-9 text-sm" />
      <ul className="max-h-96 space-y-1 overflow-y-auto pr-1">
        {visible.map((r) => (
          <li key={r.id} className="flex items-center gap-2 rounded-xl border border-border px-2.5 py-1.5">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={r.offered && r.active}
              disabled={pending}
              onChange={(e) => run(() => togglePanditServiceAction(panditId, r.id, e.target.checked), t("common.saved"))}
              aria-label={r.name}
            />
            <span className="min-w-0 flex-1 truncate text-sm">{r.name}</span>
            <span className="shrink-0 text-xs text-muted">{formatINR(r.basePrice)}</span>
            {r.offered && (
              <>
                <Input
                  className="h-8 w-24 text-sm"
                  type="number"
                  min={0}
                  placeholder={t("admin.override")}
                  value={prices[r.id] ?? ""}
                  onChange={(e) => setPrices({ ...prices, [r.id]: e.target.value })}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  loading={pending}
                  onClick={() => run(() => setPanditServicePriceAction(panditId, r.id, prices[r.id] === "" ? null : Number(prices[r.id])))}
                >
                  <Save className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </li>
        ))}
        {!visible.length && <li className="py-6 text-center text-sm text-muted">{t("common.noResults")}</li>}
      </ul>
    </div>
  );
}

/** Create a payout and mark existing ones as paid. */
export function PayoutPanel({ panditId, balance }: { panditId: string; balance: number }) {
  const { run, pending, t } = useRun();
  const [form, setForm] = useState({ amount: Math.max(0, balance), reference: "", note: "", status: "PENDING" as "PENDING" | "PAID" });

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-4">
        <Field label={t("admin.payoutAmount")}>
          <Input type="number" min={1} className="h-9 text-sm" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
        </Field>
        <Field label={t("admin.payoutReference")}>
          <Input className="h-9 text-sm" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="UTR" />
        </Field>
        <Field label={t("admin.note")}>
          <Input className="h-9 text-sm" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </Field>
        <Field label={t("common.status")}>
          <Select className="h-9 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "PENDING" | "PAID" })}>
            <option value="PENDING">{t("admin.payoutPending")}</option>
            <option value="PAID">{t("admin.payoutPaid")}</option>
          </Select>
        </Field>
      </div>
      <Button
        size="sm"
        icon={<Plus className="h-4 w-4" />}
        loading={pending}
        disabled={form.amount < 1}
        onClick={() => run(() => createPayoutAction(panditId, form), t("admin.payoutCreated"))}
      >
        {t("admin.createPayout")}
      </Button>
    </div>
  );
}

export function MarkPayoutPaidButton({ payoutId }: { payoutId: string }) {
  const { run, pending, t } = useRun();
  const [reference, setReference] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" loading={pending} onClick={() => setOpen(true)}>
        {t("admin.markPayoutPaid")}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} side="center" title={t("admin.markPayoutPaid")}>
        <Field label={t("admin.payoutReference")}>
          <Input value={reference} onChange={(e) => setReference(e.target.value)} className="h-10" placeholder="UTR" />
        </Field>
        <Button full className="mt-4" loading={pending} onClick={() => run(() => markPayoutPaidAction(payoutId, reference || undefined), t("admin.payoutPaidDone"), () => setOpen(false))}>
          {t("common.confirm")}
        </Button>
      </Sheet>
    </>
  );
}

/** Block / unblock the underlying user account. */
export function BlockUserButton({ userId, blocked }: { userId: string; blocked: boolean }) {
  const { run, pending, t } = useRun();
  return (
    <Button
      size="sm"
      variant={blocked ? "outline" : "outline"}
      className={blocked ? "" : "text-danger"}
      icon={<Ban className="h-4 w-4" />}
      loading={pending}
      onClick={() => run(() => toggleBlockUserAction(userId, !blocked), blocked ? t("admin.userUnblocked") : t("admin.userBlocked"))}
    >
      {blocked ? t("admin.unblockUser") : t("admin.blockUser")}
    </Button>
  );
}

/** Document preview tile: image thumbnail or a PDF link. */
export function DocPreview({ url, label }: { url: string; label: string }) {
  const isPdf = /\.pdf($|\?)/i.test(url);
  if (isPdf) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="flex h-28 items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 text-sm text-primary hover:bg-primary-soft">
        <FileText className="h-5 w-5" />
        PDF
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block h-28 overflow-hidden rounded-xl border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={label} className="h-full w-full object-cover transition-transform hover:scale-105" />
    </a>
  );
}

export function DocStatusBadge({ status, label }: { status: string; label: string }) {
  return <Badge tone={status === "APPROVED" ? "success" : status === "REJECTED" ? "danger" : "warning"}>{label}</Badge>;
}
