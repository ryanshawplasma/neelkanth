"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import type { TFunction } from "@/i18n";

export type ActionResult = { ok: boolean; error?: string } | void;

/** Errors come back as dictionary keys ("admin.errX") or plain sentences. */
export function tErr(t: TFunction, error?: string) {
  if (!error) return t("common.somethingWrong");
  return error.startsWith("admin.") || error.startsWith("common.") ? t(error) : error;
}

/**
 * Runs a bound server action (`myAction.bind(null, id)`), toasts the result and
 * refreshes the route. Set `confirm` for destructive actions.
 */
export function ActionButton({
  action,
  children,
  icon,
  variant = "outline",
  size = "sm",
  confirm,
  successMessage,
  disabled,
  full,
  className,
}: {
  action: () => Promise<ActionResult>;
  children: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  confirm?: { title: string; description?: string; confirmLabel?: string; danger?: boolean };
  successMessage?: string;
  disabled?: boolean;
  full?: boolean;
  className?: string;
}) {
  const t = useT();
  const { toast } = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  function run() {
    setOpen(false);
    start(async () => {
      try {
        const res = await action();
        if (res && res.ok === false) {
          toast(tErr(t, res.error), "error");
          return;
        }
        toast(successMessage ?? t("common.saved"), "success");
        router.refresh();
      } catch (e) {
        toast(e instanceof Error ? e.message : t("common.somethingWrong"), "error");
      }
    });
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        icon={icon}
        full={full}
        className={className}
        loading={pending}
        disabled={disabled}
        onClick={() => (confirm ? setOpen(true) : run())}
      >
        {children}
      </Button>
      {confirm && (
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={run}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.confirmLabel ?? t("common.confirm")}
          cancelLabel={t("common.cancel")}
          danger={confirm.danger}
          loading={pending}
        />
      )}
    </>
  );
}

/** Inline switch bound to a server action, e.g. `toggleFlagAction.bind(null, id, "featured")`. */
export function ToggleAction({
  checked,
  action,
  label,
  disabled,
}: {
  checked: boolean;
  action: (value: boolean) => Promise<ActionResult>;
  label?: ReactNode;
  disabled?: boolean;
}) {
  const t = useT();
  const { toast } = useToast();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [value, setValue] = useState(checked);

  return (
    <Toggle
      checked={value}
      disabled={disabled || pending}
      label={label}
      onChange={(v) => {
        setValue(v);
        start(async () => {
          const res = await action(v);
          if (res && res.ok === false) {
            setValue(!v);
            toast(tErr(t, res.error), "error");
            return;
          }
          router.refresh();
        });
      }}
    />
  );
}
