"use client";

import { useEffect, useState } from "react";
import { Eye, Minus, Plus } from "lucide-react";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { incrementContentViewAction } from "@/lib/app/misc-actions";
import { BackButton, CopyButton, ShareButton } from "./bits";

export function LibraryReader({
  slug,
  title,
  subtitle,
  bodyHi,
  bodyEn,
  audioUrl,
  views,
}: {
  slug: string;
  title: string;
  subtitle: string;
  bodyHi: string;
  bodyEn: string | null;
  audioUrl: string | null;
  views: number;
}) {
  const t = useT();
  const [size, setSize] = useState(18);
  const [showMeaning, setShowMeaning] = useState(false);

  useEffect(() => {
    void incrementContentViewAction(slug);
  }, [slug]);

  return (
    <div className="pb-12">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-surface/95 px-3 py-2.5 backdrop-blur">
        <BackButton fallback="/library" className="bg-transparent shadow-none" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold leading-tight">{title}</h1>
          <p className="truncate text-[11.5px] text-muted">{subtitle}</p>
        </div>
        <ShareButton title={title} className="bg-transparent shadow-none" />
      </header>

      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="text-[12px] text-muted">{t("app.textSize")}</span>
        <button
          onClick={() => setSize((s) => Math.max(14, s - 2))}
          aria-label="A-"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-7 text-center text-[12.5px] font-semibold">{size}</span>
        <button
          onClick={() => setSize((s) => Math.min(34, s + 2))}
          aria-label="A+"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <span className="ml-auto flex items-center gap-1 text-[11.5px] text-muted">
          <Eye className="h-3.5 w-3.5" /> {t("app.viewsCount", { n: views })}
        </span>
      </div>

      {audioUrl && (
        <div className="border-b border-border px-4 py-3">
          <p className="mb-1.5 text-[12px] font-medium text-muted">{t("app.listenAudio")}</p>
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}

      <article className="px-4 pt-5">
        <p
          className="whitespace-pre-line font-[var(--font-devanagari)] leading-[1.9] text-foreground"
          style={{ fontSize: `${size}px` }}
        >
          {bodyHi}
        </p>

        {bodyEn && (
          <>
            <button
              onClick={() => setShowMeaning((v) => !v)}
              className={cn(
                "mt-6 w-full rounded-2xl border px-4 py-2.5 text-[13px] font-semibold transition-colors",
                showMeaning ? "border-primary bg-primary-soft text-primary-700" : "border-border bg-surface",
              )}
            >
              {showMeaning ? t("app.hideMeaning") : t("app.showMeaning")}
            </button>
            {showMeaning && (
              <div className="mt-3 rounded-2xl bg-surface-2 p-4 animate-fade-up">
                <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted">{t("app.transliteration")}</p>
                <p className="whitespace-pre-line text-[14px] leading-relaxed text-foreground/85">{bodyEn}</p>
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex justify-center gap-2">
          <CopyButton value={bodyHi} />
        </div>
      </article>
    </div>
  );
}
