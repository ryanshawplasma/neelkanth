import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { getKycData } from "@/lib/pandit/queries";
import { PortalHeader } from "@/components/pandit/shell";
import { KycClient } from "@/components/pandit/kyc-client";

export const metadata: Metadata = { title: "KYC" };

export default async function PanditKycPage() {
  const { t } = await getT();
  const { pandit, documents } = await getKycData();

  return (
    <div>
      <PortalHeader title={t("pandit.kycTitle")} subtitle={t("pandit.kycSubtitle")} />
      <KycClient
        kycStatus={pandit.kycStatus}
        kycReviewNote={pandit.kycReviewNote}
        kycSubmittedAt={pandit.kycSubmittedAt ? pandit.kycSubmittedAt.toISOString() : null}
        verified={pandit.verified}
        bank={{
          bankAccountName: pandit.bankAccountName,
          bankAccountNo: pandit.bankAccountNo,
          bankIfsc: pandit.bankIfsc,
          upiId: pandit.upiId,
        }}
        documents={documents.map((d) => ({ id: d.id, type: d.type, fileUrl: d.fileUrl, docNumber: d.docNumber, status: d.status, note: d.note }))}
      />
    </div>
  );
}
