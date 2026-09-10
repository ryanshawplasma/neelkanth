"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold" | "maroon";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm",
  secondary: "bg-primary-soft text-primary-700 hover:bg-[#ffdcc2]",
  outline: "border border-border bg-surface text-foreground hover:bg-surface-2",
  ghost: "text-foreground hover:bg-surface-2",
  danger: "bg-danger text-white hover:opacity-90",
  gold: "gradient-gold text-[#3a2a00] shadow-sm hover:opacity-95",
  maroon: "gradient-maroon text-white shadow-sm hover:opacity-95",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-lg gap-1.5",
  md: "h-11 px-4 text-sm font-semibold rounded-xl gap-2",
  lg: "h-13 px-6 text-base font-semibold rounded-2xl gap-2",
  icon: "h-10 w-10 rounded-full",
};

export function buttonClasses(opts: { variant?: ButtonVariant; size?: ButtonSize; full?: boolean; className?: string }) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap transition-colors select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[opts.variant ?? "primary"],
    sizes[opts.size ?? "md"],
    opts.full && "w-full",
    opts.className,
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  loading?: boolean;
  icon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant, size, full, loading, icon, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={buttonClasses({ variant, size, full, className })} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});

export function ButtonLink({
  href,
  className,
  variant,
  size,
  full,
  icon,
  children,
  ...rest
}: { href: string; variant?: ButtonVariant; size?: ButtonSize; full?: boolean; icon?: ReactNode; className?: string; children: ReactNode } & Omit<
  React.ComponentProps<typeof Link>,
  "href" | "className" | "children"
>) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, full, className })} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
