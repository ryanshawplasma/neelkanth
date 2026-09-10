import Link from "next/link";
import { UserRound } from "lucide-react";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { getFavoriteServices, listFamilyMembers } from "@/lib/app/queries";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { AccountView, type AccountUser } from "@/components/app/account-view";
import type { ServiceCardData } from "@/lib/app/types";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { t } = await getT();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="pb-8">
        <div className="flex items-center justify-between px-4 pt-4">
          <h1 className="text-[20px] font-bold tracking-tight">{t("app.accountTitle")}</h1>
          <LanguageSwitch />
        </div>
        <EmptyState
          icon={<UserRound className="h-6 w-6" />}
          title={t("app.guestTitle")}
          hint={t("app.guestHint")}
          action={
            <ButtonLink href="/login?next=%2Faccount" size="lg">
              {t("common.login")}
            </ButtonLink>
          }
        />
        <div className="mt-4 px-4">
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {[
              { href: "/legal/about", label: t("common.about") },
              { href: "/legal/privacy", label: t("common.privacy") },
              { href: "/legal/terms", label: t("common.terms") },
              { href: "/legal/contact", label: t("common.contact") },
              { href: "/pandit/register", label: t("common.joinAsPandit") },
            ].map((r) => (
              <Link key={r.href} href={r.href} className="block px-3.5 py-3 text-[13.5px] font-medium">
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const [family, favorites] = await Promise.all([listFamilyMembers(user.id), getFavoriteServices(user.id)]);

  return (
    <div>
      <div className="px-4 pt-4">
        <h1 className="text-[20px] font-bold tracking-tight">{t("app.accountTitle")}</h1>
      </div>
      <AccountView
        user={
          {
            name: user.name,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            gender: user.gender,
            gotra: user.gotra,
            dob: user.dob,
            tob: user.tob,
            birthPlace: user.birthPlace,
            rashi: user.rashi,
            city: user.city,
            state: user.state,
            pincode: user.pincode,
            addressLine: user.addressLine,
            role: user.role,
          } satisfies AccountUser
        }
        family={family.map((f) => ({ id: f.id, name: f.name, relation: f.relation, gotra: f.gotra, dob: f.dob }))}
        favorites={favorites as ServiceCardData[]}
      />
    </div>
  );
}
