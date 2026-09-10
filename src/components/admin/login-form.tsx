"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { adminLoginAction } from "@/lib/auth-actions";
import { useT } from "@/i18n/client";
import { tErr } from "./action-button";

export function AdminLoginForm({ next }: { next?: string }) {
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await adminLoginAction(email, password);
      if (!res.ok) {
        setError(res.error === "invalidCredentials" ? t("admin.errInvalidCredentials") : tErr(t, res.error));
        return;
      }
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label={t("common.email")} required>
        <Input
          type="email"
          value={email}
          autoComplete="username"
          autoFocus
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@divyadham.app"
          error={!!error}
        />
      </Field>
      <Field label={t("common.password")} required>
        <Input
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          error={!!error}
        />
      </Field>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <Button type="submit" full size="lg" loading={pending} icon={<LogIn className="h-4 w-4" />} disabled={!email || !password}>
        {t("admin.signIn")}
      </Button>
    </form>
  );
}
