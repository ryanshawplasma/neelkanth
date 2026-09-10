import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function PanditIndexPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "PANDIT" && user.role !== "ADMIN")) redirect("/pandit/login");
  redirect(user.pandit ? "/pandit/dashboard" : "/pandit/register");
}
