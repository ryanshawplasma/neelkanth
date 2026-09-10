import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getT } from "@/i18n/server";
import { getContentBySlug } from "@/lib/app/queries";
import { loc } from "@/lib/utils";
import { LibraryReader } from "@/components/app/library-reader";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getContentBySlug(slug);
  return c ? { title: c.titleEn } : {};
}

export default async function ContentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t, locale } = await getT();
  const c = await getContentBySlug(slug);
  if (!c) notFound();

  const deity = loc(c, "deity", locale);
  return (
    <LibraryReader
      slug={c.slug}
      title={loc(c, "title", locale)}
      subtitle={[t(`app.type${c.type}`), deity].filter(Boolean).join(" · ")}
      bodyHi={c.bodyHi}
      bodyEn={c.bodyEn}
      audioUrl={c.audioUrl}
      views={c.views}
    />
  );
}
