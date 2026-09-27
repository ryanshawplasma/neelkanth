/**
 * Set the password of the admin console's email login from a terminal: the way back in when nobody
 * can sign in there (the console's own form asks for the current password), and the way to create
 * that admin on a hosted database, which the seed refuses to do with the published password.
 *
 *   npm run admin:password                         # the admin in ADMIN_EMAIL (or admin@divyadham.app)
 *   npm run admin:password -- someone@example.com  # another admin
 *
 * Works on the database in DATABASE_URL. The password is typed at a hidden prompt, twice, and is
 * never printed. Every session made with the old password ends (see passwordFingerprint).
 * Set PRISMA_CLIENT_PATH to use a Prisma client generated for another provider (e.g. Postgres
 * when the project's own client is generated for SQLite).
 */
import { createInterface } from "node:readline";
import bcrypt from "bcryptjs";
import { MIN_ADMIN_PASSWORD_LENGTH, adminPasswordProblem } from "@/lib/admin-password";

const MESSAGES = {
  errPasswordShort: `Use at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`,
  errPasswordPublished: "That is the password the README publishes. Choose another.",
  errPasswordSame: "That is the current password.",
};

/**
 * One prompt reader for the whole run. Nothing typed is echoed: readline echoes through
 * _writeToOutput, which is silenced, and the questions are written directly. Lines are read
 * through the async iterator taken at the start, which buffers them: rl.question() lost piped
 * input that arrived while the database was still being asked ("readline was closed").
 */
function hiddenPrompt() {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: !!process.stdin.isTTY });
  (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = () => {};
  const lines = rl[Symbol.asyncIterator]();
  return {
    ask: async (q: string) => {
      process.stdout.write(q);
      const { value, done } = await lines.next();
      process.stdout.write("\n");
      if (done) throw new Error("No input; nothing changed.");
      return String(value);
    },
    close: () => rl.close(),
  };
}

async function main() {
  const email = (process.argv[2] || process.env.ADMIN_EMAIL || "admin@divyadham.app").trim().toLowerCase();
  const clientPath = process.env.PRISMA_CLIENT_PATH;
  const mod = (clientPath ? await import(clientPath) : await import("@prisma/client")) as typeof import("@prisma/client");
  const db = new mod.PrismaClient();
  const prompt = hiddenPrompt();

  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (user && user.role !== "ADMIN") throw new Error(`${email} exists but is not an admin; nothing changed.`);
    console.log(user ? `New password for ${email}` : `${email} does not exist yet: it will be created as an admin.`);

    const next = await prompt.ask("New password: ");
    const problem = adminPasswordProblem(next);
    if (problem) throw new Error(`${MESSAGES[problem]} Nothing changed.`);
    if ((await prompt.ask("Again: ")) !== next) throw new Error("The two passwords do not match; nothing changed.");

    const passwordHash = await bcrypt.hash(next, 12);
    if (user) await db.user.update({ where: { id: user.id }, data: { passwordHash } });
    else await db.user.create({ data: { email, passwordHash, name: "Admin", role: "ADMIN", onboarded: true, locale: "en" } });
    await db.auditLog.create({
      data: { actorId: null, action: "auth.admin_password_set", entity: "User", entityId: user?.id ?? null, meta: JSON.stringify({ email, via: "terminal" }) },
    });
    console.log(user ? "Password changed. Every session made with the old one has ended." : "Admin created.");
  } finally {
    prompt.close();
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
