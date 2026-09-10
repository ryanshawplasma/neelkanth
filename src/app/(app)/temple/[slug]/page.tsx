import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock3, MapPin, Radio } from "lucide-react";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteIds, getTempleBySlug } from "@/lib/app/queries";
import { loc, parseJson } from "@/lib/utils";
import { imageOf, mapsUrl, youtubeEmbed } from "@/lib/app/helpers";
import { SERVICE_TYPES, pickBi } from "@/lib/constants";
import { BackButton, Gallery, ShareButton } from "@/components/app/bits";
import { PanditCard, Scroller, ServiceRow } from "@/components/app/cards";
import type { PanditCardData, ServiceCardData } from "@/lib/app/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const temple = await getTempleBySlug(slug);
  return temple ? { title: temple.nameEn } : {};
}

export default async function TempleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t, locale } = await getT();
  const temple = await getTempleBySlug(slug);
  if (!temple) notFound();

  const user = await getCurrentUser();
  const favIds = await getFavoriteIds(user?.id);

  const name = loc(temple, "name", locale);
  const images = parseJson<string[]>(temple.images, []);
  const gallery = images.length ? images : [imageOf(temple, "temples", temple.slug)];
  const embed = youtubeEmbed(temple.liveDarshanUrl);
  const maps = mapsUrl(temple.latitude, temple.longitude, `${temple.nameEn}, ${temple.city}`);

  const grouped = SERVICE_TYPES.map((st) => ({
    type: st.value,
    label: pickBi(st.label, locale),
    items: temple.services.filter((s) => s.type === st.value),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="pb-10">
      <div className="relative">
        <Gallery images={gallery} alt={name} />
        <div className="absolute inset-x-0 top-0 flex items-center gap-2 p-3">
          <BackButton fallback="/temples" />
          <div className="ml-auto">
            <ShareButton title={name} />
          </div>
        </div>
      </div>

      <section className="px-4 pt-4">
        <h1 className="text-[21px] font-bold leading-tight tracking-tight">{name}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
          <MapPin className="h-3.5 w-3.5" />
          {temple.city}, {temple.state}
        </p>
        {loc(temple, "deity", locale) && <p className="mt-1 text-[13px] font-medium text-primary-700">{loc(temple, "deity", locale)}</p>}
        {temple.timings && (
          <p className="mt-2 flex items-center gap-1.5 text-[13px]">
            <Clock3 className="h-3.5 w-3.5 text-muted" />
            <span className="text-muted">{t("app.templeTimings")}:</span> {temple.timings}
          </p>
        )}
        {maps && (
          <a href={maps} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12.5px] font-semibold">
            <MapPin className="h-3.5 w-3.5 text-primary" /> {t("app.openInMaps")}
          </a>
        )}
      </section>

      {temple.liveDarshanUrl && (
        <section className="mt-5 px-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-[17px] font-bold tracking-tight">
            <Radio className="h-4 w-4 animate-pulse text-danger" /> {t("app.liveDarshanNow")}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-black">
            {embed ? (
              <iframe src={embed} title={t("app.liveDarshanNow")} allowFullScreen className="aspect-video w-full" />
            ) : (
              <a href={temple.liveDarshanUrl} target="_blank" rel="noreferrer" className="flex aspect-video items-center justify-center text-[14px] font-semibold text-white">
                {t("app.liveDarshanNow")} ↗
              </a>
            )}
          </div>
        </section>
      )}

      {loc(temple, "description", locale) && (
        <section className="mt-6 px-4">
          <h2 className="text-[17px] font-bold tracking-tight">{t("app.aboutTemple")}</h2>
          <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-foreground/85">{loc(temple, "description", locale)}</p>
        </section>
      )}

      {loc(temple, "history", locale) && (
        <section className="mt-6 px-4">
          <h2 className="text-[17px] font-bold tracking-tight">{t("app.templeHistory")}</h2>
          <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-foreground/85">{loc(temple, "history", locale)}</p>
        </section>
      )}

      {grouped.length > 0 && (
        <section className="mt-6">
          <h2 className="px-4 text-[17px] font-bold tracking-tight">{t("app.servicesAtTemple")}</h2>
          {grouped.map((g) => (
            <div key={g.type} className="mt-4">
              <h3 className="px-4 text-[13px] font-semibold uppercase tracking-wide text-muted">{g.label}</h3>
              <ul className="mt-2 space-y-3 px-4">
                {g.items.map((s) => (
                  <li key={s.id}>
                    <ServiceRow s={s as ServiceCardData} favorited={favIds.has(s.id)} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {temple.pandits.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 px-4 text-[17px] font-bold tracking-tight">{t("app.affiliatedPandits")}</h2>
          <Scroller>
            {temple.pandits.map((p) => (
              <PanditCard key={p.id} p={p as PanditCardData} />
            ))}
          </Scroller>
        </section>
      )}
    </div>
  );
}
