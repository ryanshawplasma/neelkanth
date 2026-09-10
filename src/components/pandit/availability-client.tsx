"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarOff, Copy, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Toggle } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useLocale, useT } from "@/i18n/client";
import { WEEKDAYS, pickBi } from "@/lib/constants";
import { formatDate, toDateKey } from "@/lib/utils";
import { addBlockedDateAction, removeBlockedDateAction, saveAvailabilityAction, type AvailabilitySlot } from "@/lib/pandit/availability-actions";
import { Panel } from "./common";

export type BlockedDate = { id: string; date: string; reason: string | null };

type Row = AvailabilitySlot & { key: string };

let uid = 0;
const nextKey = () => `s${++uid}`;

export function AvailabilityClient({ slots, blocked }: { slots: AvailabilitySlot[]; blocked: BlockedDate[] }) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>(() => slots.map((s) => ({ ...s, key: nextKey() })));
  const [days, setDays] = useState<boolean[]>(() => Array.from({ length: 7 }, (_, d) => slots.some((s) => s.weekday === d && s.enabled)));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [blockBusy, setBlockBusy] = useState(false);

  const addRow = (weekday: number) => setRows((r) => [...r, { key: nextKey(), weekday, startTime: "09:00", endTime: "12:00", enabled: true }]);
  const removeRow = (key: string) => setRows((r) => r.filter((x) => x.key !== key));
  const patch = (key: string, p: Partial<Row>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...p } : x)));

  function toggleDay(d: number, on: boolean) {
    setDays((ds) => ds.map((v, i) => (i === d ? on : v)));
    setRows((r) => {
      const has = r.some((x) => x.weekday === d);
      if (on && !has) return [...r, { key: nextKey(), weekday: d, startTime: "09:00", endTime: "12:00", enabled: true }];
      return r.map((x) => (x.weekday === d ? { ...x, enabled: on } : x));
    });
  }

  function copyMonday() {
    const monday = rows.filter((r) => r.weekday === 1);
    if (!monday.length) return setError(t("pandit.errRequired"));
    setError(null);
    const next: Row[] = [];
    for (let d = 0; d < 7; d++) {
      for (const m of monday) next.push({ key: nextKey(), weekday: d, startTime: m.startTime, endTime: m.endTime, enabled: m.enabled });
    }
    setRows(next);
    setDays(Array.from({ length: 7 }, () => monday.some((m) => m.enabled)));
    toast(t("pandit.copied"));
  }

  async function save() {
    setError(null);
    setBusy(true);
    const payload: AvailabilitySlot[] = rows
      .filter((r) => days[r.weekday])
      .map((r) => ({ weekday: r.weekday, startTime: r.startTime, endTime: r.endTime, enabled: r.enabled }));
    const res = await saveAvailabilityAction(payload);
    setBusy(false);
    if (!res.ok) return setError(t(res.error));
    toast(t("pandit.availabilitySaved"));
    router.refresh();
  }

  async function block() {
    setError(null);
    setBlockBusy(true);
    const res = await addBlockedDateAction(newDate, newReason);
    setBlockBusy(false);
    if (!res.ok) return setError(t(res.error));
    setNewDate("");
    setNewReason("");
    toast(t("pandit.dateBlocked"));
    router.refresh();
  }

  async function unblock(id: string) {
    const res = await removeBlockedDateAction(id);
    if (!res.ok) return setError(t(res.error));
    toast(t("pandit.dateUnblocked"));
    router.refresh();
  }

  return (
    <div className="space-y-4 px-4 pb-8">
      {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      <Panel
        title={t("pandit.weeklyHours")}
        action={
          <Button size="sm" variant="ghost" icon={<Copy className="h-4 w-4" />} onClick={copyMonday}>
            {t("pandit.copyMonday")}
          </Button>
        }
      >
        <div className="space-y-3">
          {WEEKDAYS.map((w, d) => {
            const dayRows = rows.filter((r) => r.weekday === d);
            return (
              <div key={d} className="rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{pickBi(w, locale)}</span>
                  <Toggle checked={days[d]} onChange={(v) => toggleDay(d, v)} />
                </div>
                {days[d] && (
                  <div className="mt-2.5 space-y-2">
                    {dayRows.map((r) => (
                      <div key={r.key} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={r.startTime}
                          onChange={(e) => patch(r.key, { startTime: e.target.value })}
                          className="h-10 flex-1"
                          aria-label={`${pickBi(w, locale)} start`}
                        />
                        <span className="text-muted">–</span>
                        <Input
                          type="time"
                          value={r.endTime}
                          onChange={(e) => patch(r.key, { endTime: e.target.value })}
                          className="h-10 flex-1"
                          aria-label={`${pickBi(w, locale)} end`}
                        />
                        <button
                          type="button"
                          onClick={() => removeRow(r.key)}
                          className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-danger"
                          aria-label={t("common.remove")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addRow(d)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      <Plus className="h-3.5 w-3.5" /> {t("pandit.addSlot")}
                    </button>
                  </div>
                )}
                {!days[d] && <p className="mt-1.5 text-xs text-muted">{t("pandit.unavailableDay")}</p>}
              </div>
            );
          })}
        </div>
        <Button className="mt-4" full icon={<Save className="h-4 w-4" />} loading={busy} onClick={() => void save()}>
          {t("pandit.saveAvailability")}
        </Button>
      </Panel>

      <Panel title={t("pandit.blockedDates")} subtitle={t("pandit.blockedDatesHint")}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Field className="flex-1" label={t("common.date")}>
            <Input type="date" min={toDateKey()} value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          </Field>
          <Field className="flex-1" label={t("pandit.blockReason")}>
            <Input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder={t("pandit.blockReasonPlaceholder")} />
          </Field>
          <Button className="shrink-0" variant="outline" icon={<CalendarOff className="h-4 w-4" />} loading={blockBusy} disabled={!newDate} onClick={() => void block()}>
            {t("pandit.blockDate")}
          </Button>
        </div>

        {blocked.length ? (
          <ul className="mt-3 divide-y divide-border">
            {blocked.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>
                  <span className="font-medium">{formatDate(b.date, locale)}</span>
                  {b.reason && <span className="ml-2 text-xs text-muted">{b.reason}</span>}
                </span>
                <button type="button" onClick={() => void unblock(b.id)} className="rounded-full p-1.5 text-muted hover:bg-surface-2 hover:text-danger" aria-label={t("common.remove")}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">{t("pandit.noBlockedDates")}</p>
        )}
      </Panel>
    </div>
  );
}
