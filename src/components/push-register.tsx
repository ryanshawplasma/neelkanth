"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** Registers the service worker on mount (call once in the app shell). */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      // Dev chunks are not content-hashed, so the cache-first worker would keep serving stale code.
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
      if ("caches" in window) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {});
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}

/**
 * Button that asks for push permission and stores the subscription.
 * Renders nothing when push is unsupported or VAPID key is not configured.
 */
export function EnablePushButton({ className, compact }: { className?: string; compact?: boolean }) {
  const t = useT();
  const [state, setState] = useState<"unknown" | "unsupported" | "prompt" | "granted" | "denied">("unknown");
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window) || !key) return setState("unsupported");
    setState(Notification.permission === "granted" ? "granted" : Notification.permission === "denied" ? "denied" : "prompt");
  }, [key]);

  async function enable() {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return setState(perm === "denied" ? "denied" : "prompt");
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key!) }));
      await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
      setState("granted");
    } catch {
      /* ignore */
    }
  }

  if (state === "unknown" || state === "unsupported" || state === "denied") return null;
  if (state === "granted")
    return compact ? null : (
      <span className={cn("inline-flex items-center gap-1.5 text-xs text-success", className)}>
        <BellRing className="h-3.5 w-3.5" /> {t("common.notificationsEnabled")}
      </span>
    );
  return (
    <button onClick={enable} className={cn("inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary-700", className)}>
      <Bell className="h-3.5 w-3.5" /> {t("common.enableNotifications")}
    </button>
  );
}
