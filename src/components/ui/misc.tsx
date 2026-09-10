"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ChevronLeft, Star, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn, initials } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

export function EmptyState({ icon, title, hint, action, className }: { icon?: ReactNode; title: ReactNode; hint?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">{icon ?? <Sparkles className="h-6 w-6" />}</div>
      <p className="text-base font-semibold">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Avatar({ src, name, size = 40, className }: { src?: string | null; name?: string | null; size?: number; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name ?? ""} width={size} height={size} className={cn("shrink-0 rounded-full object-cover", className)} style={{ width: size, height: size }} />
  ) : (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full gradient-kesari text-white font-semibold", className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  );
}

export function Stars({ value, count, size = 14, className }: { value: number; count?: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-muted", className)}>
      <Star style={{ width: size, height: size }} className="fill-gold text-gold" />
      <span className="font-semibold text-foreground">{value.toFixed(1)}</span>
      {count !== undefined && <span>({count})</span>}
    </span>
  );
}

/** Page header with back button, used by inner screens of the devotee app. */
export function PageHeader({ title, subtitle, right, back = true, className, transparent }: { title?: ReactNode; subtitle?: ReactNode; right?: ReactNode; back?: boolean | string; className?: string; transparent?: boolean }) {
  const router = useRouter();
  return (
    <header className={cn("sticky top-0 z-30 flex items-center gap-2 px-3 py-2.5", transparent ? "" : "border-b border-border bg-surface/90 backdrop-blur", className)}>
      {back &&
        (typeof back === "string" ? (
          <Link href={back} className="rounded-full p-2 hover:bg-surface-2" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : (
          <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-surface-2" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </button>
        ))}
      <div className="min-w-0 flex-1">
        {title && <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>}
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { value: T; label: ReactNode; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn("hide-scrollbar flex gap-1 overflow-x-auto border-b border-border px-2", className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "relative shrink-0 px-3 py-2.5 text-sm font-medium transition-colors",
            value === t.value ? "text-primary" : "text-muted hover:text-foreground",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1 rounded-full bg-surface-2 px-1.5 text-xs">{t.count}</span>}
          {value === t.value && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
        </button>
      ))}
    </div>
  );
}

export function Accordion({ items }: { items: { title: ReactNode; body: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {items.map((it, i) => (
        <div key={i}>
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium">
            {it.title}
            <span className={cn("text-muted transition-transform", open === i && "rotate-180")}>⌄</span>
          </button>
          {open === i && <div className="px-4 pb-4 text-sm text-muted">{it.body}</div>}
        </div>
      ))}
    </div>
  );
}

export function Stat({ label, value, sub, tone, icon }: { label: ReactNode; value: ReactNode; sub?: ReactNode; tone?: "primary" | "success" | "warning" | "danger" | "info"; icon?: ReactNode }) {
  const tones = {
    primary: "bg-primary-soft text-primary-700",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    info: "bg-info-soft text-info",
  };
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        {icon && <span className={cn("rounded-lg p-1.5", tones[tone ?? "primary"])}>{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function Divider({ label }: { label?: ReactNode }) {
  return label ? (
    <div className="my-4 flex items-center gap-3 text-xs text-muted">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  ) : (
    <div className="my-4 h-px bg-border" />
  );
}
