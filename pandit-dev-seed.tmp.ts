/** Throwaway dev fixtures for the pandit portal (removed once prisma/seed.ts lands). */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function dateKey(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function main() {
  const temple = await db.temple.upsert({
    where: { slug: "kashi-vishwanath" },
    update: {},
    create: {
      slug: "kashi-vishwanath",
      nameEn: "Kashi Vishwanath Temple",
      nameHi: "काशी विश्वनाथ मंदिर",
      deityEn: "Lord Shiva",
      deityHi: "भगवान शिव",
      city: "Varanasi",
      state: "Uttar Pradesh",
      featured: true,
    },
  });

  const svcDefs = [
    { slug: "rudrabhishek-online", type: "ONLINE_POOJA", nameEn: "Rudrabhishek Pooja", nameHi: "रुद्राभिषेक पूजा", price: 1100, tagEn: "Performed at Kashi Vishwanath", tagHi: "काशी विश्वनाथ में सम्पन्न" },
    { slug: "griha-pravesh-home", type: "PANDIT_AT_HOME", nameEn: "Griha Pravesh Pooja", nameHi: "गृह प्रवेश पूजा", price: 4500, tagEn: "Pandit ji visits your home", tagHi: "पंडित जी आपके घर आएँगे" },
    { slug: "satyanarayan-katha", type: "KATHA", nameEn: "Satyanarayan Katha", nameHi: "सत्यनारायण कथा", price: 2500, tagEn: "Full katha with havan", tagHi: "हवन सहित पूर्ण कथा" },
    { slug: "kundli-reading", type: "ASTROLOGY", nameEn: "Kundli Analysis", nameHi: "कुंडली विश्लेषण", price: 700, tagEn: "45-minute consultation", tagHi: "45 मिनट का परामर्श" },
  ] as const;

  const services = [];
  for (const [i, s] of svcDefs.entries()) {
    services.push(
      await db.service.upsert({
        where: { slug: s.slug },
        update: {},
        create: {
          slug: s.slug,
          type: s.type,
          nameEn: s.nameEn,
          nameHi: s.nameHi,
          taglineEn: s.tagEn,
          taglineHi: s.tagHi,
          basePrice: s.price,
          durationMin: 60,
          templeId: s.type === "ONLINE_POOJA" ? temple.id : null,
          requiresPandit: true,
          sortOrder: i,
          slots: JSON.stringify(["06:00", "08:00", "10:00"]),
        },
      }),
    );
  }

  await db.user.upsert({
    where: { email: "admin@divyadham.app" },
    update: {},
    create: { email: "admin@divyadham.app", name: "Admin", role: "ADMIN", onboarded: true },
  });

  const user = await db.user.upsert({
    where: { phone: "+919000000001" },
    update: { role: "PANDIT" },
    create: { phone: "+919000000001", name: "Pandit Ramesh Sharma", role: "PANDIT", onboarded: true, city: "Varanasi", state: "Uttar Pradesh" },
  });

  const pandit = await db.panditProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      displayName: "Pandit Ramesh Sharma",
      displayNameHi: "पंडित रमेश शर्मा",
      bio: "Third-generation purohit from Kashi, performing vedic rituals for 18 years.",
      bioHi: "काशी के तीसरी पीढ़ी के पुरोहित, 18 वर्षों से वैदिक अनुष्ठान कराते आ रहे हैं।",
      classification: "PUROHIT",
      specialities: JSON.stringify(["rudrabhishek", "griha-pravesh", "satyanarayan"]),
      languages: JSON.stringify(["hi", "sa", "en"]),
      experienceYears: 18,
      sampradaya: "shaiva",
      education: "Acharya (Sanskrit)",
      gotra: "Kashyap",
      city: "Varanasi",
      state: "Uttar Pradesh",
      pincode: "221001",
      servesOnline: true,
      servesAtHome: true,
      servesAtTemple: true,
      templeId: temple.id,
      kycStatus: "APPROVED",
      kycSubmittedAt: new Date(Date.now() - 6 * 86400000),
      kycReviewedAt: new Date(Date.now() - 5 * 86400000),
      verified: true,
      isActive: true,
      commissionPct: 20,
      ratingAvg: 4.8,
      ratingCount: 42,
      completedCount: 61,
      bankAccountName: "Ramesh Sharma",
      bankAccountNo: "312045678901",
      bankIfsc: "SBIN0001234",
      upiId: "ramesh@upi",
    },
  });

  for (const s of services) {
    await db.panditService.upsert({
      where: { panditId_serviceId: { panditId: pandit.id, serviceId: s.id } },
      update: {},
      create: { panditId: pandit.id, serviceId: s.id, active: true },
    });
  }

  const devotee = await db.user.upsert({
    where: { phone: "+919812345678" },
    update: {},
    create: { phone: "+919812345678", name: "Anil Gupta", onboarded: true, city: "Delhi", state: "Delhi" },
  });

  const bookingDefs = [
    { code: "DD-DEV-0001", svc: 0, status: "ASSIGNED", date: dateKey(0), slot: "08:00" },
    { code: "DD-DEV-0002", svc: 1, status: "ASSIGNED", date: dateKey(3), slot: "10:00" },
    { code: "DD-DEV-0003", svc: 2, status: "CONFIRMED", date: dateKey(6), slot: "06:00" },
    { code: "DD-DEV-0004", svc: 0, status: "COMPLETED", date: dateKey(-8), slot: "08:00" },
    { code: "DD-DEV-0005", svc: 3, status: "CANCELLED", date: dateKey(-15), slot: "10:00" },
  ] as const;

  for (const b of bookingDefs) {
    const svc = services[b.svc];
    const atHome = svc.type === "PANDIT_AT_HOME";
    const existing = await db.booking.findUnique({ where: { code: b.code } });
    if (existing) continue;
    const created = await db.booking.create({
      data: {
        code: b.code,
        userId: devotee.id,
        serviceId: svc.id,
        panditId: pandit.id,
        templeId: svc.templeId,
        type: svc.type,
        status: b.status,
        scheduledDate: b.date,
        scheduledSlot: b.slot,
        devotees: JSON.stringify([
          { name: "Anil Gupta", gotra: "Bharadwaj", relation: "self" },
          { name: "Sunita Gupta", gotra: "Bharadwaj", relation: "spouse" },
        ]),
        sankalpNote: "Family health and prosperity",
        addons: JSON.stringify([{ slug: "prasad", name: "Prasad delivery", price: 251 }]),
        addressLine: atHome ? "B-14, Rajouri Garden" : null,
        city: atHome ? "Delhi" : "Varanasi",
        state: atHome ? "Delhi" : "Uttar Pradesh",
        pincode: atHome ? "110027" : "221001",
        amountBase: svc.basePrice,
        amountAddons: 251,
        amountTotal: svc.basePrice + 251,
        completedAt: b.status === "COMPLETED" ? new Date(Date.now() - 8 * 86400000) : null,
        videoUrl: b.status === "COMPLETED" ? "https://youtu.be/dQw4w9WgXcQ" : null,
      },
    });
    await db.bookingEvent.create({ data: { bookingId: created.id, status: "CONFIRMED", note: "Payment received", actorRole: "SYSTEM" } });
    await db.payment.create({ data: { bookingId: created.id, amount: created.amountTotal, status: "PAID", provider: "mock", method: "upi" } });
  }

  await db.notification.upsert({
    where: { userId_dedupeKey: { userId: user.id, dedupeKey: "dev-welcome" } },
    update: {},
    create: {
      userId: user.id,
      type: "SYSTEM",
      titleEn: "Welcome to the Pandit Portal",
      titleHi: "पंडित पोर्टल में स्वागत है",
      bodyEn: "Keep your availability updated to receive more bookings.",
      bodyHi: "अधिक बुकिंग पाने के लिए अपनी उपलब्धता अद्यतन रखें।",
      href: "/pandit/availability",
      dedupeKey: "dev-welcome",
    },
  });

  await db.payout.create({ data: { panditId: pandit.id, amount: 4200, status: "PAID", reference: "PYT-2401", paidAt: new Date(Date.now() - 20 * 86400000) } }).catch(() => {});

  console.log("dev fixtures ready · pandit +919000000001");
}

main().finally(() => db.$disconnect());
