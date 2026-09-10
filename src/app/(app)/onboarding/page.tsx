import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listFamilyMembers } from "@/lib/app/queries";
import { OnboardingFlow } from "@/components/app/onboarding-flow";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const next = raw && raw.startsWith("/") ? raw : "/";
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fonboarding");
  const family = await listFamilyMembers(user.id);
  return (
    <OnboardingFlow
      next={next}
      family={family.map((f) => ({ id: f.id, name: f.name, relation: f.relation, gotra: f.gotra }))}
      user={{
        name: user.name,
        gender: user.gender,
        gotra: user.gotra,
        dob: user.dob,
        tob: user.tob,
        birthPlace: user.birthPlace,
        rashi: user.rashi,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
      }}
    />
  );
}
