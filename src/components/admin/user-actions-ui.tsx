"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Sheet, ConfirmDialog } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { sendUserNotificationAction, setUserLocaleAction, setUserRoleAction } from "@/lib/admin/user-actions";
import { adminOpenSupportThreadAction } from "@/lib/support-actions";
import { HREF_PRESETS } from "@/lib/admin/util";
import { tErr } from "./action-button";

/** Open (creating if needed) the support conversation with this devotee. */
export function MessageUserButton({ userId }: { userId: string }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      loading={pending}
      icon={<MessageCircle className="h-4 w-4" />}
      onClick={() =>
        start(async () => {
          const res = await adminOpenSupportThreadAction(userId);
          if (res.ok && res.data) router.push(`/admin/support/${res.data.threadId}`);
          else toast(tErr(t, res.ok ? "" : res.error), "error");
        })
      }
    >
      {t("admin.supportMessageUser")}
    </Button>
  );
}

/** Change the user's preferred app language. */
export function LocaleSelect({ userId, value }: { userId: string; value: string }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  return (
    <Select
      className="h-9 w-32 text-sm"
      value={value}
      disabled={pending}
      aria-label={t("common.language")}
      onChange={(e) =>
        start(async () => {
          const res = await setUserLocaleAction(userId, e.target.value);
          toast(res.ok ? t("common.saved") : tErr(t, res.error), res.ok ? "success" : "error");
          if (res.ok) router.refresh();
        })
      }
    >
      <option value="en">{t("common.english")}</option>
      <option value="hi">{t("common.hindi")}</option>
    </Select>
  );
}

/** Promote to ADMIN behind a confirm dialog. */
export function MakeAdminButton({ userId, role }: { userId: string; role: string }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  if (role === "ADMIN") return null;
  return (
    <>
      <Button size="sm" variant="outline" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => setOpen(true)}>
        {t("admin.makeAdmin")}
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("admin.makeAdmin")}
        description={t("admin.makeAdminWarning")}
        confirmLabel={t("common.confirm")}
        cancelLabel={t("common.cancel")}
        danger
        loading={pending}
        onConfirm={() =>
          start(async () => {
            const res = await setUserRoleAction(userId, "ADMIN");
            if (!res.ok) {
              toast(tErr(t, res.error), "error");
              return;
            }
            toast(t("admin.roleUpdated"), "success");
            setOpen(false);
            router.refresh();
          })
        }
      />
    </>
  );
}

/** Bilingual one-off notification to this user. */
export function SendNotificationButton({ userId }: { userId: string }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ titleEn: "", titleHi: "", bodyEn: "", bodyHi: "", href: "" });

  return (
    <>
      <Button size="sm" variant="secondary" icon={<Send className="h-4 w-4" />} onClick={() => setOpen(true)}>
        {t("admin.sendNotification")}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} side="center" title={t("admin.sendNotification")} className="sm:max-w-xl">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`${t("admin.notifTitle")} (EN)`} required>
              <Input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="h-10" />
            </Field>
            <Field label={`${t("admin.notifTitle")} (हिं)`} required>
              <Input value={form.titleHi} onChange={(e) => setForm({ ...form, titleHi: e.target.value })} className="h-10 font-[var(--font-devanagari)]" lang="hi" />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`${t("admin.notifBody")} (EN)`}>
              <Textarea value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} rows={3} />
            </Field>
            <Field label={`${t("admin.notifBody")} (हिं)`}>
              <Textarea value={form.bodyHi} onChange={(e) => setForm({ ...form, bodyHi: e.target.value })} rows={3} className="font-[var(--font-devanagari)]" lang="hi" />
            </Field>
          </div>
          <Field label={t("admin.notifLink")}>
            <div className="flex gap-2">
              <Select className="h-10 w-40 text-sm" value="" onChange={(e) => setForm({ ...form, href: e.target.value })} aria-label={t("admin.notifLink")}>
                <option value="">{t("admin.choosePreset")}</option>
                {HREF_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label.en}
                  </option>
                ))}
              </Select>
              <Input value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} className="h-10" placeholder="/poojas" />
            </div>
          </Field>
        </div>
        <Button
          full
          className="mt-4"
          loading={pending}
          disabled={!form.titleEn || !form.titleHi}
          onClick={() =>
            start(async () => {
              const res = await sendUserNotificationAction(userId, form);
              if (!res.ok) {
                toast(tErr(t, res.error), "error");
                return;
              }
              toast(t("admin.notificationSent"), "success");
              setOpen(false);
              setForm({ titleEn: "", titleHi: "", bodyEn: "", bodyHi: "", href: "" });
              router.refresh();
            })
          }
        >
          {t("admin.send")}
        </Button>
      </Sheet>
    </>
  );
}
