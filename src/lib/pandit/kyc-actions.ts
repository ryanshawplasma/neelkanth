"use server";

import { revalidatePath } from "next/cache";
import type { KycDocType } from "@prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { notifyAdmins, notifyUser } from "@/lib/notify";
import { KYC_DOC_TYPES } from "@/lib/constants";
import { maskDoc } from "@/lib/utils";
import { currentPandit, done, ERR, fail, type Result } from "./guard";
import { DOC_NUMBER_TYPES, IFSC_RE, validateDocNumber } from "./shared";

const DOC_VALUES = new Set(KYC_DOC_TYPES.map((d) => d.value) as readonly string[]);
const REQUIRED_DOCS = KYC_DOC_TYPES.filter((d) => d.required).map((d) => d.value) as readonly string[];

function clean(v?: string | null) {
  const s = (v ?? "").trim();
  return s.length ? s : undefined;
}

/** Upload / replace one KYC document (and its masked number for Aadhaar & PAN). */
export async function saveKycDocAction(input: { type: string; fileUrl: string; docNumber?: string }): Promise<Result> {
  const ctx = await currentPandit();
  if (!ctx) return fail(ERR.auth);
  const { pandit } = ctx;

  if (!DOC_VALUES.has(input.type)) return fail("pandit.errDocType");
  if (!clean(input.fileUrl)) return fail("pandit.errDocFile");

  const existing = await db.kycDocument.findFirst({ where: { panditId: pandit.id, type: input.type as KycDocType } });

  if (pandit.kycStatus === "APPROVED") return fail("pandit.errKycApprovedLocked");
  if (pandit.kycStatus === "SUBMITTED") return fail("pandit.errKycUnderReview");
  if (pandit.kycStatus === "REJECTED" && existing && existing.status === "APPROVED") return fail("pandit.errDocApprovedLocked");

  // Masked document number — the full number is never persisted.
  const kind = DOC_NUMBER_TYPES[input.type];
  let docNumber: string | undefined;
  if (kind) {
    const raw = clean(input.docNumber);
    if (!raw) return fail(kind === "aadhaar" ? "pandit.errAadhaar" : "pandit.errPan");
    const normalised = raw.replace(/[\s-]/g, "").toUpperCase();
    if (!validateDocNumber(kind, normalised)) return fail(kind === "aadhaar" ? "pandit.errAadhaar" : "pandit.errPan");
    docNumber = maskDoc(normalised);
  }

  if (existing) {
    await db.kycDocument.update({
      where: { id: existing.id },
      data: { fileUrl: input.fileUrl.trim(), docNumber: docNumber ?? existing.docNumber, status: "PENDING", note: null },
    });
  } else {
    await db.kycDocument.create({
      data: { panditId: pandit.id, type: input.type as KycDocType, fileUrl: input.fileUrl.trim(), docNumber, status: "PENDING" },
    });
  }

  if (pandit.kycStatus === "NOT_STARTED") {
    await db.panditProfile.update({ where: { id: pandit.id }, data: { kycStatus: "IN_PROGRESS" } });
  }
  await audit(ctx.user.id, "pandit.kyc.doc", "PanditProfile", pandit.id, { type: input.type });
  revalidatePath("/pandit/kyc");
  revalidatePath("/pandit/dashboard");
  return done();
}

/** Remove a not-yet-approved document. */
export async function removeKycDocAction(type: string): Promise<Result> {
  const ctx = await currentPandit();
  if (!ctx) return fail(ERR.auth);
  const { pandit } = ctx;
  if (pandit.kycStatus === "APPROVED" || pandit.kycStatus === "SUBMITTED") return fail("pandit.errKycUnderReview");
  const existing = await db.kycDocument.findFirst({ where: { panditId: pandit.id, type: type as KycDocType } });
  if (!existing) return fail(ERR.notFound);
  if (existing.status === "APPROVED") return fail("pandit.errDocApprovedLocked");
  await db.kycDocument.delete({ where: { id: existing.id } });
  revalidatePath("/pandit/kyc");
  return done();
}

/** Bank / UPI payout details. */
export async function saveBankDetailsAction(input: {
  bankAccountName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  upiId?: string;
}): Promise<Result> {
  const ctx = await currentPandit();
  if (!ctx) return fail(ERR.auth);

  const accountNo = clean(input.bankAccountNo)?.replace(/[\s-]/g, "");
  const ifsc = clean(input.bankIfsc)?.toUpperCase();
  const upi = clean(input.upiId);

  if (accountNo && !/^\d{9,18}$/.test(accountNo)) return fail("pandit.errBankAccount");
  if (ifsc && !IFSC_RE.test(ifsc)) return fail("pandit.errIfsc");
  if (upi && !/^[\w.\-]{2,64}@[a-zA-Z]{2,32}$/.test(upi)) return fail("pandit.errUpi");
  if (accountNo && !ifsc) return fail("pandit.errIfsc");

  await db.panditProfile.update({
    where: { id: ctx.pandit.id },
    data: {
      bankAccountName: clean(input.bankAccountName) ?? null,
      bankAccountNo: accountNo ?? null,
      bankIfsc: ifsc ?? null,
      upiId: upi ?? null,
    },
  });
  await audit(ctx.user.id, "pandit.kyc.bank", "PanditProfile", ctx.pandit.id);
  revalidatePath("/pandit/kyc");
  revalidatePath("/pandit/earnings");
  return done();
}

/** Marks KYC as saved-but-not-submitted so the dashboard shows progress. */
export async function saveKycProgressAction(): Promise<Result> {
  const ctx = await currentPandit();
  if (!ctx) return fail(ERR.auth);
  if (ctx.pandit.kycStatus === "NOT_STARTED") {
    await db.panditProfile.update({ where: { id: ctx.pandit.id }, data: { kycStatus: "IN_PROGRESS" } });
  }
  revalidatePath("/pandit/kyc");
  revalidatePath("/pandit/dashboard");
  return done();
}

/** Send the KYC pack to the admin team for review. */
export async function submitKycAction(): Promise<Result> {
  const ctx = await currentPandit();
  if (!ctx) return fail(ERR.auth);
  const { pandit, user } = ctx;
  if (pandit.kycStatus === "APPROVED") return fail("pandit.errKycApprovedLocked");
  if (pandit.kycStatus === "SUBMITTED") return fail("pandit.errKycUnderReview");

  const docs = await db.kycDocument.findMany({ where: { panditId: pandit.id } });
  const have = new Map(docs.map((d) => [d.type as string, d]));
  for (const type of REQUIRED_DOCS) {
    const doc = have.get(type);
    if (!doc?.fileUrl) return fail("pandit.errMissingDocs");
    if (DOC_NUMBER_TYPES[type] && !doc.docNumber) return fail("pandit.errMissingDocs");
  }

  await db.panditProfile.update({
    where: { id: pandit.id },
    data: { kycStatus: "SUBMITTED", kycSubmittedAt: new Date(), kycReviewNote: null, kycReviewedAt: null },
  });

  await notifyAdmins({
    type: "KYC",
    titleEn: `KYC submitted · ${pandit.displayName}`,
    titleHi: `केवाईसी जमा · ${pandit.displayNameHi || pandit.displayName}`,
    bodyEn: `${pandit.city ?? ""} · ${docs.length} documents awaiting review.`,
    bodyHi: `${pandit.city ?? ""} · ${docs.length} दस्तावेज़ समीक्षा हेतु प्रतीक्षित।`,
    href: `/admin/pandits/${pandit.id}`,
  });
  await notifyUser({
    userId: user.id,
    type: "KYC",
    titleEn: "KYC submitted for review",
    titleHi: "केवाईसी समीक्षा हेतु जमा",
    bodyEn: "Our team usually verifies documents within 24–48 hours.",
    bodyHi: "हमारी टीम आमतौर पर 24–48 घंटों में दस्तावेज़ सत्यापित कर देती है।",
    href: "/pandit/kyc",
  });
  await audit(user.id, "pandit.kyc.submit", "PanditProfile", pandit.id);
  revalidatePath("/pandit", "layout");
  return done();
}
