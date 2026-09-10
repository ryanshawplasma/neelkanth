"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";
import { useLocale } from "@/i18n/client";
import { setLocaleAction } from "@/i18n/actions";
import { cn } from "@/lib/utils";

/** Compact EN / हि toggle. Persists to cookie (and user profile when logged in). */
export function LanguageSwitch({ className, size = "sm" }: { className?: string; size?: "sm" | "md" }) {
  const locale = useLocale();
  const [pending, start] = useTransition();
  const next = locale === "en" ? "hi" : "en";
  return (
    <button
      type="button"
      onClick={() => start(() => setLocaleAction(next))}
      disabled={pending}
      aria-label="Change language"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface font-semibold text-foreground hover:bg-surface-2 disabled:opacity-60",
        size === "sm" ? "h-8 px-2.5 text-xs" : "h-10 px-3.5 text-sm",
        className,
      )}
    >
      <Languages className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span className={locale === "en" ? "text-primary" : "text-muted"}>EN</span>
      <span className="text-muted">/</span>
      <span className={locale === "hi" ? "text-primary" : "text-muted"}>हि</span>
    </button>
  );
}

/** Large two-option language picker for onboarding. */
export function LanguagePicker({ onPick }: { onPick?: (l: "en" | "hi") => void }) {
  const locale = useLocale();
  const [pending, start] = useTransition();
  const opts = [
    { v: "hi" as const, big: "हिन्दी", small: "Hindi" },
    { v: "en" as const, big: "English", small: "अंग्रेज़ी" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await setLocaleAction(o.v);
              onPick?.(o.v);
            })
          }
          className={cn(
            "rounded-2xl border-2 p-5 text-center transition-colors",
            locale === o.v ? "border-primary bg-primary-soft" : "border-border bg-surface hover:bg-surface-2",
          )}
        >
          <div className="text-2xl font-bold">{o.big}</div>
          <div className="mt-1 text-sm text-muted">{o.small}</div>
        </button>
      ))}
    </div>
  );
}
