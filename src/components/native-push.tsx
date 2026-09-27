"use client";

import { useEffect } from "react";

/**
 * Notifications inside the DivyaDham phone app (Android and iPhone).
 *
 * The app is this website in a Capacitor shell, and its web view cannot do web
 * push (WKWebView has no Push API at all), so the app asks Firebase for a device
 * token and hands it to /api/push/native. The server then reaches the phone
 * through FCM (lib/fcm.ts). In a normal browser none of this runs: web push in
 * push-register.tsx stays as it was.
 *
 * Rules, the same ones Dino's apps follow:
 * - A phone that already allows notifications registers ITSELF, silently, on
 *   every open (tokens rotate; a stale one is worse than none).
 * - The permission question is asked only when the person taps "Enable
 *   notifications", never on arrival.
 * - Tapping a notification opens the page it is about.
 */

type NativeState = "granted" | "denied" | "prompt" | "unsupported";

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  return cap?.isNativePlatform?.() === true;
}

function platform(): "android" | "ios" {
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  return cap?.getPlatform?.() === "ios" ? "ios" : "android";
}

async function plugin() {
  const { FirebaseMessaging } = await import("@capacitor-firebase/messaging");
  return FirebaseMessaging;
}

/** Where the app stands on notifications, without asking. */
export async function nativeState(): Promise<NativeState> {
  if (!isNativeApp()) return "unsupported";
  try {
    const { receive } = await (await plugin()).checkPermissions();
    return receive === "granted" ? "granted" : receive === "denied" ? "denied" : "prompt";
  } catch {
    return "unsupported";
  }
}

/**
 * Register this phone for notifications. With `ask`, shows the system question
 * if it has not been answered; without it, only registers when already allowed.
 */
export async function registerNative({ ask }: { ask: boolean }): Promise<NativeState> {
  if (!isNativeApp()) return "unsupported";
  try {
    const fm = await plugin();
    let { receive } = await fm.checkPermissions();
    if (receive !== "granted" && ask) ({ receive } = await fm.requestPermissions());
    if (receive !== "granted") return receive === "denied" ? "denied" : "prompt";
    const { token } = await fm.getToken();
    if (token) {
      await fetch("/api/push/native", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, platform: platform() }),
      });
    }
    return "granted";
  } catch {
    return "unsupported";
  }
}

/** Mounted once in the app shell: silent re-registration and notification taps. */
export function NativePushKeeper() {
  useEffect(() => {
    if (!isNativeApp()) return;
    void registerNative({ ask: false });

    let removed = false;
    const handles: Array<{ remove: () => Promise<void> }> = [];
    void (async () => {
      try {
        const fm = await plugin();
        const tapped = await fm.addListener("notificationActionPerformed", (event) => {
          const url = (event.notification?.data as { url?: unknown } | undefined)?.url;
          // Only a path on this site: a notification must not navigate the app
          // somewhere else.
          if (typeof url === "string" && url.startsWith("/") && !url.startsWith("//")) window.location.assign(url);
        });
        const rotated = await fm.addListener("tokenReceived", () => void registerNative({ ask: false }));
        if (removed) {
          void tapped.remove();
          void rotated.remove();
        } else handles.push(tapped, rotated);
      } catch {
        /* the plugin is missing from an old build: nothing to listen to */
      }
    })();
    return () => {
      removed = true;
      for (const h of handles) void h.remove();
    };
  }, []);
  return null;
}
