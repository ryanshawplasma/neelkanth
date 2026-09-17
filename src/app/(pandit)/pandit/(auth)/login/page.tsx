import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getDeviceAccounts } from "@/lib/auth";
import { PanditLoginForm } from "@/components/pandit/login-form";

export const metadata: Metadata = { title: "Pandit Login" };

export default async function PanditLoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  // `?add=1` comes from "Add another account": stay on the form even though someone is signed in.
  const adding = sp.add === "1";
  const user = await getCurrentUser();
  if (user && !adding && (user.role === "PANDIT" || user.role === "ADMIN")) {
    redirect(user.pandit ? "/pandit/dashboard" : "/pandit/register");
  }
  const deviceAccounts = user
    ? []
    : (await getDeviceAccounts()).filter((a) => a.role === "PANDIT" || (a.role === "ADMIN" && a.hasPanditProfile));
  return <PanditLoginForm adding={adding && !!user} deviceAccounts={deviceAccounts} />;
}
