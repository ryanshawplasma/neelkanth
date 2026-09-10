import type { ReactNode } from "react";
import { requirePandit } from "@/lib/auth";
import { getUnreadCount } from "@/lib/pandit/queries";
import { PanditShell } from "@/components/pandit/shell";
import { ServiceWorkerRegistrar } from "@/components/push-register";

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
        }}
      >
        {children}
      </PanditShell>
    </>
  );
}
