import type { ReactNode } from "react";

/** Minimal full-screen layout for /pandit/login and /pandit/register (no portal shell). */
export default function PanditAuthLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-full flex-col bg-devotional">{children}</div>;
}
