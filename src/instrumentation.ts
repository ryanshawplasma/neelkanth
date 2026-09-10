/**
 * Dev-friendly scheduler: runs reminders every 30 minutes inside the Next.js server process.
 * In production prefer an external scheduler hitting GET /api/cron/reminders?secret=CRON_SECRET.
 * Set DISABLE_INTERNAL_CRON=1 to turn this off (e.g. when running several dev servers).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.DISABLE_INTERNAL_CRON === "1") return;
  const { runAllReminders } = await import("./lib/reminders");
  const tick = async () => {
    try {
      const r = await runAllReminders();
      const total = r.festival.sent + r.booking.sent + r.campaigns.sent;
      if (total) console.log(`[reminders] sent ${total} notifications`);
    } catch (e) {
      console.error("[reminders] failed", e);
    }
  };
  setTimeout(tick, 20_000);
  setInterval(tick, 30 * 60 * 1000);
}
