import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();

async function main() {
  // 1. admin password
  const admin = await db.user.findUnique({ where: { email: "admin@divyadham.app" } });
  if (admin && !admin.passwordHash) {
    await db.user.update({ where: { id: admin.id }, data: { passwordHash: await bcrypt.hash("Admin@123", 10), role: "ADMIN" } });
    console.log("admin password set");
  }

  // 2. pandit awaiting KYC review
  let pending = await db.panditProfile.findFirst({ where: { kycStatus: "SUBMITTED" } });
  if (!pending) {
    const user = await db.user.upsert({
      where: { phone: "+919000000099" },
      create: { phone: "+919000000099", name: "Shastri Devdatt Mishra", role: "PANDIT", city: "Prayagraj", state: "Uttar Pradesh", locale: "hi", onboarded: true },
      update: {},
    });
    pending = await db.panditProfile.create({
      data: {
        userId: user.id,
        displayName: "Shastri Devdatt Mishra",
        displayNameHi: "शास्त्री देवदत्त मिश्र",
        bio: "Karmakandi pandit from Prayagraj with 12 years of experience.",
        bioHi: "प्रयागराज के कर्मकांडी पंडित, 12 वर्ष का अनुभव।",
        classification: "KARMAKANDI",
        specialities: JSON.stringify(["shraddh", "navgrah-shanti", "rudrabhishek"]),
        languages: JSON.stringify(["hi", "sa"]),
        experienceYears: 12,
        city: "Prayagraj",
        state: "Uttar Pradesh",
        kycStatus: "SUBMITTED",
        kycSubmittedAt: new Date(),
        verified: false,
        commissionPct: 20,
        documents: {
          create: [
            { type: "PHOTO", fileUrl: "/images/pandits/placeholder.svg", status: "PENDING" },
            { type: "AADHAAR_FRONT", fileUrl: "/images/pandits/placeholder.svg", docNumber: "123456789012", status: "PENDING" },
            { type: "PAN", fileUrl: "/uploads/kyc/sample.pdf", docNumber: "ABCDE1234F", status: "PENDING" },
          ],
        },
        availability: { create: [{ weekday: 1, startTime: "06:00", endTime: "12:00" }, { weekday: 3, startTime: "07:00", endTime: "11:00" }] },
      },
    });
    console.log("pending-KYC pandit created", pending.id);
  }

  // 3. an unassigned CONFIRMED booking on a requiresPandit service
  const svc = await db.service.findFirst({ where: { requiresPandit: true, active: true } });
  const user = await db.user.findFirst({ where: { role: "USER" } });
  if (svc && user) {
    const existing = await db.booking.findFirst({ where: { code: "DD-ADM-0001" } });
    if (!existing) {
      const b = await db.booking.create({
        data: {
          code: "DD-ADM-0001", userId: user.id, serviceId: svc.id, type: svc.type, status: "CONFIRMED",
          scheduledDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), scheduledSlot: "08:00",
          devotees: JSON.stringify([{ name: user.name ?? "Devotee", gotra: "Kashyap", relation: "self" }]),
          sankalpNote: "Health and peace for the family",
          amountBase: svc.basePrice, amountTotal: svc.basePrice, city: "Varanasi", state: "Uttar Pradesh",
          payment: { create: { provider: "mock", amount: svc.basePrice, status: "PAID", method: "upi" } },
          timeline: { create: [{ status: "CONFIRMED", note: "Payment received", actorRole: "SYSTEM" }] },
        },
      });
      console.log("confirmed unassigned booking", b.code);
    }
    const pend = await db.booking.findFirst({ where: { code: "DD-ADM-0002" } });
    if (!pend) {
      await db.booking.create({
        data: {
          code: "DD-ADM-0002", userId: user.id, serviceId: svc.id, type: svc.type, status: "PENDING_PAYMENT",
          scheduledDate: new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10), scheduledSlot: "10:00",
          devotees: JSON.stringify([{ name: "Ramesh Gupta", gotra: "Bharadwaj" }]),
          amountBase: svc.basePrice, amountTotal: svc.basePrice,
        },
      });
      console.log("pending-payment booking created");
    }
  }

  // 4. consultation + review
  if ((await db.consultation.count()) === 0 && user) {
    await db.consultation.create({ data: { userId: user.id, topic: "kundli", question: "Marriage muhurat guidance", mode: "call", status: "REQUESTED", amount: 499 } });
    console.log("consultation created");
  }
  if ((await db.review.count()) === 0) {
    const done = await db.booking.findFirst({ where: { status: "COMPLETED" } });
    if (done) {
      await db.review.create({ data: { bookingId: done.id, userId: done.userId, serviceId: done.serviceId, panditId: done.panditId, rating: 5, comment: "Beautifully performed, felt truly blessed." } });
      console.log("review created");
    }
  }
  // 5. a jyotishi for consultation assignment
  const jyot = await db.panditProfile.findFirst({ where: { classification: "JYOTISHI" } });
  if (!jyot) {
    const u = await db.user.upsert({ where: { phone: "+919000000098" }, create: { phone: "+919000000098", name: "Jyotishi Anand Tripathi", role: "PANDIT", city: "Ujjain", onboarded: true }, update: {} });
    await db.panditProfile.create({
      data: { userId: u.id, displayName: "Jyotishi Anand Tripathi", displayNameHi: "ज्योतिषी आनंद त्रिपाठी", classification: "JYOTISHI", city: "Ujjain", state: "Madhya Pradesh", kycStatus: "APPROVED", verified: true, ratingAvg: 4.9, ratingCount: 22, experienceYears: 18 },
    });
    console.log("jyotishi created");
  }
  console.log("done");
}
main().finally(() => db.$disconnect());
