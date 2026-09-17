"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-renders the current server page every `ms` while the tab is visible (and when it becomes visible). */
export function AutoRefresh({ ms = 15_000 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    let timer: number | undefined;
    const loop = () => {
      timer = window.setTimeout(() => {
        if (!document.hidden) router.refresh();
        loop();
      }, ms);
    };
    const onVisible = () => {
      if (!document.hidden) router.refresh();
    };
    loop();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, ms]);
  return null;
}
