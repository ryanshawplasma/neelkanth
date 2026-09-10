"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/input";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { createPanditProfileAction } from "@/lib/pandit/profile-actions";
import { cn } from "@/lib/utils";
import {
  FieldsAbout,
  FieldsArea,
  FieldsBackground,
  FieldsBasics,
  FieldsExpertise,
  emptyProfileForm,
  toProfileInput,
  type ProfileForm,
  type TempleOption,
} from "./profile-fields";

const STEP_KEYS = ["stepBasics", "stepExpertise", "stepBackground", "stepArea", "stepAbout"] as const;

export function PanditRegisterForm({ temples, defaultName }: { temples: TempleOption[]; defaultName?: string | null }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileForm>(() => ({ ...emptyProfileForm(), displayName: defaultName ?? "" }));
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (p: Partial<ProfileForm>) => setForm((f) => ({ ...f, ...p }));

  function localCheck(): string | null {
    if (step === 0 && form.displayName.trim().length < 3) return "pandit.errNameShort";
    if (step === 1 && form.specialities.length < 1) return "pandit.errSpeciality";
    if (step === 2 && form.languages.length < 1) return "pandit.errLanguage";
    if (step === 3) {
      if (!form.city?.trim()) return "pandit.errCity";
      if (!form.state?.trim()) return "pandit.errState";
      if (!form.servesOnline && !form.servesAtHome && !form.servesAtTemple) return "pandit.errServiceMode";
      if (form.servesAtTemple && !form.templeId) return "pandit.errTemple";
    }
    return null;
  }

  function next() {
    const err = localCheck();
    if (err) return setError(t(err));
    setError(null);
    setStep((s) => Math.min(STEP_KEYS.length - 1, s + 1));
  }

  async function submit() {
    if (!agree) return setError(t("pandit.errTerms"));
    setError(null);
    setBusy(true);
    const res = await createPanditProfileAction(toProfileInput(form));
    setBusy(false);
    if (!res.ok) return setError(t(res.error));
    toast(t("pandit.registerWelcome", { name: form.displayName.split(" ").slice(-1)[0] || form.displayName }));
    router.replace("/pandit/kyc");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-maroon text-lg text-white shadow-sm">ॐ</span>
        <LanguageSwitch />
      </div>

      <h1 className="mt-5 font-[var(--font-display)] text-2xl font-bold leading-tight">{t("pandit.registerTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("pandit.registerSubtitle")}</p>

      <div className="mt-5 flex items-center gap-1.5" aria-hidden>
        {STEP_KEYS.map((k, i) => (
          <span key={k} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-border")} />
        ))}
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted">
        {t("common.stepOf", { a: step + 1, b: STEP_KEYS.length })} · {t(`pandit.${STEP_KEYS[step]}`)}
      </p>

      <div className="mt-5 rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow)] sm:p-5">
        {step === 0 && <FieldsBasics form={form} set={set} />}
        {step === 1 && <FieldsExpertise form={form} set={set} />}
        {step === 2 && <FieldsBackground form={form} set={set} />}
        {step === 3 && <FieldsArea form={form} set={set} temples={temples} />}
        {step === 4 && (
          <FieldsAbout form={form} set={set}>
            <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} label={t("pandit.agreeTerms")} />
          </FieldsAbout>
        )}
      </div>

      {error && <p className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="mt-5 flex gap-2">
        {step > 0 && (
          <Button variant="outline" size="lg" onClick={() => setStep((s) => s - 1)} icon={<ArrowLeft className="h-4 w-4" />}>
            {t("common.back")}
          </Button>
        )}
        {step < STEP_KEYS.length - 1 ? (
          <Button className="flex-1" size="lg" onClick={next} icon={<ArrowRight className="h-4 w-4" />}>
            {t("common.next")}
          </Button>
        ) : (
          <Button className="flex-1" size="lg" loading={busy} onClick={() => void submit()} icon={<Check className="h-4 w-4" />}>
            {t("pandit.createProfile")}
          </Button>
        )}
      </div>
    </div>
  );
}
