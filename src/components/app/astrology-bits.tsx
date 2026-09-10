"use client";

import { useState, useTransition } from "react";
import { Sparkles, Star } from "lucide-react";
import { useLocale, useT } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { CONSULT_TOPICS, pickBi } from "@/lib/constants";
import { actionErrorKey } from "@/lib/app/helpers";
import { requestConsultationAction } from "@/lib/app/misc-actions";
import type { Rashifal } from "@/lib/app/rashifal";

export function RashifalPanel({ items, initialRashi }: { items: Rashifal[]; initialRashi?: string | null }) {
  const t = useT();
  const locale = useLocale();
  const [rashi, setRashi] = useState(initialRashi || items[0]?.rashi || "mesh");
  const r = items.find((x) => x.rashi === rashi) ?? items[0];
  if (!r) return null;

  return (
    <section className="mt-5 px-4">
      <h2 className="text-[17px] font-bold tracking-tight">{t("app.todayRashifal")}</h2>

      <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {items.map((x) => (
          <button
            key={x.rashi}
            onClick={() => setRashi(x.rashi)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium",
              x.rashi === rashi ? "border-primary bg-primary-soft text-primary-700" : "border-border bg-surface",
            )}
          >
            {locale === "hi" ? x.labelHi : x.labelEn}
          </button>
        ))}
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)]">
        <div className="gradient-gold px-4 py-3 text-[#3a2a00]">
          <p className="text-[16px] font-bold leading-tight">{locale === "hi" ? r.labelHi : r.labelEn}</p>
          <div className="mt-1 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={cn("h-3.5 w-3.5", i <= r.score ? "fill-current" : "opacity-30")} />
            ))}
          </div>
        </div>
        <div className="p-4">
          <p className="text-[13.5px] leading-relaxed">{locale === "hi" ? r.textHi : r.textEn}</p>
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-[12.5px] leading-snug">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              <span className="font-semibold">{t("app.remedy")}: </span>
              {locale === "hi" ? r.adviceHi : r.adviceEn}
            </span>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
            <div className="rounded-xl bg-surface-2 px-3 py-2">
              <p className="text-muted">{t("app.luckyColor")}</p>
              <p className="mt-0.5 text-[13.5px] font-bold">{locale === "hi" ? r.colorHi : r.colorEn}</p>
            </div>
            <div className="rounded-xl bg-surface-2 px-3 py-2">
              <p className="text-muted">{t("app.luckyNumber")}</p>
              <p className="mt-0.5 text-[13.5px] font-bold">{r.luckyNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ConsultForm({ isLoggedIn, panditId }: { isLoggedIn: boolean; panditId?: string }) {
  const t = useT();
  const locale = useLocale();
  const { toast } = useToast();
  const [topic, setTopic] = useState(CONSULT_TOPICS[0].value as string);
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"chat" | "call" | "video">("chat");
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  if (sent) {
    return (
      <div className="mt-3 rounded-2xl border border-success/30 bg-success-soft p-4 text-center animate-fade-up">
        <p className="text-[15px] font-bold text-success">{t("app.requestSent")}</p>
        <p className="mt-1 text-[12.5px] text-success/85">{t("app.requestSentHint")}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-border bg-surface p-4">
      <Field label={t("app.consultTopic")}>
        <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
          {CONSULT_TOPICS.map((c) => (
            <option key={c.value} value={c.value}>
              {pickBi(c.label, locale)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("app.yourQuestion")}>
        <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder={t("app.questionPlaceholder")} />
      </Field>
      <div>
        <p className="mb-1.5 text-sm font-medium">{t("app.consultMode")}</p>
        <div className="flex gap-2">
          {(["chat", "call", "video"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 rounded-xl border py-2 text-[12.5px] font-medium",
                mode === m ? "border-primary bg-primary-soft text-primary-700" : "border-border bg-surface",
              )}
            >
              {t(m === "chat" ? "app.modeChat" : m === "call" ? "app.modeCall" : "app.modeVideo")}
            </button>
          ))}
        </div>
      </div>
      <Button
        full
        size="lg"
        loading={pending}
        onClick={() => {
          if (!isLoggedIn) {
            window.location.href = "/login?next=%2Fastrology";
            return;
          }
          start(async () => {
            const res = await requestConsultationAction({ topic, question, mode, panditId });
            if (res.ok) setSent(true);
            else toast(t(actionErrorKey(res.error)), "error");
          });
        }}
      >
        {t("app.sendRequest")}
      </Button>
    </div>
  );
}
