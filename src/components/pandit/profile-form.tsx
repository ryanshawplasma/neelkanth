"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, LogOut, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { logoutAction } from "@/lib/auth-actions";
import { setAcceptingBookingsAction, updatePanditProfileAction } from "@/lib/pandit/profile-actions";
import { FieldsAbout, FieldsArea, FieldsBackground, FieldsBasics, FieldsExpertise, toProfileInput, type ProfileForm, type TempleOption } from "./profile-fields";
import { Panel } from "./common";

export function PanditProfileForm({
  initial,
  temples,
  panditId,
  isActive,
}: {
  initial: ProfileForm;
  temples: TempleOption[];
  panditId: string;
  isActive: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<ProfileForm>(initial);
  const [active, setActive] = useState(isActive);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const [, start] = useTransition();

  const set = (p: Partial<ProfileForm>) => setForm((f) => ({ ...f, ...p }));

  async function save() {
    setError(null);
    setBusy(true);
    const res = await updatePanditProfileAction(toProfileInput(form));
    setBusy(false);
    if (!res.ok) return setError(t(res.error));
    toast(t("pandit.profileSaved"));
    router.refresh();
  }

  function toggleActive(v: boolean) {
    setActive(v);
    start(async () => {
      const res = await setAcceptingBookingsAction(v);
      if (!res.ok) setActive(!v);
      else toast(t("common.saved"));
    });
  }

  return (
    <div className="space-y-4 px-4 pb-8">
      <Panel>
        <Toggle checked={active} onChange={toggleActive} label={<span className="font-semibold">{t("pandit.acceptingBookings")}</span>} />
        <p className="mt-1.5 text-xs text-muted">{t("pandit.acceptingHint")}</p>
      </Panel>

      {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      <Panel title={t("pandit.stepBasics")}>
        <FieldsBasics form={form} set={set} />
      </Panel>
      <Panel title={t("pandit.stepExpertise")}>
        <FieldsExpertise form={form} set={set} />
      </Panel>
      <Panel title={t("pandit.stepBackground")}>
        <FieldsBackground form={form} set={set} />
      </Panel>
      <Panel title={t("pandit.stepArea")}>
        <FieldsArea form={form} set={set} temples={temples} />
      </Panel>
      <Panel title={t("pandit.stepAbout")}>
        <FieldsAbout form={form} set={set} />
      </Panel>

      <Button full size="lg" icon={<Save className="h-4 w-4" />} loading={busy} onClick={() => void save()}>
        {t("pandit.saveProfile")}
      </Button>

      <Panel title={t("pandit.accountSection")}>
        <Link href={`/pandits/${panditId}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <ExternalLink className="h-4 w-4" /> {t("pandit.publicProfile")}
        </Link>
        <div className="mt-4">
          <Button variant="outline" className="text-danger" icon={<LogOut className="h-4 w-4" />} onClick={() => setConfirmOut(true)}>
            {t("common.logout")}
          </Button>
        </div>
      </Panel>

      <ConfirmDialog
        open={confirmOut}
        onClose={() => setConfirmOut(false)}
        onConfirm={() => void logoutAction("/pandit/login")}
        title={t("pandit.logoutConfirm")}
        confirmLabel={t("common.logout")}
        cancelLabel={t("common.cancel")}
        danger
      />
    </div>
  );
}
