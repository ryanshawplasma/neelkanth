"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useT, useLocale } from "@/i18n/client";
import { CONSULT_MODES, CONSULT_STATUS_LABELS, optionsFrom, toLocalInput } from "@/lib/admin/util";
import { updateConsultationAction } from "@/lib/admin/consult-actions";
import { cn } from "@/lib/utils";
import { PHONE_SHEET, tErr } from "./action-button";

export type ConsultDraft = {
  id: string;
  panditId: string;
  mode: string;
  scheduledAt: string;
  meetingLink: string;
  answer: string;
  status: string;
};

/** Assign a jyotishi, schedule and answer one consultation. */
export function ConsultationEditor({ consult, jyotishis }: { consult: ConsultDraft; jyotishis: { id: string; displayName: string; city: string | null }[] }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState<ConsultDraft>({ ...consult, scheduledAt: toLocalInput(consult.scheduledAt || null) });

  return (
    <>
      {/* Icon-only on phones so the row keeps the topic and status in view. */}
      <Button
        size="sm"
        variant="outline"
        className="max-sm:w-9 max-sm:px-0"
        icon={<Pencil className="h-3.5 w-3.5" />}
        onClick={() => setOpen(true)}
        aria-label={t("admin.manage")}
      >
        <span className="max-sm:sr-only">{t("admin.manage")}</span>
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t("admin.manageConsultation")} className={cn(PHONE_SHEET, "sm:max-w-xl")}>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("admin.assignJyotishi")}>
              <Select value={form.panditId} onChange={(e) => setForm({ ...form, panditId: e.target.value })}>
                <option value="">{t("admin.none")}</option>
                {jyotishis.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.displayName}
                    {j.city ? ` · ${j.city}` : ""}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("admin.mode")}>
              <Select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                {optionsFrom(CONSULT_MODES, locale).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("admin.scheduleAt")}>
              <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            </Field>
            <Field label={t("admin.meetingLink")}>
              <Input value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://meet…" />
            </Field>
          </div>
          <Field label={t("admin.answer")} hint={t("admin.answerHint")}>
            <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={6} />
          </Field>
          <Field label={t("common.status")}>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {optionsFrom(CONSULT_STATUS_LABELS, locale).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            full
            loading={pending}
            onClick={() =>
              start(async () => {
                const res = await updateConsultationAction(consult.id, {
                  panditId: form.panditId || null,
                  mode: form.mode as "chat" | "call" | "video",
                  scheduledAt: form.scheduledAt,
                  meetingLink: form.meetingLink,
                  answer: form.answer,
                  status: form.status as "REQUESTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED",
                });
                if (!res.ok) {
                  toast(tErr(t, res.error), "error");
                  return;
                }
                toast(t("common.saved"), "success");
                setOpen(false);
                router.refresh();
              })
            }
          >
            {t("common.save")}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
