"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useT } from "@/i18n/client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-devotional flex min-h-dvh flex-1 items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <AlertTriangle className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-[22px] font-bold tracking-tight">{t("app.errorTitle")}</h1>
        <p className="mt-2 text-[13.5px] leading-snug text-muted">{t("app.errorHint")}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[15px] font-semibold text-white"
          >
            <RotateCcw className="h-4 w-4" />
            {t("common.retry")}
          </button>
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-surface px-5 text-[15px] font-semibold">
            {t("common.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
