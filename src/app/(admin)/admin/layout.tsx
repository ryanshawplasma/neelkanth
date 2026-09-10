import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin Console", template: "%s · Admin · DivyaDham" },
  robots: { index: false, follow: false },
};

/**
 * Root of the /admin URL space. The console chrome (sidebar + top bar) lives in
 * the `(console)` route group so `/admin/login` — inside `(auth)` — can render
 * with its own minimal layout.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-background text-foreground">{children}</div>;
}
