"use client";

import { useState, useTransition } from "react";
import { CircleAlert, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { changeAdminPasswordAction } from "@/lib/auth-actions";
import { MIN_ADMIN_PASSWORD_LENGTH, adminPasswordProblem } from "@/lib/admin-password";
import { Panel } from "./page-shell";
import { tErr } from "./action-button";

/**
 * The signed-in admin's password. `published` = they signed in with the password the public
 * README prints, so the panel says so in red until it is changed.
 */
export function PasswordForm({ published = false }: { published?: boolean }) {
  const t = useT();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const problem = adminPasswordProblem(next, current);
    if (problem) return setError(t(`admin.${problem}`, { min: MIN_ADMIN_PASSWORD_LENGTH }));
    if (next !== again) return setError(t("admin.errPasswordMismatch"));
    start(async () => {
      const res = await changeAdminPasswordAction(current, next);
      if (!res.ok) {
        setError(res.error === "admin.errPasswordShort" ? t(res.error, { min: MIN_ADMIN_PASSWORD_LENGTH }) : tErr(t, res.error));
        return;
      }
      setCurrent("");
      setNext("");
      setAgain("");
      setChanged(true);
      toast(t("admin.passwordChanged"), "success");
    });
  }

  return (
    <div id="password" className="scroll-mt-24">
      <Panel title={t("admin.passwordTitle")} subtitle={t("admin.passwordHint")} icon={<KeyRound className="h-4 w-4 text-muted" />}>
        {published && !changed && (
          <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {t("admin.passwordPublished")}
          </p>
        )}
        <form onSubmit={submit} className="space-y-3" noValidate>
          <Field label={t("admin.passwordCurrent")} required>
            <Input type="password" value={current} autoComplete="current-password" onChange={(e) => setCurrent(e.target.value)} />
          </Field>
          <Field label={t("admin.passwordNew")} hint={t("admin.passwordNewHint", { min: MIN_ADMIN_PASSWORD_LENGTH })} required>
            <Input type="password" value={next} autoComplete="new-password" onChange={(e) => setNext(e.target.value)} />
          </Field>
          <Field label={t("admin.passwordAgain")} required>
            <Input type="password" value={again} autoComplete="new-password" onChange={(e) => setAgain(e.target.value)} />
          </Field>
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          <Button type="submit" full loading={pending} icon={<KeyRound className="h-4 w-4" />} disabled={!current || !next || !again}>
            {t("admin.passwordChange")}
          </Button>
        </form>
      </Panel>
    </div>
  );
}
