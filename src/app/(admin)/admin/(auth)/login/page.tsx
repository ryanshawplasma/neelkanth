import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/login-form";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/i18n/server";
import type { SearchParams } from "@/lib/admin/util";
import { sp } from "@/lib/admin/util";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");
  const params = await searchParams;
  const { t } = await getT();

  return (
    <div className="bg-devotional flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          {t("admin.backToApp")}
        </Link>
        <LanguageSwitch />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl gradient-kesari text-2xl text-white shadow-lg">ॐ</span>
            <h1 className="text-2xl font-bold tracking-tight">{t("common.appName")}</h1>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
              <ShieldCheck className="h-4 w-4" />
              {t("admin.consoleTitle")}
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow)]">
            <h2 className="mb-4 text-base font-semibold">{t("admin.signInTitle")}</h2>
            <AdminLoginForm next={sp(params, "next")} />
          </div>

          <p className="mt-4 text-center text-xs text-muted">{t("admin.signInHint")}</p>
        </div>
      </main>
    </div>
  );
}
