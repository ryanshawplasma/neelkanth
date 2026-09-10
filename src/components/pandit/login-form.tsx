"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, ShieldCheck } from "lucide-react";
import { requestOtpAction, verifyOtpAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

const RESEND_SECONDS = 30;

export function PanditLoginForm() {
  const t = useT();
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [target, setTarget] = useState("");
  const [devHint, setDevHint] = useState<string | undefined>();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  async function sendOtp(resend = false) {
    setError(null);
    if (!/^\d{10}$/.test(phone.trim())) return setError(t("common.invalidPhone"));
    setBusy(true);
    const res = await requestOtpAction(phone.trim());
    setBusy(false);
    if (!res.ok) return setError(t(`common.${res.error}`));
    setTarget(res.data?.target ?? phone);
    setDevHint(res.data?.devHint);
    setLeft(RESEND_SECONDS);
    if (!resend) {
      setStep("otp");
      setTimeout(() => boxes.current[0]?.focus(), 60);
    }
  }

  async function verify(code: string) {
    setError(null);
    setBusy(true);
    const res = await verifyOtpAction(phone.trim(), code, "pandit");
    if (!res.ok) {
      setBusy(false);
      setDigits(["", "", "", "", "", ""]);
      boxes.current[0]?.focus();
      return setError(t(`common.${res.error}`));
    }
    router.replace(res.data?.hasPanditProfile ? "/pandit/dashboard" : "/pandit/register");
    router.refresh();
  }

  function onDigit(i: number, raw: string) {
    const v = raw.replace(/\D/g, "");
    if (!v) {
      const next = [...digits];
      next[i] = "";
      return setDigits(next);
    }
    const next = [...digits];
    for (let k = 0; k < v.length && i + k < 6; k++) next[i + k] = v[k];
    setDigits(next);
    const filledTo = Math.min(i + v.length, 5);
    boxes.current[filledTo]?.focus();
    const code = next.join("");
    if (code.length === 6 && !next.includes("")) void verify(code);
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) boxes.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) boxes.current[i + 1]?.focus();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-6">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-maroon text-xl text-white shadow-sm">ॐ</span>
        <LanguageSwitch />
      </div>

      {step === "phone" ? (
        <div className="mt-8 animate-fade-up">
          <h1 className="font-[var(--font-display)] text-2xl font-bold leading-tight">{t("pandit.loginTitle")}</h1>
          <p className="mt-1.5 text-sm text-muted">{t("pandit.loginSubtitle")}</p>

          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void sendOtp();
            }}
          >
            <Field label={t("pandit.loginPhoneLabel")} hint={t("pandit.loginPhoneHint")} error={error} required>
              <div className="flex items-center gap-2">
                <span className="flex h-11 items-center rounded-xl border border-border bg-surface-2 px-3 text-sm font-medium text-muted">+91</span>
                <Input
                  autoFocus
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  error={!!error}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>
            </Field>
            <Button type="submit" full size="lg" loading={busy} icon={<Phone className="h-4 w-4" />}>
              {t("common.sendOtp")}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            {t("pandit.areYouDevotee")}{" "}
            <Link href="/" className="font-semibold text-primary hover:underline">
              {t("pandit.openDevoteeApp")}
            </Link>
          </p>
          <p className="mt-auto pt-8 text-center text-xs text-muted">{t("pandit.loginFooter")}</p>
        </div>
      ) : (
        <div className="mt-8 animate-fade-up">
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setError(null);
              setDigits(["", "", "", "", "", ""]);
            }}
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> {t("pandit.changeNumber")}
          </button>
          <h1 className="font-[var(--font-display)] text-2xl font-bold leading-tight">{t("pandit.otpTitle")}</h1>
          <p className="mt-1.5 text-sm text-muted">{t("pandit.otpSubtitle", { target: target || `+91${phone}` })}</p>

          <div className="mt-7 flex justify-between gap-2" dir="ltr">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  boxes.current[i] = el;
                }}
                value={d}
                onChange={(e) => onDigit(i, e.target.value)}
                onKeyDown={(e) => onKey(i, e)}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                aria-label={`OTP digit ${i + 1}`}
                className={cn(
                  "h-14 w-full min-w-0 rounded-xl border bg-surface text-center text-xl font-bold text-foreground",
                  "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25",
                  error ? "border-danger" : "border-border",
                )}
              />
            ))}
          </div>

          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          {devHint && (
            <p className="mt-3 rounded-xl bg-info-soft px-3 py-2 text-center text-xs font-semibold text-info">{t("pandit.devOtpHint", { code: devHint })}</p>
          )}

          <Button
            className="mt-6"
            full
            size="lg"
            loading={busy}
            icon={<ShieldCheck className="h-4 w-4" />}
            onClick={() => void verify(digits.join(""))}
            disabled={digits.join("").length !== 6}
          >
            {busy ? t("pandit.verifying") : t("common.verifyOtp")}
          </Button>

          <div className="mt-4 text-center text-sm">
            {left > 0 ? (
              <span className="text-muted">{t("pandit.resendIn", { n: left })}</span>
            ) : (
              <button type="button" onClick={() => void sendOtp(true)} className="font-semibold text-primary hover:underline">
                {t("common.resendOtp")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
