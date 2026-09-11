/**
 * In-process scheduler for long-running Node hosts (local dev, VPS, Docker): runs reminders every
 * 30 minutes. Serverless platforms (Vercel) get nothing here — vercel.json's cron calls
 * GET /api/cron/reminders instead. Set DISABLE_INTERNAL_CRON=1 to turn this off manually.
 *
 * Keep the import inside the NEXT_RUNTIME check: webpack replaces that constant per runtime and
 * drops the whole block from the edge bundle, which cannot load web-push's Node dependencies.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.DISABLE_INTERNAL_CRON === "1" || process.env.VERCEL) return;
    const { startReminderScheduler } = await import("./lib/reminder-scheduler");
    startReminderScheduler();
  }
}
