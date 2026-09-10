"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Uploads to /api/upload (multipart, field "file") and returns the public URL.
 * Accepts images (and PDFs when `accept` is widened, e.g. for KYC docs).
 */
export async function uploadFile(file: File, folder = "misc"): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Upload failed");
  const data = (await res.json()) as { url: string };
  return data.url;
}

export function ImageUpload({
  value,
  onChange,
  folder = "misc",
  label = "Upload photo",
  accept = "image/*",
  aspect = "aspect-[4/3]",
  className,
  round,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
  accept?: string;
  aspect?: string;
  className?: string;
  round?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle(file?: File) {
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      onChange(await uploadFile(file, folder));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const isImage = value && !/\.pdf($|\?)/i.test(value);

  return (
    <div className={className}>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      <div
        role="button"
        tabIndex={0}
        onClick={() => !busy && ref.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && ref.current?.click()}
        className={cn(
          "relative flex cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-border bg-surface-2 text-muted transition-colors hover:border-primary/60",
          round ? "h-28 w-28 rounded-full" : cn("w-full rounded-2xl", aspect),
        )}
      >
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : value ? (
          isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-3 text-center text-xs">PDF uploaded</span>
          )
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs">
            {round ? <Camera className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
            {label}
          </span>
        )}
      </div>
      {value && !busy && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-1.5 inline-flex items-center gap-1 text-xs text-danger hover:underline"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remove
        </button>
      )}
      {err && <p className="mt-1 text-xs text-danger">{err}</p>}
    </div>
  );
}

/** Multiple images (service gallery). */
export function MultiImageUpload({ value, onChange, folder = "services", max = 6 }: { value: string[]; onChange: (urls: string[]) => void; folder?: string; max?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, max - value.length)) urls.push(await uploadFile(f, folder));
      onChange([...value, ...urls]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {value.map((u, i) => (
        <div key={u + i} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={u} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
            aria-label="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[10px] text-white">Cover</span>}
        </div>
      ))}
      {value.length < max && (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-2 text-muted hover:border-primary/60"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handle(e.target.files)} />
    </div>
  );
}
