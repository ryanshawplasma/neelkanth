import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { getT } from "@/i18n/server";
import { BackButton } from "@/components/app/bits";

export const dynamic = "force-dynamic";

const PAGES = ["about", "privacy", "terms", "contact"] as const;
type Slug = (typeof PAGES)[number];

export function generateStaticParams() {
  return PAGES.map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!PAGES.includes(slug as Slug)) notFound();
  const { t } = await getT();

  const titles: Record<Slug, string> = {
    about: t("app.aboutTitle"),
    privacy: t("common.privacy"),
    terms: t("common.terms"),
    contact: t("common.contact"),
  };
  const bodies: Record<Slug, string[]> = {
    about: [t("app.aboutBody"), t("app.aboutBody2")],
    privacy: [t("app.privacyBody"), t("app.privacyBody2")],
    terms: [t("app.termsBody"), t("app.termsBody2")],
    contact: [t("app.contactBody")],
  };

  return (
    <div className="pb-10">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-surface/95 px-3 py-2.5 backdrop-blur">
        <BackButton fallback="/account" className="bg-transparent shadow-none" />
        <h1 className="flex-1 truncate text-[15px] font-semibold">{titles[slug as Slug]}</h1>
      </header>

      <article className="px-4 pt-5">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-kesari text-2xl text-white">ॐ</span>
          <h2 className="mt-3 text-[19px] font-bold tracking-tight">{titles[slug as Slug]}</h2>
        </div>
        <div className="mt-5 space-y-4">
          {bodies[slug as Slug].map((p, i) => (
            <p key={i} className="text-[13.5px] leading-relaxed text-foreground/85">
              {p}
            </p>
          ))}
        </div>

        {slug === "contact" && (
          <div className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            <a href={`mailto:${t("app.supportEmail")}`} className="flex items-center gap-3 px-3.5 py-3">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-[13.5px] font-medium">{t("app.supportEmail")}</span>
            </a>
            <a href={`tel:${t("app.supportPhone").replace(/\s/g, "")}`} className="flex items-center gap-3 px-3.5 py-3">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-[13.5px] font-medium">{t("app.supportPhone")}</span>
            </a>
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-muted">{t("common.poweredBy")}</p>
      </article>
    </div>
  );
}
