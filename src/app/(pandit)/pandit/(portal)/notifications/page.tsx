import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { getNotifications } from "@/lib/pandit/queries";
import { PortalHeader } from "@/components/pandit/shell";
import { NotificationList } from "@/components/pandit/notification-list";

export const metadata: Metadata = { title: "Notifications" };

export default async function PanditNotificationsPage() {
  const { t } = await getT();
  const { items, unread } = await getNotifications();

  return (
    <div className="pb-8">
      <PortalHeader title={t("pandit.notificationsTitle")} />
      <div className="px-4 pt-2">
        <NotificationList
          unread={unread}
          items={items.map((n) => ({
            id: n.id,
            titleEn: n.titleEn,
            titleHi: n.titleHi,
            bodyEn: n.bodyEn,
            bodyHi: n.bodyHi,
            href: n.href,
            read: n.read,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
