import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, MapPin, Sparkles, Star, Users } from "lucide-react";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteIds, getRelatedServices, getServiceBySlug } from "@/lib/app/queries";
import { formatDate, formatINR, loc, locJson, parseJson } from "@/lib/utils";
import { ctaKeyFor, formatSlot, imageOf } from "@/lib/app/helpers";
import { Accordion, Avatar, Stars } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { BackButton, FavoriteButton, Gallery, ShareButton } from "@/components/app/bits";
import { PackagePicker, type AddonData, type PackageData } from "@/components/app/package-picker";
import { Scroller, ServiceCard } from "@/components/app/cards";
import type { ServiceCardData } from "@/lib/app/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return { title: service.nameEn, description: service.taglineEn ?? undefined };
}

type Step = string | { title?: string; titleEn?: string; desc?: string; description?: string };

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t, locale } = await getT();
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const user = await getCurrentUser();
  const [related, favIds] = await Promise.all([getRelatedServices(service), getFavoriteIds(user?.id)]);

  const name = loc(service, "name", locale);
  const images = parseJson<string[]>(service.images, []);
  const gallery = images.length ? images : [imageOf(service, "services", service.slug)];
  const benefits = locJson<string[]>(service, "benefits", locale, []);
  const steps = locJson<Step[]>(service, "process", locale, []);
  const faq = locJson<{ q: string; a: string }[]>(service, "faq", locale, []);
  const slots = parseJson<string[]>(service.slots, []);
  const aboutTitle = service.type === "CHADHAVA" ? t("app.aboutChadhava") : service.type === "PRASAD" ? t("app.aboutPrasad") : t("app.aboutSection");

  return (
    <div className="pb-32">
      {/* gallery + floating chrome */}
      <div className="relative">
        <Gallery images={gallery} alt={name} />
        <div className="absolute inset-x-0 top-0 flex items-center gap-2 p-3">
          <BackButton />
          <div className="ml-auto flex items-center gap-2">
            <ShareButton title={name} text={loc(service, "tagline", locale)} />
            <FavoriteButton serviceId={service.id} initial={favIds.has(service.id)} />
          </div>
        </div>
      </div>

      {/* header */}
      <section className="px-4 pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {loc(service, "deity", locale) && <Badge tone="primary">{loc(service, "deity", locale)}</Badge>}
          {service.category && <Badge tone="muted">{loc(service.category, "name", locale)}</Badge>}
          {service.festival && (
            <Link href={`/festivals/${service.festival.slug}`}>
              <Badge tone="gold">{loc(service.festival, "name", locale)}</Badge>
            </Link>
          )}
        </div>
        <h1 className="mt-2 text-[21px] font-bold leading-tight tracking-tight">{name}</h1>
        {loc(service, "tagline", locale) && <p className="mt-1 text-[13.5px] leading-snug text-muted">{loc(service, "tagline", locale)}</p>}

        {service.temple && (
          <Link href={`/temple/${service.temple.slug}`} className="mt-3 flex items-center gap-2.5 rounded-2xl border border-border bg-surface p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageOf(service.temple, "temples", service.temple.slug)} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] text-muted">{t("app.performedAt")}</span>
              <span className="block truncate text-[13.5px] font-semibold">{loc(service.temple, "name", locale)}</span>
              <span className="flex items-center gap-1 text-[11.5px] text-muted">
                <MapPin className="h-3 w-3" />
                {service.temple.city}, {service.temple.state}
              </span>
            </span>
          </Link>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted">
          <Stars value={service.ratingAvg} count={service.ratingCount} />
          {service.bookingCount > 0 && (
            <span className="flex items-center gap-1 text-success">
              <Users className="h-3.5 w-3.5" /> {t("app.bookedCount", { n: service.bookingCount })}
            </span>
          )}
          {service.durationMin && (
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" /> {t("app.durationLabel", { n: service.durationMin })}
            </span>
          )}
        </div>

        {(service.nextDate || slots.length > 0) && (
          <div className="mt-3 rounded-2xl border border-border bg-surface-2 p-3">
            {service.nextDate && (
              <p className="flex items-center gap-2 text-[13px] font-semibold">
                <CalendarDays className="h-4 w-4 text-primary" />
                {t("app.nextOn", { date: formatDate(service.nextDate, locale, { weekday: "long", day: "numeric", month: "long" }) })}
              </p>
            )}
            {slots.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {slots.map((s) => (
                  <span key={s} className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11.5px] font-medium">
                    {formatSlot(s, locale)}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-[12px] text-muted">{t("app.fromPrice")}</span>
          <span className="text-[22px] font-bold">{formatINR(service.basePrice, locale)}</span>
          {service.compareAtPrice && service.compareAtPrice > service.basePrice && (
            <span className="text-[13px] text-muted line-through">{formatINR(service.compareAtPrice, locale)}</span>
          )}
        </div>
      </section>

      {/* about */}
      {loc(service, "description", locale) && (
        <section className="mt-6 px-4">
          <h2 className="text-[17px] font-bold tracking-tight">{aboutTitle}</h2>
          <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-foreground/85">{loc(service, "description", locale)}</p>
        </section>
      )}

      {/* benefits */}
      {benefits.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-[17px] font-bold tracking-tight">{t("app.benefitsSection")}</h2>
          <ul className="mt-3 space-y-2">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 rounded-xl bg-success-soft px-3 py-2.5 text-[13px] leading-snug">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* process */}
      {steps.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="text-[17px] font-bold tracking-tight">{t("app.processSection")}</h2>
          <ol className="mt-3">
            {steps.map((step, i) => {
              const title = typeof step === "string" ? step : step.title ?? step.titleEn ?? "";
              const desc = typeof step === "string" ? "" : step.desc ?? step.description ?? "";
              return (
                <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < steps.length - 1 && <span className="absolute left-[15px] top-8 bottom-0 w-px bg-border" aria-hidden />}
                  <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-kesari text-[13px] font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 pt-1">
                    <p className="text-[13.5px] font-semibold leading-snug">{title}</p>
                    {desc && <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{desc}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* packages + addons + sticky CTA */}
      <PackagePicker
        serviceSlug={service.slug}
        basePrice={service.basePrice}
        packages={service.packages as PackageData[]}
        addons={service.addons as AddonData[]}
        ctaLabel={t(ctaKeyFor(service.type))}
      />

      {/* faq */}
      {faq.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="mb-3 text-[17px] font-bold tracking-tight">{t("app.faqSection")}</h2>
          <Accordion items={faq.map((f) => ({ title: f.q, body: f.a }))} />
        </section>
      )}

      {/* reviews */}
      <section className="mt-6 px-4">
        <h2 className="text-[17px] font-bold tracking-tight">{t("app.reviewsSection")}</h2>
        {service.reviews.length === 0 ? (
          <p className="mt-2 rounded-2xl border border-dashed border-border p-4 text-center text-[13px] text-muted">{t("app.noReviewsHint")}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {service.reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-surface p-3">
                <div className="flex items-center gap-2.5">
                  <Avatar src={r.user.avatarUrl} name={r.user.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{r.user.name ?? t("app.welcome")}</p>
                    <p className="text-[11px] text-muted">{formatDate(r.createdAt, locale)}</p>
                  </div>
                  <span className="flex items-center gap-0.5 rounded-full bg-success-soft px-2 py-0.5 text-[11.5px] font-bold text-success">
                    {r.rating} <Star className="h-3 w-3 fill-current" />
                  </span>
                </div>
                {r.comment && <p className="mt-2 text-[13px] leading-snug text-foreground/85">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 px-4 text-[17px] font-bold tracking-tight">{t("app.relatedSection")}</h2>
          <Scroller>
            {related.map((s) => (
              <ServiceCard key={s.id} s={s as ServiceCardData} favorited={favIds.has(s.id)} />
            ))}
          </Scroller>
        </section>
      )}
    </div>
  );
}
