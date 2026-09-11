"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronLeft } from "lucide-react";
import { useT } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { requestOtpAction, verifyOtpAction } from "@/lib/auth-actions";

export function LoginForm({ next }: { next: string }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [devHint, setDevHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  const authError = (code: string) =>
    t(["invalidPhone", "invalidOtp", "otpExpired", "smsFailed", "blocked"].includes(code) ? `common.${code}` : "common.somethingWrong");

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  function sendOtp() {
    setError(null);
    start(async () => {
      const res = await requestOtpAction(phone);
      if (!res.ok) return setError(authError(res.error));
      setDevHint(res.data?.devHint ?? null);
      setStage("otp");
      setSeconds(30);
      setTimeout(() => boxes.current[0]?.focus(), 60);
    });
  }

  function verify(fullCode?: string) {
    const value = fullCode ?? code.join("");
    if (value.length !== 6) return;
    setError(null);
    start(async () => {
      const res = await verifyOtpAction(phone, value, "user");
      if (!res.ok) {
        setError(authError(res.error));
        setCode(Array(6).fill(""));
        boxes.current[0]?.focus();
        return;
      }
      toast(`${t("app.welcome")} 🙏`);
      router.replace(res.data!.onboarded ? next : `/onboarding?next=${encodeURIComponent(next)}`);
      router.refresh();
    });
  }

  function setDigit(i: number, v: string) {
    const digits = v.replace(/\D/g, "");
    if (!digits) {
      const nextCode = [...code];
      nextCode[i] = "";
      setCode(nextCode);
      return;
    }
    const nextCode = [...code];
    for (let k = 0; k < digits.length && i + k < 6; k++) nextCode[i + k] = digits[k];
    setCode(nextCode);
    const target = Math.min(5, i + digits.length);
    boxes.current[target]?.focus();
    if (nextCode.every((d) => d)) verify(nextCode.join(""));
  }

  return (
    <div className="flex min-h-dvh flex-col bg-devotional px-5 pb-10">
      <div className="flex items-center py-4">
        {stage === "otp" ? (
          <button onClick={() => setStage("phone")} aria-label={t("common.back")} className="-ml-2 rounded-full p-2">
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link href="/" aria-label={t("common.back")} className="-ml-2 rounded-full p-2">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}
        <span className="ml-auto">
          <LanguageSwitch />
        </span>
      </div>

      <div className="mt-6 flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl gradient-kesari text-3xl text-white shadow-lg">ॐ</span>
        <h1 className="mt-4 text-[24px] font-bold leading-tight tracking-tight">{t("common.appName")}</h1>
        <p className="mt-1 text-[13px] text-muted">{t("common.tagline")}</p>
      </div>

      <div className="mt-8">
        {stage === "phone" ? (
          <>
            <h2 className="text-[18px] font-bold">{t("app.loginTitle")}</h2>
            <p className="mt-1 text-[13px] text-muted">{t("app.loginSubtitle")}</p>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5">
              <span className="text-[15px] font-semibold text-muted">{t("app.phonePrefix")}</span>
              <span className="h-6 w-px bg-border" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="98765 43210"
                aria-label={t("common.phone")}
                className="h-12 min-w-0 flex-1 bg-transparent text-[16px] tracking-wide outline-none placeholder:text-muted/60"
                onKeyDown={(e) => e.key === "Enter" && phone.length === 10 && sendOtp()}
              />
            </div>
            {error && <p className="mt-2 text-[12.5px] text-danger">{error}</p>}
            <Button full size="lg" className="mt-4" loading={pending} disabled={phone.length !== 10} onClick={sendOtp}>
              {t("common.sendOtp")}
            </Button>
            <p className="mt-4 text-center text-[11.5px] leading-snug text-muted">{t("app.agreeTerms")}</p>
          </>
        ) : (
          <>
            <h2 className="text-[18px] font-bold">{t("app.otpTitle")}</h2>
            <p className="mt-1 text-[13px] text-muted">{t("app.otpSubtitle", { phone: `+91 ${phone}` })}</p>

            <div className="mt-5 flex justify-between gap-2">
              {code.map((d, i) => (
                <Input
                  key={i}
                  ref={(el: HTMLInputElement | null) => {
                    boxes.current[i] = el;
                  }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !code[i] && i > 0) boxes.current[i - 1]?.focus();
                  }}
                  inputMode="numeric"
                  maxLength={6}
                  aria-label={`${t("common.otp")} ${i + 1}`}
                  className={cn("h-13 w-full px-0 text-center text-[20px] font-bold", d && "border-primary")}
                />
              ))}
            </div>
            {error && <p className="mt-2 text-[12.5px] text-danger">{error}</p>}

            <Button full size="lg" className="mt-4" loading={pending} disabled={code.some((d) => !d)} onClick={() => verify()}>
              {t("common.verifyOtp")}
            </Button>

            <div className="mt-3 flex items-center justify-between text-[12.5px]">
              <button onClick={() => setStage("phone")} className="font-semibold text-primary">
                {t("app.changeNumber")}
              </button>
              {seconds > 0 ? (
                <span className="text-muted">{t("app.resendIn", { n: seconds })}</span>
              ) : (
                <button onClick={sendOtp} className="font-semibold text-primary">
                  {t("common.resendOtp")}
                </button>
              )}
            </div>

            {devHint && (
              <p className="mt-5 rounded-xl border border-dashed border-warning/50 bg-warning-soft px-3 py-2 text-center text-[12px] font-semibold text-warning">
                {t("app.devOtpHint", { code: devHint })}
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-auto pt-8 text-center">
        <Link href="/pandit/login" className="text-[12.5px] font-semibold text-muted">
          {t("common.forPandits")} · {t("common.panditPortal")}
        </Link>
      </div>
    </div>
  );
}
