/**
 * Shared (client-safe) types for accounts signed in on a device.
 * Server logic lives in `src/lib/auth.ts`; actions in `src/lib/auth-actions.ts`.
 */
export type AccountRole = "USER" | "PANDIT" | "ADMIN";

/** Where a switcher is shown; decides which "go to" shortcuts make sense. */
export type AccountArea = "app" | "pandit" | "admin";

export type DeviceAccount = {
  id: string;
  /** Person's name, pandit display name, or the phone/email when no name is set. */
  name: string;
  /** Formatted phone number or email. */
  detail: string | null;
  role: AccountRole;
  avatarUrl: string | null;
  hasPanditProfile: boolean;
  /** True for the account the current session belongs to. */
  current: boolean;
};

export const ROLE_LABEL_KEY: Record<AccountRole, string> = {
  USER: "common.roleUser",
  PANDIT: "common.rolePandit",
  ADMIN: "common.roleAdmin",
};

/** "+919876543210" → "+91 98765 43210" (other formats are returned unchanged). */
export function formatPhone(phone: string | null | undefined) {
  if (!phone) return null;
  const m = /^\+91(\d{5})(\d{5})$/.exec(phone);
  return m ? `+91 ${m[1]} ${m[2]}` : phone;
}
