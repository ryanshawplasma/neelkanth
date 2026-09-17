import { redirect } from "next/navigation";
import { getCurrentUser, getDeviceAccounts } from "@/lib/auth";
import { LoginForm } from "@/components/app/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  // `?add=1` comes from "Add another account": stay on the form even though someone is signed in.
  const adding = sp.add === "1";
  const user = await getCurrentUser();
  if (user && !adding) redirect(user.onboarded ? next : `/onboarding?next=${encodeURIComponent(next)}`);
  const deviceAccounts = user ? [] : await getDeviceAccounts();
  return <LoginForm next={next} adding={adding && !!user} deviceAccounts={deviceAccounts} />;
}
