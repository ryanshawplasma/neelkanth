"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { useT } from "@/i18n/client";

export default function NotFound() {
  const t = useT();
  return (
    <div className="bg-devotional flex min-h-dvh flex-1 items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl gradient-kesari text-4xl text-white shadow-lg">ॐ</span>
        <h1 className="mt-5 text-[22px] font-bold tracking-tight">{t("app.notFoundTitle")}</h1>
        <p className="mt-2 text-[13.5px] leading-snug text-muted">{t("app.notFoundHint")}</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-[15px] font-semibold text-white"
        >
          <Compass className="h-4 w-4" />
          {t("common.goHome")}
        </Link>
      </div>
    </div>
  );
}
