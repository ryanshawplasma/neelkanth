import "server-only";
import { db } from "./db";
import { notifyUser } from "./notify";
import { addDays, daysUntil, parseJson, rollForwardWeekly, toDateKey, formatDate } from "./utils";

/**
 * Festival reminders — "push near-date things".
 * For each active festival with pushEnabled, when today == festival.date - offset for any offset
 * in remindDaysBefore, every onboarded (non-blocked) user gets one notification, deduped by
 * `festival:<slug>:<offset>:<date>`. Linked services are surfaced in the body/href.
 */
export async function runFestivalReminders(now = new Date()) {
  const today = toDateKey(now);
  const horizon = toDateKey(addDays(now, 30));
  const festivals = await db.festival.findMany({
    where: { active: true, pushEnabled: true, date: { gte: today, lte: horizon } },
    include: { services: { where: { active: true }, take: 3, orderBy: { featured: "desc" } } },
  });
  if (!festivals.length) return { sent: 0, festivals: 0 };

  const users = await db.user.findMany({ where: { isBlocked: false, role: { in: ["USER", "PANDIT"] } }, select: { id: true } });
  let sent = 0;
  for (const f of festivals) {
    const offsets = parseJson<number[]>(f.remindDaysBefore, [7, 3, 1, 0]);
    const d = daysUntil(f.date, now);
    if (!offsets.includes(d)) continue;

    const svc = f.services[0];
    const when = d === 0 ? { en: "is today", hi: "आज है" } : d === 1 ? { en: "is tomorrow", hi: "कल है" } : { en: `is in ${d} days`, hi: `${d} दिन बाद है` };
    const titleEn = `${f.nameEn} ${when.en} 🪔`;
    const titleHi = `${f.nameHi} ${when.hi} 🪔`;
    const bodyEn = svc ? `Book ${svc.nameEn} in advance for ${formatDate(f.date, "en")}.` : `${formatDate(f.date, "en")} · ${f.descriptionEn ?? ""}`.trim();
    const bodyHi = svc ? `${formatDate(f.date, "hi")} के लिए ${svc.nameHi} पहले से बुक करें।` : `${formatDate(f.date, "hi")} · ${f.descriptionHi ?? ""}`.trim();
    const href = svc ? `/pooja/${svc.slug}` : `/festivals/${f.slug}`;

    for (const u of users) {
      const r = await notifyUser({
        userId: u.id,
        type: "FESTIVAL_REMINDER",
        titleEn,
        titleHi,
        bodyEn,
        bodyHi,
        href,
        imageUrl: f.imageUrl ?? undefined,
        dedupeKey: `festival:${f.slug}:${d}:${f.date}`,
      });
      if (r.created) sent++;
    }
  }
  return { sent, festivals: festivals.length };
}

/** Booking reminders: 1 day before and on the day (07:00 local is when the cron typically runs). */
export async function runBookingReminders(now = new Date()) {
  const today = toDateKey(now);
  const tomorrow = toDateKey(addDays(now, 1));
  const bookings = await db.booking.findMany({
    where: { status: { in: ["CONFIRMED", "ASSIGNED"] }, scheduledDate: { in: [today, tomorrow] } },
    include: { service: true, pandit: true },
  });
  let sent = 0;
  for (const b of bookings) {
    const isToday = b.scheduledDate === today;
    const r = await notifyUser({
      userId: b.userId,
      type: "BOOKING_UPDATE",
      titleEn: isToday ? `Today: ${b.service.nameEn}` : `Tomorrow: ${b.service.nameEn}`,
      titleHi: isToday ? `आज: ${b.service.nameHi}` : `कल: ${b.service.nameHi}`,
      bodyEn: `${b.scheduledSlot ? "At " + b.scheduledSlot + ". " : ""}Keep your sankalp ready. Booking ${b.code}.`,
      bodyHi: `${b.scheduledSlot ? b.scheduledSlot + " बजे। " : ""}अपना संकल्प तैयार रखें। बुकिंग ${b.code}।`,
      href: `/bookings/${b.id}`,
      dedupeKey: `booking:${b.id}:${isToday ? "day" : "eve"}`,
    });
    if (r.created) sent++;
    if (b.pandit) {
      const rp = await notifyUser({
        userId: b.pandit.userId,
        type: "BOOKING_UPDATE",
        titleEn: isToday ? `Today: ${b.service.nameEn} · ${b.code}` : `Tomorrow: ${b.service.nameEn} · ${b.code}`,
        titleHi: isToday ? `आज: ${b.service.nameHi} · ${b.code}` : `कल: ${b.service.nameHi} · ${b.code}`,
        bodyEn: b.scheduledSlot ? `Slot ${b.scheduledSlot}` : undefined,
        bodyHi: b.scheduledSlot ? `समय ${b.scheduledSlot}` : undefined,
        href: `/pandit/bookings/${b.id}`,
        dedupeKey: `booking:${b.id}:${isToday ? "day" : "eve"}:pandit`,
      });
      if (rp.created) sent++;
    }
  }
  return { sent, bookings: bookings.length };
}

/** Sends scheduled admin campaigns whose time has come. */
export async function runScheduledCampaigns(now = new Date()) {
  const due = await db.campaign.findMany({ where: { status: "SCHEDULED", scheduledAt: { lte: now } } });
  let total = 0;
  for (const c of due) {
    const where: Record<string, unknown> = { isBlocked: false };
    if (c.audience === "USERS") where.role = "USER";
    else if (c.audience === "PANDITS") where.role = "PANDIT";
    else if (c.audience === "ONBOARDED") where.onboarded = true;
    else if (c.audience.startsWith("CITY:")) where.city = c.audience.slice(5);
    const users = await db.user.findMany({ where, select: { id: true } });
    let sent = 0;
    for (const u of users) {
      const r = await notifyUser({
        userId: u.id,
        type: "PROMO",
        titleEn: c.titleEn,
        titleHi: c.titleHi,
        bodyEn: c.bodyEn ?? undefined,
        bodyHi: c.bodyHi ?? undefined,
        href: c.href ?? undefined,
        imageUrl: c.imageUrl ?? undefined,
        dedupeKey: `campaign:${c.id}`,
      });
      if (r.created) sent++;
    }
    await db.campaign.update({ where: { id: c.id }, data: { status: "SENT", sentAt: now, sentCount: sent } });
    total += sent;
  }
  return { campaigns: due.length, sent: total };
}

/**
 * Weekly services store their next performance date. Once it passes, move it forward in whole
 * weeks (keeping the weekday) so listings stay current and fixed-date offerings (chadhava, prasad)
 * never ask to be booked in the past. Festival-linked services keep their date: that occasion is over.
 */
export async function rollServiceDates(now = new Date()) {
  const today = toDateKey(now);
  const stale = await db.service.findMany({ where: { nextDate: { lt: today }, festivalId: null }, select: { id: true, nextDate: true } });
  for (const s of stale) await db.service.update({ where: { id: s.id }, data: { nextDate: rollForwardWeekly(s.nextDate, today) } });
  return { rolled: stale.length };
}

export async function runAllReminders(now = new Date()) {
  const [festival, booking, campaigns, serviceDates] = await Promise.all([
    runFestivalReminders(now),
    runBookingReminders(now),
    runScheduledCampaigns(now),
    rollServiceDates(now),
  ]);
  return { festival, booking, campaigns, serviceDates, ranAt: now.toISOString() };
}
