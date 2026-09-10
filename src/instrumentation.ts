/**
 * Dev-friendly scheduler: runs reminders every 30 minutes inside the Next.js server process.
 * In production prefer an external scheduler hitting GET /api/cron/reminders?secret=CRON_SECRET.
 * Set DISABLE_INTERNAL_CRON=1 to turn this off (e.g. when running several dev servers).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.DISABLE_INTERNAL_CRON === "1") return;
    const { startReminderScheduler } = await import("./lib/reminder-scheduler");
    startReminderScheduler();
  }
}
