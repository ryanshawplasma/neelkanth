import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "primary" | "success" | "warning" | "danger" | "info" | "muted" | "gold" | "maroon";

const tones: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary-700",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  muted: "bg-surface-2 text-muted",
  gold: "bg-gold-soft text-[#8a6300]",
  maroon: "bg-maroon-soft text-maroon",
};

export function Badge({ tone = "muted", className, children, dot }: { tone?: Tone; className?: string; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5", tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function toneForStatus(tone: string | undefined): Tone {
  return (["primary", "success", "warning", "danger", "info", "muted", "gold", "maroon"].includes(tone ?? "") ? tone : "muted") as Tone;
}
