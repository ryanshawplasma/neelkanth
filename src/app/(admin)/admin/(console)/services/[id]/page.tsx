import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-shell";
import { ServiceEditor } from "@/components/admin/service-editor";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { getServiceEditorData } from "@/lib/admin/queries";
import { getT } from "@/i18n/server";
import type { ServiceInput } from "@/lib/admin/service-actions";
import type { Faq } from "@/components/admin/faq-editor";
import { formatDateTime, loc, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminEditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { t, locale } = await getT();
  const { service, categories, temples, festivals } = await getServiceEditorData(id);
  if (!service) notFound();

  const initial: ServiceInput & { id: string; realBookings: number } = {
    id: service.id,
    realBookings: service._count.bookings,
    bookingCount: service.bookingCount,
    slug: service.slug,
    type: service.type,
    nameEn: service.nameEn,
    nameHi: service.nameHi,
    taglineEn: service.taglineEn ?? "",
    taglineHi: service.taglineHi ?? "",
    descriptionEn: service.descriptionEn ?? "",
    descriptionHi: service.descriptionHi ?? "",
    benefitsEn: parseJson<string[]>(service.benefitsEn, []),
    benefitsHi: parseJson<string[]>(service.benefitsHi, []),
    processEn: parseJson<string[]>(service.processEn, []),
    processHi: parseJson<string[]>(service.processHi, []),
    faqEn: parseJson<Faq[]>(service.faqEn, []),
    faqHi: parseJson<Faq[]>(service.faqHi, []),
    deityEn: service.deityEn ?? "",
    deityHi: service.deityHi ?? "",
    images: parseJson<string[]>(service.images, []),
    basePrice: service.basePrice,
    compareAtPrice: service.compareAtPrice,
    durationMin: service.durationMin,
    categoryId: service.categoryId ?? "",
    templeId: service.templeId ?? "",
    festivalId: service.festivalId ?? "",
    availableFrom: service.availableFrom ?? "",
    availableTo: service.availableTo ?? "",
    nextDate: service.nextDate ?? "",
    slots: parseJson<string[]>(service.slots, []),
    tags: parseJson<string[]>(service.tags, []),
    featured: service.featured,
    trending: service.trending,
    active: service.active,
    requiresPandit: service.requiresPandit,
    ratingAvg: service.ratingAvg,
    ratingCount: service.ratingCount,
    sortOrder: service.sortOrder,
    packages: service.packages.map((p) => ({
      id: p.id,
      slug: p.slug,
      nameEn: p.nameEn,
      nameHi: p.nameHi,
      descriptionEn: p.descriptionEn ?? "",
      descriptionHi: p.descriptionHi ?? "",
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      maxDevotees: p.maxDevotees,
      featuresEn: parseJson<string[]>(p.featuresEn, []),
      featuresHi: parseJson<string[]>(p.featuresHi, []),
      popular: p.popular,
      sortOrder: p.sortOrder,
    })),
    addons: service.addons.map((a) => ({
      id: a.id,
      slug: a.slug,
      nameEn: a.nameEn,
      nameHi: a.nameHi,
      price: a.price,
      imageUrl: a.imageUrl ?? "",
    })),
  };

  return (
    <>
      <AdminPageHeader
        back="/admin/services"
        backLabel={t("admin.servicesTitle")}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {loc(service, "name", locale)}
            {service.active ? <Badge tone="success">{t("common.active")}</Badge> : <Badge tone="muted">{t("common.inactive")}</Badge>}
            {service.featured && <Badge tone="gold">{t("common.featured")}</Badge>}
            {service.trending && <Badge tone="primary">{t("common.trending")}</Badge>}
          </span>
        }
        subtitle={`${service.slug} · ${t("admin.updatedAt", { date: formatDateTime(service.updatedAt, locale) })} · ${t("admin.bookingCountInfo", { n: service._count.bookings })}`}
      />
      <ServiceEditor service={initial} categories={categories} temples={temples} festivals={festivals} />
    </>
  );
}
