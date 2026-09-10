import "server-only";
import { runAllReminders } from "./reminders";

let started = false;

/** Starts the in-process reminder loop (dev convenience). Idempotent. */
export function startReminderScheduler() {
  if (started) return;
  started = true;
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
