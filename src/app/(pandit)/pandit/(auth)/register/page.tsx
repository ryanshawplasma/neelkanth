import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTempleOptions } from "@/lib/pandit/queries";
import { PanditRegisterForm } from "@/components/pandit/register-form";

export const metadata: Metadata = { title: "Pandit Registration" };

export default async function PanditRegisterPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/pandit/login");
  if (user.pandit) redirect("/pandit/dashboard");

  const temples = await getTempleOptions();
  return <PanditRegisterForm temples={temples} defaultName={user.name} />;
}
