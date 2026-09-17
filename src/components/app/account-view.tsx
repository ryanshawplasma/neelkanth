"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeftRight, Bell, ChevronRight, FileText, Heart, LayoutDashboard, LogOut, MessageCircle, Pencil, Plus, ShieldCheck, Trash2, UserCog, Users } from "lucide-react";
import { useLocale, useT } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { Avatar, EmptyState } from "@/components/ui/misc";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useToast } from "@/components/ui/toast";
import { EnablePushButton } from "@/components/push-register";
import { GOTRAS, INDIAN_STATES, RASHIS, pickBi } from "@/lib/constants";
import { actionErrorKey } from "@/lib/app/helpers";
import {
  addFamilyMemberAction,
  deleteFamilyMemberAction,
  updateFamilyMemberAction,
  updateProfileAction,
} from "@/lib/app/account-actions";
import { logoutAction } from "@/lib/auth-actions";
import { SwitchAccountTrigger, type SwitcherCurrent } from "@/components/accounts/account-switcher";
import { Scroller, ServiceCard } from "./cards";
import type { ServiceCardData } from "@/lib/app/types";

export type AccountUser = {
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  gender: string | null;
  gotra: string | null;
  dob: string | null;
  tob: string | null;
  birthPlace: string | null;
  rashi: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  addressLine: string | null;
  role: string;
};

type FamilyRow = { id: string; name: string; relation: string | null; gotra: string | null; dob: string | null };

const RELATIONS = ["self", "spouse", "father", "mother", "son", "daughter", "brother", "sister"];

export function AccountView({
  user,
  account,
  supportUnread = 0,
  family: initialFamily,
  favorites,
}: {
  user: AccountUser;
  /** Signed-in account, for the account switcher. */
  account: SwitcherCurrent;
  /** Unread replies from the support team. */
  supportUnread?: number;
  family: FamilyRow[];
  favorites: ServiceCardData[];
}) {
  const t = useT();
  const locale = useLocale();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name ?? "",
    gender: user.gender ?? "",
    gotra: user.gotra ?? "Kashyap",
    dob: user.dob ?? "",
    tob: user.tob ?? "",
    birthPlace: user.birthPlace ?? "",
    rashi: user.rashi ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    pincode: user.pincode ?? "",
    addressLine: user.addressLine ?? "",
  });

  const [family, setFamily] = useState(initialFamily);
  const [memberOpen, setMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyRow | null>(null);
  const [member, setMember] = useState({ name: "", relation: "spouse", gotra: "Kashyap", dob: "" });
  const [logoutOpen, setLogoutOpen] = useState(false);

  function openMember(row?: FamilyRow) {
    setEditingMember(row ?? null);
    setMember({ name: row?.name ?? "", relation: row?.relation ?? "spouse", gotra: row?.gotra ?? user.gotra ?? "Kashyap", dob: row?.dob ?? "" });
    setMemberOpen(true);
  }

  function saveMember() {
    if (member.name.trim().length < 2) return;
    start(async () => {
      if (editingMember) {
        const res = await updateFamilyMemberAction(editingMember.id, member);
        if (!res.ok) return toast(t(actionErrorKey(res.error)), "error");
        setFamily((xs) => xs.map((x) => (x.id === editingMember.id ? { ...x, ...member } : x)));
      } else {
        const res = await addFamilyMemberAction(member);
        if (!res.ok) return toast(t(actionErrorKey(res.error)), "error");
        setFamily((xs) => [...xs, { id: res.data!.id, ...member }]);
      }
      setMemberOpen(false);
      toast(t("common.saved"));
    });
  }

  return (
    <div className="pb-8">
      {/* profile */}
      <section className="px-4 pt-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow)]">
          <Avatar src={user.avatarUrl} name={user.name} size={56} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-bold leading-tight">{user.name ?? t("app.welcome")}</p>
            <p className="truncate text-[12.5px] text-muted">{user.phone}</p>
            {user.gotra && (
              <p className="truncate text-[11.5px] text-muted">
                {t("common.gotra")}: {user.gotra}
              </p>
            )}
          </div>
          <button onClick={() => setEditing(true)} aria-label={t("app.editProfile")} className="rounded-full p-2 text-primary hover:bg-primary-soft">
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* quick links */}
      <section className="mt-4 px-4">
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {user.role === "ADMIN" && <RowLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label={t("common.adminConsole")} />}
          <RowLink href="/bookings" icon={<FileText className="h-4 w-4" />} label={t("common.bookings")} />
          <RowLink href="/notifications" icon={<Bell className="h-4 w-4" />} label={t("common.notifications")} />
          <RowLink href="/support" icon={<MessageCircle className="h-4 w-4" />} label={t("app.helpSupport")} badge={supportUnread} />
          <RowLink href={user.role === "PANDIT" || user.role === "ADMIN" ? "/pandit/dashboard" : "/pandit/register"} icon={<ShieldCheck className="h-4 w-4" />} label={user.role === "PANDIT" || user.role === "ADMIN" ? t("common.panditPortal") : t("common.joinAsPandit")} />
          <SwitchAccountTrigger area="app" current={account} className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
            <span className="text-muted">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <span className="flex-1 text-[13.5px] font-medium">{t("common.switchAccount")}</span>
            <ChevronRight className="h-4 w-4 text-muted" />
          </SwitchAccountTrigger>
        </div>
      </section>

      {/* family */}
      <section className="mt-5 px-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-[16px] font-bold tracking-tight">
            <Users className="h-4 w-4 text-primary" /> {t("app.myFamily")}
          </h2>
          <button onClick={() => openMember()} className="flex items-center gap-1 text-[12.5px] font-semibold text-primary">
            <Plus className="h-3.5 w-3.5" /> {t("app.addMember")}
          </button>
        </div>
        {family.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-4 text-center text-[12.5px] text-muted">{t("app.noFamilyHint")}</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {family.map((f) => (
              <li key={f.id} className="flex items-center gap-2 px-3.5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold">{f.name}</p>
                  <p className="truncate text-[11.5px] text-muted">
                    {f.relation ? t(`common.${f.relation}`) : ""}
                    {f.gotra ? ` · ${f.gotra}` : ""}
                  </p>
                </div>
                <button onClick={() => openMember(f)} aria-label={t("common.edit")} className="rounded-full p-2 text-muted hover:bg-surface-2">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() =>
                    start(async () => {
                      await deleteFamilyMemberAction(f.id);
                      setFamily((xs) => xs.filter((x) => x.id !== f.id));
                    })
                  }
                  aria-label={t("common.delete")}
                  className="rounded-full p-2 text-danger hover:bg-danger-soft"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* favourites */}
      <section className="mt-6">
        <h2 className="mb-2 flex items-center gap-1.5 px-4 text-[16px] font-bold tracking-tight">
          <Heart className="h-4 w-4 text-danger" /> {t("app.favorites")}
        </h2>
        {favorites.length === 0 ? (
          <EmptyState className="py-8" icon={<Heart className="h-5 w-5" />} title={t("app.noFavorites")} hint={t("app.noFavoritesHint")} />
        ) : (
          <Scroller>
            {favorites.map((s) => (
              <ServiceCard key={s.id} s={s} favorited />
            ))}
          </Scroller>
        )}
      </section>

      {/* settings */}
      <section className="mt-6 px-4">
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-3 px-3.5 py-3">
            <span className="text-muted">
              <UserCog className="h-4 w-4" />
            </span>
            <span className="flex-1 text-[13.5px] font-medium">{t("app.appLanguage")}</span>
            <LanguageSwitch />
          </div>
          <div className="flex items-center gap-3 px-3.5 py-3">
            <span className="text-muted">
              <Bell className="h-4 w-4" />
            </span>
            <span className="flex-1 text-[13.5px] font-medium">{t("app.notificationSettings")}</span>
            <EnablePushButton />
          </div>
        </div>
      </section>

      {/* legal */}
      <section className="mt-5 px-4">
        <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-muted">{t("app.legalSection")}</h2>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          <RowLink href="/legal/about" label={t("common.about")} />
          <RowLink href="/legal/privacy" label={t("common.privacy")} />
          <RowLink href="/legal/terms" label={t("common.terms")} />
          <RowLink href="/legal/contact" label={t("common.contact")} />
        </div>
      </section>

      <section className="mt-5 px-4">
        <button
          onClick={() => setLogoutOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/40 py-3 text-[14px] font-semibold text-danger"
        >
          <LogOut className="h-4 w-4" /> {t("common.logout")}
        </button>
      </section>

      {/* edit profile sheet */}
      <Sheet open={editing} onClose={() => setEditing(false)} title={t("app.editProfile")}>
        <div className="space-y-3">
          <Field label={t("common.name")} required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("common.gender")}>
              <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">—</option>
                <option value="male">{t("common.male")}</option>
                <option value="female">{t("common.female")}</option>
                <option value="other">{t("common.other")}</option>
              </Select>
            </Field>
            <Field label={t("common.gotra")}>
              <Select value={form.gotra} onChange={(e) => setForm({ ...form, gotra: e.target.value })}>
                {GOTRAS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("common.dob")}>
              <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </Field>
            <Field label={t("common.tob")}>
              <Input type="time" value={form.tob} onChange={(e) => setForm({ ...form, tob: e.target.value })} />
            </Field>
          </div>
          <Field label={t("common.birthPlace")}>
            <Input value={form.birthPlace} onChange={(e) => setForm({ ...form, birthPlace: e.target.value })} />
          </Field>
          <Field label={t("common.rashi")}>
            <Select value={form.rashi} onChange={(e) => setForm({ ...form, rashi: e.target.value })}>
              <option value="">—</option>
              {RASHIS.map((r) => (
                <option key={r.value} value={r.value}>
                  {pickBi(r.label, locale)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("common.address")}>
            <Input value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("common.city")}>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </Field>
            <Field label={t("common.pincode")}>
              <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" />
            </Field>
          </div>
          <Field label={t("common.state")}>
            <Select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
              <option value="">—</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            full
            size="lg"
            loading={pending}
            onClick={() =>
              start(async () => {
                const res = await updateProfileAction(form);
                if (res.ok) {
                  toast(t("app.profileUpdated"));
                  setEditing(false);
                } else toast(t(actionErrorKey(res.error)), "error");
              })
            }
          >
            {t("common.save")}
          </Button>
        </div>
      </Sheet>

      {/* family member sheet */}
      <Sheet open={memberOpen} onClose={() => setMemberOpen(false)} title={editingMember ? t("app.editMember") : t("app.addMember")}>
        <div className="space-y-3">
          <Field label={t("common.name")} required>
            <Input value={member.name} onChange={(e) => setMember({ ...member, name: e.target.value })} />
          </Field>
          <Field label={t("common.relation")}>
            <Select value={member.relation} onChange={(e) => setMember({ ...member, relation: e.target.value })}>
              {RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {t(`common.${r}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("common.gotra")}>
            <Select value={member.gotra} onChange={(e) => setMember({ ...member, gotra: e.target.value })}>
              {GOTRAS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("common.dob")}>
            <Input type="date" value={member.dob} onChange={(e) => setMember({ ...member, dob: e.target.value })} />
          </Field>
          <Button full size="lg" loading={pending} onClick={saveMember}>
            {t("common.save")}
          </Button>
        </div>
      </Sheet>

      {/* logout */}
      <Sheet open={logoutOpen} onClose={() => setLogoutOpen(false)} title={t("app.logoutConfirmTitle")} side="center">
        <div className="flex gap-2">
          <Button variant="outline" full onClick={() => setLogoutOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" full loading={pending} onClick={() => start(async () => void (await logoutAction("/")))}>
            {t("common.logout")}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function RowLink({ href, icon, label, badge }: { href: string; icon?: React.ReactNode; label: string; badge?: number }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3.5 py-3">
      {icon && <span className="text-muted">{icon}</span>}
      <span className="flex-1 text-[13.5px] font-medium">{label}</span>
      {!!badge && badge > 0 && (
        <span className="min-w-5 rounded-full bg-primary px-1.5 text-center text-[11px] font-bold leading-5 text-white">{badge > 9 ? "9+" : badge}</span>
      )}
      <ChevronRight className="h-4 w-4 text-muted" />
    </Link>
  );
}
