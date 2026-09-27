import "server-only";
import { createSign } from "node:crypto";

/**
 * Notifications to the DivyaDham phone apps, through Firebase Cloud Messaging.
 *
 * The browser keeps web push (lib/notify.ts, VAPID). The Android and iPhone
 * apps cannot: an app's web view has no Push API worth the name (WKWebView has
 * none at all), so the app asks Firebase for a device token instead and the
 * server sends through FCM's HTTP v1 API. Firebase delivers to Android
 * directly and to iPhones through APNs, whose key is uploaded to the Firebase
 * project once.
 *
 * Tokens live in the existing PushSubscription table as endpoint `fcm:<token>`,
 * so there is no schema change and nothing to migrate: a deploy is enough.
 *
 * Credential: FIREBASE_SERVICE_ACCOUNT, the service-account JSON from the
 * Firebase project (Project settings → Service accounts → Generate key), as the
 * raw JSON or base64 of it. Without it native sends are skipped, never thrown.
 */

export const NATIVE_PREFIX = "fcm:";

export function isNativeEndpoint(endpoint: string): boolean {
  return endpoint.startsWith(NATIVE_PREFIX);
}

export function nativeEndpoint(token: string): string {
  return NATIVE_PREFIX + token;
}

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

function serviceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) return null;
  try {
    const text = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const sa = JSON.parse(text) as ServiceAccount;
    if (!sa.project_id || !sa.client_email || !sa.private_key) return null;
    return sa;
  } catch {
    return null;
  }
}

let cached: { token: string; expires: number } | null = null;

async function accessToken(sa: ServiceAccount): Promise<string | null> {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;
  cached = { token: json.access_token, expires: Date.now() + (json.expires_in ?? 3600) * 1000 };
  return cached.token;
}

export interface NativeMessage {
  id: string;
  title: string;
  body?: string;
  url: string;
  image?: string;
}

/**
 * One notification to one app install.
 * `gone` means Firebase says the token will never work again (app uninstalled,
 * token rotated): the caller deletes the row, as web push does for 404/410.
 */
export async function sendNative(token: string, message: NativeMessage): Promise<{ ok: boolean; gone: boolean }> {
  const sa = serviceAccount();
  if (!sa) return { ok: false, gone: false };
  const bearer = await accessToken(sa);
  if (!bearer) return { ok: false, gone: false };

  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
    method: "POST",
    headers: { authorization: `Bearer ${bearer}`, "content-type": "application/json" },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: message.title, body: message.body ?? "", ...(message.image ? { image: message.image } : {}) },
        // Read by the app when the notification is tapped: it opens this page.
        data: { url: message.url, id: message.id },
        android: { priority: "high", notification: { sound: "default" } },
        apns: { payload: { aps: { sound: "default" } } },
      },
    }),
  });
  if (res.ok) return { ok: true, gone: false };
  const err = (await res.json().catch(() => null)) as {
    error?: { status?: string; details?: Array<{ errorCode?: string }> };
  } | null;
  const code = err?.error?.details?.find((d) => d.errorCode)?.errorCode ?? err?.error?.status;
  return { ok: false, gone: res.status === 404 || code === "UNREGISTERED" || code === "INVALID_ARGUMENT" };
}
