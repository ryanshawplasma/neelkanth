/**
 * Rules for the admin console's password, shared by the change-password action, its form and the
 * seed. No imports, so the seed script and client components can both use it.
 *
 * The live console was seeded with PUBLISHED_ADMIN_PASSWORD: the README printed it as the local
 * login, and the same value went into the hosted environment. The repository is public, so that
 * was the console's password for anyone who read it.
 */

/** The password the README and .env.example publish for local development. */
export const PUBLISHED_ADMIN_PASSWORD = "Admin@123";

export const MIN_ADMIN_PASSWORD_LENGTH = 12;

export type AdminPasswordProblem = "errPasswordShort" | "errPasswordPublished" | "errPasswordSame";

/** Why `next` cannot be the admin password, or null when it can. */
export function adminPasswordProblem(next: string, current?: string): AdminPasswordProblem | null {
  if (next.length < MIN_ADMIN_PASSWORD_LENGTH) return "errPasswordShort";
  if (next.trim().toLowerCase() === PUBLISHED_ADMIN_PASSWORD.toLowerCase()) return "errPasswordPublished";
  if (current !== undefined && next === current) return "errPasswordSame";
  return null;
}
