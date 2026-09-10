import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PanditLoginForm } from "@/components/pandit/login-form";

export const metadata: Metadata = { title: "Pandit Login" };

export default async function PanditLoginPage() {
  const user = await getCurrentUser();
  if (user && (user.role === "PANDIT" || user.role === "ADMIN")) {
    redirect(user.pandit ? "/pandit/dashboard" : "/pandit/register");
  }
  return <PanditLoginForm />;
}
