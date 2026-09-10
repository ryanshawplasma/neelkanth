import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { getAvailability } from "@/lib/pandit/queries";
import { PortalHeader } from "@/components/pandit/shell";
import { AvailabilityClient } from "@/components/pandit/availability-client";

export const metadata: Metadata = { title: "Availability" };

export default async function PanditAvailabilityPage() {
  const { t } = await getT();
  const { slots, blocked } = await getAvailability();

  return (
    <div>
      <PortalHeader title={t("pandit.availabilityTitle")} subtitle={t("pandit.availabilitySubtitle")} />
      <AvailabilityClient
        slots={slots.map((s) => ({ weekday: s.weekday, startTime: s.startTime, endTime: s.endTime, enabled: s.enabled }))}
        blocked={blocked.map((b) => ({ id: b.id, date: b.date, reason: b.reason }))}
      />
    </div>
  );
}
