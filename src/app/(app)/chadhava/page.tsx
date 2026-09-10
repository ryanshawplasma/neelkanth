import { getT } from "@/i18n/server";
import { ServiceListPage, type ListSearchParams } from "@/components/app/service-list-page";

export const dynamic = "force-dynamic";

export default async function ChadhavaPage({ searchParams }: { searchParams: Promise<ListSearchParams> }) {
  const { t } = await getT();
  return <ServiceListPage title={t("app.chadhavaTitle")} subtitle={t("app.chadhavaSubtitle")} types={["CHADHAVA"]} searchParams={await searchParams} />;
}
