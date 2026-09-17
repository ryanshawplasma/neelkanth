import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getLocale } from "@/i18n/server";
import { getDictionary } from "@/i18n";
import { LocaleProvider } from "@/i18n/client";
import { ToastProvider } from "@/components/ui/toast";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "DivyaDham";

/**
 * Fonts are loaded by the browser from Google Fonts (with system fallbacks defined in globals.css)
 * rather than downloaded at build time, so builds work offline / behind strict proxies.
 */
const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: "Book online poojas, offer chadhava at famous temples, consult verified pandits, and follow the daily panchang.",
  manifest: "/manifest.webmanifest",
  applicationName: APP_NAME,
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_NAME },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#f0642a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Android: the on-screen keyboard shrinks the layout, so bottom bars and chat composers stay visible.
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return (
    <html lang={locale} className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_CSS} />
      </head>
      <body className="min-h-full flex flex-col">
        <LocaleProvider locale={locale} dict={dict}>
          <ToastProvider>{children}</ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
