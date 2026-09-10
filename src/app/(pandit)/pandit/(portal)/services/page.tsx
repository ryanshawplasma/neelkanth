import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { getServiceCatalog } from "@/lib/pandit/queries";
import { PortalHeader } from "@/components/pandit/shell";
import { ServicesClient } from "@/components/pandit/services-client";

export const metadata: Metadata = { title: "My Services" };

export default async function PanditServicesPage() {
  const { t } = await getT();
  const { services, offered } = await getServiceCatalog();

  return (
    <div>
      <PortalHeader title={t("pandit.servicesTitle")} subtitle={t("pandit.servicesSubtitle")} />
      <ServicesClient
        services={services.map((s) => ({
          id: s.id,
          type: s.type,
          nameEn: s.nameEn,
          nameHi: s.nameHi,
          taglineEn: s.taglineEn,
          taglineHi: s.taglineHi,
          basePrice: s.basePrice,
          durationMin: s.durationMin,
          temple: s.temple,
        }))}
        offered={offered}
      />
    </div>
  );
}
