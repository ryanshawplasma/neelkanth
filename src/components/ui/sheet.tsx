"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet on mobile, centered dialog on desktop.
 * Rendered into <body> through a portal: an ancestor with `backdrop-filter`, `filter` or `transform`
 * (sticky blurred headers, animated drawers) would otherwise trap the fixed overlay inside itself.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  side = "bottom",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  side?: "bottom" | "center";
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/45 animate-[fade-up_0.2s]" onClick={onClose} />
      <div
        className={cn(
          "absolute inset-x-0 mx-auto flex max-h-[90dvh] w-full flex-col bg-surface shadow-2xl animate-fade-up",
          side === "bottom"
            ? "bottom-0 rounded-t-3xl sm:bottom-auto sm:top-1/2 sm:max-w-lg sm:-translate-y-1/2 sm:rounded-3xl"
            : "top-1/2 max-w-lg -translate-y-1/2 rounded-3xl",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-border sm:hidden absolute left-1/2 -translate-x-1/2 top-2" />
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted hover:bg-surface-2" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-border px-5 py-3 pb-safe">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  danger?: boolean;
  loading?: boolean;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title} side="center">
      {description && <p className="text-sm text-muted">{description}</p>}
      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="h-11 flex-1 rounded-xl border border-border text-sm font-medium hover:bg-surface-2">
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn("h-11 flex-1 rounded-xl text-sm font-semibold text-white disabled:opacity-60", danger ? "bg-danger" : "bg-primary")}
        >
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  );
}
