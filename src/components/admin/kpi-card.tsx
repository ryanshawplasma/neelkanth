import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-primary-soft text-primary-700",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  gold: "bg-gold-soft text-[#8a6300]",
  maroon: "bg-maroon-soft text-maroon",
} as const;

export type KpiTone = keyof typeof tones;

/** Compact metric tile used on the overview. Optionally links somewhere. */
export function KpiCard({
  label,
  value,
  sub,
  icon,
  tone = "primary",
  href,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: KpiTone;
  href?: string;
  className?: string;
}) {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow)] transition-shadow",
        href && "hover:border-primary/40 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        {icon && <span className={cn("rounded-lg p-1.5", tones[tone])}>{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold leading-tight tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}
