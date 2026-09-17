import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth";
import { formatPhone } from "@/lib/account-types";
import { getPendingKycCount, getSupportUnreadCount } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

/** Console chrome. Every page below also re-checks `requireAdmin()`. */
export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [pendingKyc, supportUnread] = await Promise.all([getPendingKycCount(), getSupportUnreadCount()]);
  const detail = admin.email ?? formatPhone(admin.phone);

  return (
    <AdminShell
      account={{
        id: admin.id,
        name: admin.name || admin.pandit?.displayName || detail || "Admin",
        detail,
        role: admin.role,
        avatarUrl: admin.avatarUrl ?? admin.pandit?.photoUrl ?? null,
        hasPanditProfile: !!admin.pandit,
      }}
      pendingKyc={pendingKyc}
      supportUnread={supportUnread}
    >
      {children}
    </AdminShell>
  );
}

/** Vercel: allow slow cold starts + cross-region DB round-trips (default limit is 10s). */
export const maxDuration = 30;
