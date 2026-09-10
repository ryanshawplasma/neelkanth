"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Link2, PlayCircle, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { MultiImageUpload } from "@/components/ui/image-upload";
import { Sheet } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { cannotPerformAction, completeBookingAction, setLiveLinkAction, startPoojaAction } from "@/lib/pandit/booking-actions";

export function BookingActions({ id, status, type, liveLink }: { id: string; status: string; type: string; liveLink: string | null }) {
  const t = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [link, setLink] = useState(liveLink ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");

  const open = status === "ASSIGNED" || status === "CONFIRMED" || status === "IN_PROGRESS";
  const canStart = status === "ASSIGNED" || status === "CONFIRMED";
  const showLiveLink = open && type !== "PANDIT_AT_HOME";

  if (!open) return null;

  async function run(key: string, fn: () => Promise<{ ok: boolean; error?: string }>, successMsg: string, after?: () => void) {
    setError(null);
    setBusy(key);
    const res = await fn();
    setBusy(null);
    if (!res.ok) return setError(t(res.error ?? "pandit.errGeneric"));
    toast(successMsg);
    after?.();
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      {showLiveLink && (
        <Field label={t("pandit.liveLinkLabel")} hint={t("pandit.liveLinkHint")}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder={t("pandit.liveLinkPlaceholder")} inputMode="url" />
            <Button
              className="shrink-0"
              variant="outline"
              icon={<Link2 className="h-4 w-4" />}
              loading={busy === "link"}
              disabled={!link.trim()}
              onClick={() => void run("link", () => setLiveLinkAction(id, link), t("pandit.liveLinkSaved"))}
            >
              {t("pandit.saveLiveLink")}
            </Button>
          </div>
        </Field>
      )}

      <div className="flex flex-wrap gap-2">
        {canStart && (
          <Button icon={<PlayCircle className="h-4 w-4" />} loading={busy === "start"} onClick={() => void run("start", () => startPoojaAction(id), t("pandit.poojaStarted"))}>
            {t("pandit.startPooja")}
          </Button>
        )}
        <Button variant="maroon" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => setCompleteOpen(true)}>
          {t("pandit.markCompleted")}
        </Button>
        {canStart && (
          <Button variant="ghost" className="text-danger" icon={<UserX className="h-4 w-4" />} onClick={() => setReleaseOpen(true)}>
            {t("pandit.cannotPerform")}
          </Button>
        )}
      </div>

      {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      <Sheet
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        title={t("pandit.completeTitle")}
        footer={
          <Button
            full
            size="lg"
            loading={busy === "complete"}
            onClick={() =>
              void run(
                "complete",
                () => completeBookingAction(id, { videoUrl: videoUrl.trim() || undefined, photos, panditNote: note.trim() || undefined }),
                t("pandit.completed"),
                () => setCompleteOpen(false),
              )
            }
          >
            {t("pandit.markCompleted")}
          </Button>
        }
      >
        <p className="mb-4 text-sm text-muted">{t("pandit.completeHint")}</p>
        <div className="space-y-4">
          <Field label={t("pandit.videoUrl")}>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder={t("pandit.videoUrlPlaceholder")} inputMode="url" />
          </Field>
          <Field label={t("pandit.poojaPhotos")}>
            <MultiImageUpload value={photos} onChange={setPhotos} folder="pooja-photos" max={6} />
          </Field>
          <Field label={t("pandit.panditNote")}>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("pandit.panditNotePlaceholder")} rows={3} />
          </Field>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </Sheet>

      <Sheet
        open={releaseOpen}
        onClose={() => setReleaseOpen(false)}
        title={t("pandit.cannotPerformTitle")}
        footer={
          <Button
            full
            size="lg"
            variant="danger"
            loading={busy === "release"}
            disabled={reason.trim().length < 5}
            onClick={() => void run("release", () => cannotPerformAction(id, reason), t("pandit.released"), () => setReleaseOpen(false))}
          >
            {t("pandit.cannotPerform")}
          </Button>
        }
      >
        <p className="mb-4 text-sm text-muted">{t("pandit.cannotPerformHint")}</p>
        <Field label={t("pandit.cannotPerformReason")} required>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("pandit.cannotPerformReasonPlaceholder")} rows={3} />
        </Field>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </Sheet>
    </div>
  );
}
