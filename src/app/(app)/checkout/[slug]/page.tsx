import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceBySlug, listFamilyMembers, serviceAvailableHere } from "@/lib/app/queries";
import { effectiveServiceDate } from "@/lib/utils";
import { CheckoutFlow, type CheckoutService } from "@/components/app/checkout-flow";
import type { AddonData, PackageData } from "@/components/app/package-picker";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/checkout/${slug}`)}`);

  const service = await getServiceBySlug(slug);
  if (!service) notFound();
  const here = await serviceAvailableHere(service);
  if (!here.available) redirect(`/pooja/${slug}`);

  const family = await listFamilyMembers(user.id);
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
  const addonsParam = one(sp.addons);

  return (
    <CheckoutFlow
      service={{ ...service, nextDate: effectiveServiceDate(service) } as unknown as CheckoutService}
      packages={service.packages as PackageData[]}
      addons={service.addons as AddonData[]}
      initialPackage={one(sp.package)}
      initialAddons={addonsParam ? addonsParam.split(",").filter(Boolean) : []}
      panditId={one(sp.pandit)}
      family={family.map((f) => ({ id: f.id, name: f.name, relation: f.relation, gotra: f.gotra }))}
      user={{ name: user.name, gotra: user.gotra, addressLine: user.addressLine, city: user.city, state: user.state, pincode: user.pincode }}
      serviceArea={here.city ? { nameEn: here.city.nameEn, nameHi: here.city.nameHi, stateEn: here.city.stateEn } : null}
    />
  );
}
