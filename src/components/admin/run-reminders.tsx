"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { runRemindersAction, sendTestNotificationAction } from "@/lib/admin/notification-actions";
import { tErr } from "./action-button";

/** "Run reminders now" — shows the engine's summary line after it finishes. */
export function RunRemindersButton({ compact }: { compact?: boolean }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);

  return (
    <div className={compact ? "flex items-center gap-2" : "space-y-2"}>
      <Button
        size="sm"
        variant="outline"
        loading={pending}
        icon={<RefreshCw className="h-4 w-4" />}
        onClick={() =>
          start(async () => {
            const res = await runRemindersAction();
            if (!res.ok) {
              toast(tErr(t, res.error), "error");
              return;
            }
            setSummary(res.summary ?? "");
            toast(t("admin.remindersDone", { n: res.count ?? 0 }), "success");
            router.refresh();
          })
        }
      >
        {t("admin.runRemindersNow")}
      </Button>
      {summary && <p className="text-xs text-muted">{summary}</p>}
    </div>
  );
}

/** Sends a sample notification to the signed-in admin. */
export function SendTestNotificationButton() {
  const t = useT();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      loading={pending}
      icon={<BellRing className="h-4 w-4" />}
      onClick={() =>
        start(async () => {
          const res = await sendTestNotificationAction();
          toast(res.ok ? t("admin.testNotificationSent") : tErr(t, res.error), res.ok ? "success" : "error");
        })
      }
    >
      {t("admin.sendTestNotification")}
    </Button>
  );
}
