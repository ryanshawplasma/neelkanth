import { getT } from "@/i18n/server";
import { ServiceListPage, type ListSearchParams } from "@/components/app/service-list-page";

export const dynamic = "force-dynamic";

export default async function PoojasPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const { t } = await getT();
  return (
    <ServiceListPage
      title={t("app.poojasTitle")}
      subtitle={t("app.poojasSubtitle")}
      types={["ONLINE_POOJA", "PANDIT_AT_HOME", "KATHA", "LIVE_DARSHAN"]}
      typeFilter
      searchParams={await searchParams}
    />
  );
}
