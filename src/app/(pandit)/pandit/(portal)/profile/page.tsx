import type { Metadata } from "next";
import { getT } from "@/i18n/server";
import { getProfileData } from "@/lib/pandit/queries";
import { parseJson } from "@/lib/utils";
import { PortalHeader } from "@/components/pandit/shell";
import { PanditProfileForm } from "@/components/pandit/profile-form";
import type { ProfileForm } from "@/components/pandit/profile-fields";

export const metadata: Metadata = { title: "My Profile" };

export default async function PanditProfilePage() {
  const { t } = await getT();
  const { user, pandit, temples } = await getProfileData();

  const initial: ProfileForm = {
    displayName: pandit.displayName,
    displayNameHi: pandit.displayNameHi ?? "",
    gender: user.gender ?? "male",
    photoUrl: pandit.photoUrl,
    classification: pandit.classification,
    specialities: parseJson<string[]>(pandit.specialities, []),
    languages: parseJson<string[]>(pandit.languages, ["hi"]),
    experienceYears: pandit.experienceYears,
    sampradaya: pandit.sampradaya ?? "",
    education: pandit.education ?? "",
    gotra: pandit.gotra ?? "",
    city: pandit.city ?? "",
    state: pandit.state ?? "",
    pincode: pandit.pincode ?? "",
    serviceRadiusKm: pandit.serviceRadiusKm,
    servesOnline: pandit.servesOnline,
    servesAtHome: pandit.servesAtHome,
    servesAtTemple: pandit.servesAtTemple,
    templeId: pandit.templeId,
    bio: pandit.bio ?? "",
    bioHi: pandit.bioHi ?? "",
  };

  return (
    <div>
      <PortalHeader title={t("pandit.profileTitle")} subtitle={t("pandit.profileSubtitle")} />
      <PanditProfileForm initial={initial} temples={temples} panditId={pandit.id} isActive={pandit.isActive} />
    </div>
  );
}
