import type { ReactNode } from "react";
import { requirePandit } from "@/lib/auth";
import { getUnreadCount } from "@/lib/pandit/queries";
import { PanditShell } from "@/components/pandit/shell";
import { ServiceWorkerRegistrar } from "@/components/push-register";
import { formatPhone } from "@/lib/account-types";

export default async function PanditPortalLayout({ children }: { children: ReactNode }) {
  const { user, pandit } = await requirePandit();
  const unread = await getUnreadCount(user.id);

  return (
    <>
      <ServiceWorkerRegistrar />
      <PanditShell
        user={{
          name: pandit.displayName || user.name || "",
          photoUrl: pandit.photoUrl ?? user.avatarUrl ?? null,
          unread,
          verified: pandit.verified,
          isActive: pandit.isActive,
          account: {
            id: user.id,
            name: pandit.displayName || user.name || formatPhone(user.phone) || "",
            detail: formatPhone(user.phone) ?? user.email,
            role: user.role,
            avatarUrl: pandit.photoUrl ?? user.avatarUrl ?? null,
            hasPanditProfile: true,
          },
        }}
      >
        {children}
      </PanditShell>
    </>
  );
}

/** Vercel: allow slow cold starts + cross-region DB round-trips (default limit is 10s). */
export const maxDuration = 30;
