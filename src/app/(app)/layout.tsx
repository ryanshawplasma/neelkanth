import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/app/queries";
import { CITY_COOKIE, cityByName, cityBySlug } from "@/lib/app/cities";
import { getLocale } from "@/i18n/server";
import { loc } from "@/lib/utils";
import { AppChrome } from "@/components/app/app-chrome";
import { ServiceWorkerRegistrar } from "@/components/push-register";
import { IntroSplash } from "@/components/app/intro-splash";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [user, jar, locale] = await Promise.all([getCurrentUser(), cookies(), getLocale()]);
  const unread = await getUnreadCount(user?.id);
  const city = cityBySlug(jar.get(CITY_COOKIE)?.value ?? cityByName(user?.city)?.slug);

  return (
    <div className="bg-devotional flex min-h-dvh flex-1 justify-center">
      <div className="relative flex w-full max-w-md flex-col bg-background shadow-[0_0_60px_-20px_rgba(139,30,45,0.35)]">
        <IntroSplash />
        <ServiceWorkerRegistrar />
        <AppChrome city={loc(city, "name", locale)} unread={unread} isLoggedIn={!!user}>
          {children}
        </AppChrome>
      </div>
    </div>
  );
}

/** Vercel: allow slow cold starts + cross-region DB round-trips (default limit is 10s). */
export const maxDuration = 30;
