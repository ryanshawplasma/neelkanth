"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Check, Copy, Heart, Share2 } from "lucide-react";
import { useLoc, useT } from "@/i18n/client";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { toggleFavoriteAction } from "@/lib/app/misc-actions";
import type { BannerData } from "@/lib/app/types";

/* ─────────────────────── favourite heart ─────────────────────── */

export function FavoriteButton({
  serviceId,
  initial,
  className,
  large,
}: {
  serviceId: string;
  initial: boolean;
  className?: string;
  large?: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [, start] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const t = useT();

  return (
    <button
      type="button"
      aria-label={t("app.favorites")}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !on;
        setOn(next); // optimistic
        start(async () => {
          const res = await toggleFavoriteAction(serviceId);
          if (!res.ok) {
            setOn(!next);
            if (res.error === "notLoggedIn") router.push("/login?next=" + encodeURIComponent(window.location.pathname));
            else toast(t("common.somethingWrong"), "error");
            return;
          }
          setOn(res.data!.favorited);
          toast(res.data!.favorited ? t("app.addedToFavorites") : t("app.removedFromFavorites"), "info");
        });
      }}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform active:scale-90",
        large ? "h-10 w-10" : "h-8 w-8",
        className,
      )}
    >
      <Heart className={cn(large ? "h-5 w-5" : "h-4 w-4", on ? "fill-danger text-danger" : "text-muted")} />
    </button>
  );
}

/* ─────────────────────── back ─────────────────────── */

export function BackButton({ fallback = "/", className }: { fallback?: string; className?: string }) {
  const router = useRouter();
  const t = useT();
  return (
    <button
      type="button"
      aria-label={t("common.back")}
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur active:scale-90", className)}
    >
      <span aria-hidden className="text-lg leading-none">
        ‹
      </span>
    </button>
  );
}

/* ─────────────────────── share / copy ─────────────────────── */

export function ShareButton({ title, text, className, label }: { title: string; text?: string; className?: string; label?: boolean }) {
  const t = useT();
  const { toast } = useToast();
  return (
    <button
      type="button"
      aria-label={t("common.share")}
      onClick={async () => {
        const url = window.location.href;
        try {
          if (navigator.share) await navigator.share({ title, text: text ?? title, url });
          else {
            await navigator.clipboard.writeText(url);
            toast(t("common.copied"), "info");
          }
        } catch {
          /* user dismissed */
        }
      }}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full bg-white/90 text-muted shadow-sm backdrop-blur active:scale-90",
        label ? "h-9 px-3 text-xs font-semibold" : "h-8 w-8",
        className,
      )}
    >
      <Share2 className="h-4 w-4" />
      {label && t("common.share")}
    </button>
  );
}

export function CopyButton({ value, className }: { value: string; className?: string }) {
  const t = useT();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
      className={cn("inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium", className)}
    >
      {done ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? t("common.copied") : t("app.copyText")}
    </button>
  );
}

/* ─────────────────────── image gallery with dots ─────────────────────── */

export function Gallery({ images, alt, aspect = "aspect-[4/3]", overlay }: { images: string[]; alt: string; aspect?: string; overlay?: ReactNode }) {
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const list = images.length ? images : [""];

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIdx(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        }}
        className={cn("hide-scrollbar flex snap-x snap-mandatory overflow-x-auto bg-surface-2", aspect)}
      >
        {list.map((src, i) => (
          <div key={i} className="w-full shrink-0 snap-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
      {overlay}
      {list.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {list.map((_, i) => (
            <span key={i} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-4 bg-white" : "w-1.5 bg-white/60")} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── home banner carousel ─────────────────────── */

export function BannerCarousel({ banners }: { banners: BannerData[] }) {
  const loc = useLoc();
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / Math.max(1, el.clientWidth)) + 1) % banners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div className="relative mt-4">
      <div
        ref={ref}
        onScroll={(e) => setIdx(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
        className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4"
      >
        {banners.map((b) => {
          const inner = (
            <div className="relative flex h-[124px] w-full items-center overflow-hidden rounded-2xl gradient-maroon px-4 text-white shadow-[var(--shadow)]">
              {b.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
              )}
              <div className="relative z-10 max-w-[78%]">
                <p className="text-[15px] font-bold leading-tight drop-shadow">{loc(b, "title")}</p>
                {loc(b, "subtitle") && <p className="mt-1 text-[12px] leading-snug text-white/85 drop-shadow">{loc(b, "subtitle")}</p>}
              </div>
            </div>
          );
          return (
            <div key={b.id} className="w-full shrink-0 snap-center">
              {b.href ? <Link href={b.href}>{inner}</Link> : inner}
            </div>
          );
        })}
      </div>
      {banners.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {banners.map((_, i) => (
            <span key={i} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-4 bg-primary" : "w-1.5 bg-border")} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── celebratory banner after payment ─────────────────────── */

export function PaidBanner({ title, body }: { title: string; body: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl gradient-gold px-4 py-4 text-[#3a2a00] shadow-[var(--shadow)] animate-fade-up">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {[...Array(14)].map((_, i) => (
          <span
            key={i}
            className="absolute block h-1.5 w-1.5 rounded-full bg-white/70"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animation: `fade-up ${0.9 + (i % 5) * 0.25}s ease-out ${(i % 7) * 0.12}s both`,
            }}
          />
        ))}
      </div>
      <div className="relative flex items-start gap-3">
        <span className="animate-diya text-3xl leading-none" aria-hidden>
          🪔
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-tight">{title}</p>
          <p className="mt-1 text-[12.5px] leading-snug opacity-90">{body}</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── print ─────────────────────── */

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white print:hidden"
    >
      {label}
    </button>
  );
}

/* ─────────────────────── small dev note ─────────────────────── */

export function DevNote({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <p className="mt-3 rounded-xl border border-dashed border-warning/50 bg-warning-soft px-3 py-2 text-center text-[11.5px] text-warning">
      <span className="font-semibold">{t("app.devNote")} · </span>
      {children}
    </p>
  );
}
