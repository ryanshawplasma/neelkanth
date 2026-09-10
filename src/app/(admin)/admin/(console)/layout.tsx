import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";
import { getPendingKycCount } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

/** Console chrome. Every page below also re-checks `requireAdmin()`. */
export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const pendingKyc = await getPendingKycCount();

  return (
    <AdminShell user={{ name: admin.name, email: admin.email, avatarUrl: admin.avatarUrl }} pendingKyc={pendingKyc}>
      {children}
    </AdminShell>
  );
}
