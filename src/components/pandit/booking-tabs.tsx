"use client";

import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/misc";
import { useT } from "@/i18n/client";
import { BOOKING_TABS, type BookingTab } from "@/lib/pandit/shared";

const LABEL_KEY: Record<BookingTab, string> = {
  upcoming: "tabUpcoming",
  inprogress: "tabInProgress",
  completed: "tabCompleted",
  cancelled: "tabCancelled",
};

export function BookingTabs({ value, counts }: { value: BookingTab; counts: Record<BookingTab, number> }) {
  const t = useT();
  const router = useRouter();
  return (
    <Tabs
      value={value}
      onChange={(v) => router.push(`/pandit/bookings?tab=${v}`)}
      tabs={BOOKING_TABS.map((tab) => ({ value: tab, label: t(`pandit.${LABEL_KEY[tab]}`), count: counts[tab] }))}
    />
  );
}
