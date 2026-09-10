"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Info, Landmark, Send, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/ui/toast";
import { useLocale, useT } from "@/i18n/client";
import { KYC_DOC_TYPES, KYC_STATUSES, pickBi } from "@/lib/constants";
import { cn, formatDate, maskDoc } from "@/lib/utils";
import { DOC_NUMBER_TYPES } from "@/lib/pandit/shared";
import { removeKycDocAction, saveBankDetailsAction, saveKycDocAction, saveKycProgressAction, submitKycAction } from "@/lib/pandit/kyc-actions";
import { DocStatusBadge, Panel } from "./common";

export type KycDoc = { id: string; type: string; fileUrl: string; docNumber: string | null; status: string; note: string | null };

export type KycProps = {
  kycStatus: string;
  kycReviewNote: string | null;
  kycSubmittedAt: string | null;
  verified: boolean;
  bank: { bankAccountName: string | null; bankAccountNo: string | null; bankIfsc: string | null; upiId: string | null };
  documents: KycDoc[];
};

const TONE_CLASS: Record<string, string> = {
  muted: "border-border bg-surface-2",
  warning: "border-warning/30 bg-warning-soft",
  info: "border-info/30 bg-info-soft",
  success: "border-success/30 bg-success-soft",
  danger: "border-danger/30 bg-danger-soft",
};

export function KycClient(props: KycProps) {
  const t = useT();
  const locale = useLocale();
  const { toast } = useToast();
  const [docs, setDocs] = useState<Record<string, { fileUrl: string | null; docNumber: string; saved: boolean }>>(() => {
    const out: Record<string, { fileUrl: string | null; docNumber: string; saved: boolean }> = {};
    for (const d of KYC_DOC_TYPES) {
      const row = props.documents.find((x) => x.type === d.value);
      out[d.value] = { fileUrl: row?.fileUrl ?? null, docNumber: "", saved: !!row?.fileUrl };
    }
    return out;
  });
  const [bank, setBank] = useState({
    bankAccountName: props.bank.bankAccountName ?? "",
    bankAccountNo: props.bank.bankAccountNo ?? "",
    bankIfsc: props.bank.bankIfsc ?? "",
    upiId: props.bank.upiId ?? "",
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusEntry = KYC_STATUSES.find((s) => s.value === props.kycStatus);
  const locked = props.kycStatus === "APPROVED" || props.kycStatus === "SUBMITTED";

  const bodyKey =
    props.kycStatus === "APPROVED"
      ? "kycApprovedBody"
      : props.kycStatus === "SUBMITTED"
        ? "kycSubmittedBody"
        : props.kycStatus === "REJECTED"
          ? "kycRejectedBody"
          : props.kycStatus === "IN_PROGRESS"
            ? "kycInProgressBody"
            : "kycNotStartedBody";

  const canEditDoc = (type: string) => {
    if (locked) return false;
    const row = props.documents.find((d) => d.type === type);
    if (props.kycStatus === "REJECTED" && row?.status === "APPROVED") return false;
    return true;
  };

  const readyToSubmit = useMemo(
    () =>
      KYC_DOC_TYPES.filter((d) => d.required).every((d) => {
        const row = props.documents.find((x) => x.type === d.value);
        if (!row?.fileUrl) return false;
        if (DOC_NUMBER_TYPES[d.value] && !row.docNumber) return false;
        return true;
      }),
    [props.documents],
  );

  async function saveDoc(type: string) {
    const state = docs[type];
    setError(null);
    if (!state?.fileUrl) return setError(t("pandit.errDocFile"));
    setBusy(type);
    const res = await saveKycDocAction({ type, fileUrl: state.fileUrl, docNumber: state.docNumber || undefined });
    setBusy(null);
    if (!res.ok) return setError(t(res.error));
    setDocs((d) => ({ ...d, [type]: { ...d[type], saved: true, docNumber: "" } }));
    toast(t("common.saved"));
  }

  async function removeDoc(type: string) {
    setBusy(type);
    const res = await removeKycDocAction(type);
    setBusy(null);
    if (!res.ok) return setError(t(res.error));
    setDocs((d) => ({ ...d, [type]: { fileUrl: null, docNumber: "", saved: false } }));
  }

  async function saveBank() {
    setError(null);
    setBusy("bank");
    const res = await saveBankDetailsAction(bank);
    setBusy(null);
    if (!res.ok) return setError(t(res.error));
    toast(t("common.saved"));
  }

  async function saveProgress() {
    setBusy("progress");
    await saveKycProgressAction();
    setBusy(null);
    toast(t("common.saved"));
  }

  async function submit() {
    setError(null);
    setBusy("submit");
    const res = await submitKycAction();
    setBusy(null);
    if (!res.ok) return setError(t(res.error));
    toast(t("pandit.kycSubmittedToast"));
  }

  return (
    <div className="space-y-4 px-4 pb-8">
      <div className={cn("rounded-2xl border p-4", TONE_CLASS[statusEntry?.tone ?? "muted"])}>
        <div className="flex items-center gap-2">
          {props.kycStatus === "APPROVED" ? <BadgeCheck className="h-5 w-5 text-success" /> : <ShieldAlert className="h-5 w-5 text-muted" />}
          <p className="text-sm font-semibold">
            {t("pandit.kycStatusLabel")}: {statusEntry ? pickBi(statusEntry.label, locale) : props.kycStatus}
          </p>
        </div>
        <p className="mt-1.5 text-sm text-muted">
          {t(`pandit.${bodyKey}`, { date: props.kycSubmittedAt ? formatDate(new Date(props.kycSubmittedAt), locale) : "" })}
        </p>
        {props.kycStatus === "REJECTED" && props.kycReviewNote && (
          <p className="mt-2 rounded-xl bg-surface px-3 py-2 text-sm">
            <span className="font-semibold">{t("pandit.kycReviewNote")}: </span>
            {props.kycReviewNote}
          </p>
        )}
      </div>

      {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      <Panel title={t("pandit.kycDocuments")} subtitle={t("pandit.kycDocsHint")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {KYC_DOC_TYPES.map((d) => {
            const row = props.documents.find((x) => x.type === d.value);
            const state = docs[d.value];
            const editable = canEditDoc(d.value);
            const kind = DOC_NUMBER_TYPES[d.value];
            return (
              <div key={d.value} className="rounded-2xl border border-border bg-surface-2/50 p-3">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold">{pickBi(d.label, locale)}</p>
                  {d.required ? (
                    <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-danger">{t("pandit.docRequired")}</span>
                  ) : (
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">{t("pandit.docOptional")}</span>
                  )}
                  {row && <DocStatusBadge status={row.status} />}
                </div>

                <ImageUpload
                  value={state?.fileUrl ?? null}
                  onChange={(url) => editable && setDocs((s) => ({ ...s, [d.value]: { ...s[d.value], fileUrl: url, saved: false } }))}
                  folder="kyc"
                  accept="image/*,application/pdf"
                  aspect="aspect-[16/10]"
                  label={t("common.upload")}
                  className={cn(!editable && "pointer-events-none opacity-70")}
                />

                {kind && (
                  <Field
                    className="mt-2"
                    label={kind === "aadhaar" ? t("pandit.aadhaarNumber") : t("pandit.panNumber")}
                    hint={row?.docNumber ? t("pandit.docNumberStored", { masked: row.docNumber }) : undefined}
                    required
                  >
                    <Input
                      value={state?.docNumber ?? ""}
                      disabled={!editable}
                      placeholder={kind === "aadhaar" ? t("pandit.aadhaarPlaceholder") : t("pandit.panPlaceholder")}
                      inputMode={kind === "aadhaar" ? "numeric" : "text"}
                      maxLength={kind === "aadhaar" ? 12 : 10}
                      onChange={(e) =>
                        setDocs((s) => ({
                          ...s,
                          [d.value]: { ...s[d.value], docNumber: kind === "aadhaar" ? e.target.value.replace(/\D/g, "") : e.target.value.toUpperCase() },
                        }))
                      }
                    />
                  </Field>
                )}
                {kind && state?.docNumber && state.docNumber.length > 4 && (
                  <p className="mt-1 text-[11px] text-muted">{t("pandit.docNumberStored", { masked: maskDoc(state.docNumber) })}</p>
                )}

                {row?.note && <p className="mt-2 rounded-lg bg-danger-soft px-2.5 py-1.5 text-xs text-danger">{row.note}</p>}

                {editable && (
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={() => void saveDoc(d.value)} loading={busy === d.value} disabled={!state?.fileUrl}>
                      {t("pandit.saveDoc")}
                    </Button>
                    {row && (
                      <Button size="sm" variant="ghost" onClick={() => void removeDoc(d.value)}>
                        {t("common.remove")}
                      </Button>
                    )}
                  </div>
                )}
                {!editable && props.kycStatus === "REJECTED" && <p className="mt-2 text-xs text-muted">{t("pandit.reuploadOnly")}</p>}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title={t("pandit.bankTitle")} subtitle={t("pandit.bankSubtitle")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("pandit.bankAccountName")}>
            <Input value={bank.bankAccountName} onChange={(e) => setBank((b) => ({ ...b, bankAccountName: e.target.value }))} />
          </Field>
          <Field label={t("pandit.bankAccountNo")} hint={props.bank.bankAccountNo ? maskDoc(props.bank.bankAccountNo) : undefined}>
            <Input
              value={bank.bankAccountNo}
              inputMode="numeric"
              onChange={(e) => setBank((b) => ({ ...b, bankAccountNo: e.target.value.replace(/\D/g, "").slice(0, 18) }))}
            />
          </Field>
          <Field label={t("pandit.bankIfsc")}>
            <Input value={bank.bankIfsc} maxLength={11} onChange={(e) => setBank((b) => ({ ...b, bankIfsc: e.target.value.toUpperCase() }))} placeholder="SBIN0001234" />
          </Field>
          <Field label={t("pandit.upiId")}>
            <Input value={bank.upiId} onChange={(e) => setBank((b) => ({ ...b, upiId: e.target.value }))} placeholder={t("pandit.upiPlaceholder")} />
          </Field>
        </div>
        <Button className="mt-3" size="sm" variant="outline" icon={<Landmark className="h-4 w-4" />} loading={busy === "bank"} onClick={() => void saveBank()}>
          {t("pandit.saveBank")}
        </Button>
      </Panel>

      {!locked && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-4">
          <Button variant="outline" loading={busy === "progress"} onClick={() => void saveProgress()}>
            {t("pandit.saveProgress")}
          </Button>
          <Button icon={<Send className="h-4 w-4" />} disabled={!readyToSubmit} loading={busy === "submit"} onClick={() => void submit()}>
            {t("pandit.submitKyc")}
          </Button>
          {!readyToSubmit && (
            <p className="inline-flex items-center gap-1 text-xs text-muted">
              <Info className="h-3.5 w-3.5" /> {t("pandit.submitKycHint")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
