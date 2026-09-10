import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/app/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const next = raw && raw.startsWith("/") ? raw : "/";
  const user = await getCurrentUser();
  if (user) redirect(user.onboarded ? next : `/onboarding?next=${encodeURIComponent(next)}`);
  return <LoginForm next={next} />;
}
