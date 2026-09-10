import type { Metadata, Viewport } from "next";
import { Poppins, Noto_Sans_Devanagari, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/i18n/server";
import { getDictionary } from "@/i18n";
import { LocaleProvider } from "@/i18n/client";
import { ToastProvider } from "@/components/ui/toast";

const sans = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "DivyaDham";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: "Book online poojas, offer chadhava at famous temples, consult verified pandits, and follow the daily panchang.",
  manifest: "/manifest.webmanifest",
  applicationName: APP_NAME,
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_NAME },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#f0642a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return (
    <html lang={locale} className={`${sans.variable} ${devanagari.variable} ${display.variable} h-full antialiased`}>
      <body className={`min-h-full flex flex-col ${locale === "hi" ? "font-[var(--font-devanagari)]" : ""}`}>
        <LocaleProvider locale={locale} dict={dict}>
          <ToastProvider>{children}</ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
