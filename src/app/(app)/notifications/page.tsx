import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listNotifications } from "@/lib/app/queries";
import { NotificationsList, type NotificationRow } from "@/components/app/notifications-list";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fnotifications");
  const items = await listNotifications(user.id);
  return (
    <NotificationsList
      items={items.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })) as NotificationRow[]}
    />
  );
}
