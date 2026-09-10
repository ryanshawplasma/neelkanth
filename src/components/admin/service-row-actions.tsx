"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { deleteServiceAction, duplicateServiceAction } from "@/lib/admin/service-actions";
import { tErr } from "./action-button";

/** Edit / duplicate / delete for one row of the services table. */
export function ServiceRowActions({ id, name }: { id: string; name: string }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Link href={`/admin/services/${id}`} className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-primary" aria-label={t("common.edit")} title={t("common.edit")}>
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <button
        type="button"
        disabled={pending}
        aria-label={t("admin.duplicate")}
        title={t("admin.duplicate")}
        className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-primary disabled:opacity-50"
        onClick={() =>
          start(async () => {
            const res = await duplicateServiceAction(id);
            if (!res.ok) {
              toast(tErr(t, res.error), "error");
              return;
            }
            toast(t("admin.duplicated"), "success");
            if (res.id) router.push(`/admin/services/${res.id}`);
            else router.refresh();
          })
        }
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        disabled={pending}
        aria-label={t("common.delete")}
        title={t("common.delete")}
        className="rounded-lg p-1.5 text-danger hover:bg-danger-soft disabled:opacity-50"
        onClick={() => setConfirm(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t("admin.deleteService")}
        description={t("admin.deleteServiceWarning", { name })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        danger
        loading={pending}
        onConfirm={() =>
          start(async () => {
            const res = await deleteServiceAction(id);
            if (!res.ok) {
              toast(tErr(t, res.error), "error");
              setConfirm(false);
              return;
            }
            toast(t("admin.deleted"), "success");
            setConfirm(false);
            router.refresh();
          })
        }
      />
    </div>
  );
}
