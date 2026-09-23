"use client";

import { useRef, useState } from "react";
import { Camera, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** Longest edge of an uploaded photo. Plenty for phone screens and KYC documents. */
const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.85;
/** Server limit (src/lib/uploads.ts). */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ERROR_CODES = new Set(["uploadTooLarge", "uploadBadType", "uploadNotAllowed", "uploadQuota", "uploadNoFile", "uploadFailed", "loginRequired"]);

/** Error thrown by `uploadFile`; `message` is a `common.*` dictionary key. */
export class UploadError extends Error {}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Shrink a phone photo before it leaves the device: at most 1920px on the longest edge and
 * re-encoded, which turns a 4–8 MB camera JPEG into a few hundred KB and drops its EXIF data
 * (including GPS location). PNG/WebP are only re-encoded when large; GIF, SVG and PDF are untouched.
 */
async function prepareForUpload(file: File): Promise<File> {
  const isJpeg = file.type === "image/jpeg";
  if (!isJpeg && !(file.type === "image/png" || file.type === "image/webp")) return file;
  if (!isJpeg && file.size < 1024 * 1024) return file;
  if (typeof createImageBitmap !== "function") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file); // applies the photo's EXIF orientation
  } catch {
    return file;
  }
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // JPEG stays JPEG. PNG/WebP go to WebP so transparency survives.
    const target = isJpeg ? "image/jpeg" : "image/webp";
    if (isJpeg) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await toBlob(canvas, target, JPEG_QUALITY);
    if (!blob) return file;

    // Browsers without a WebP encoder return PNG: keep whichever file is smaller.
    // A re-encoded JPEG is kept even if slightly larger, because it no longer carries location data.
    if (!isJpeg && blob.size >= file.size) return file;
    if (isJpeg && blob.size > MAX_UPLOAD_BYTES && file.size < blob.size) return file;

    const ext = blob.type === "image/jpeg" ? "jpg" : blob.type === "image/webp" ? "webp" : "png";
    const base = file.name.replace(/\.[^.]*$/, "") || "photo";
    return new File([blob], `${base}.${ext}`, { type: blob.type, lastModified: Date.now() });
  } finally {
    bitmap.close?.();
  }
}

/**
 * Uploads to /api/upload (multipart, fields "file" and "folder") and returns the URL to store.
 * Throws `UploadError` whose message is a `common.*` key for the UI to translate.
 */
export async function uploadFile(file: File, folder = "misc"): Promise<string> {
  const prepared = await prepareForUpload(file);
  if (prepared.size > MAX_UPLOAD_BYTES) throw new UploadError("uploadTooLarge");
  const fd = new FormData();
  fd.append("file", prepared);
  fd.append("folder", folder);
  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: fd });
  } catch {
    throw new UploadError("uploadFailed");
  }
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    // Vercel answers 413 itself (without our JSON) when a body is over its limit.
    const code = res.status === 413 ? "uploadTooLarge" : data.error && ERROR_CODES.has(data.error) ? data.error : "uploadFailed";
    throw new UploadError(code);
  }
  return data.url;
}

const isPdfUrl = (url: string) => /\.pdf($|\?)/i.test(url);

export function ImageUpload({
  value,
  onChange,
  folder = "misc",
  label,
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
  const t = useT();
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
      setErr(`common.${e instanceof UploadError ? e.message : "uploadFailed"}`);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  const isImage = value && !isPdfUrl(value);

  return (
    <div className={className}>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      <div
        role="button"
        tabIndex={0}
        aria-label={label ?? t("common.uploadPhoto")}
        aria-busy={busy}
        onClick={() => !busy && ref.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !busy && ref.current?.click()}
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
            <span className="flex flex-col items-center gap-1 px-3 text-center text-xs">
              <FileText className="h-6 w-6 text-primary" />
              {t("common.pdfUploaded")}
            </span>
          )
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs">
            {round ? <Camera className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
            {label ?? t("common.uploadPhoto")}
          </span>
        )}
      </div>
      {value && !busy && (
        <div className="mt-1.5 flex items-center gap-3">
          {!isImage && (
            <a href={value} target="_blank" rel="noopener" className="text-xs font-medium text-primary hover:underline">
              {t("common.viewFile")}
            </a>
          )}
          <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1 text-xs text-danger hover:underline">
            <Trash2 className="h-3.5 w-3.5" /> {t("common.remove")}
          </button>
        </div>
      )}
      {err && (
        <p role="alert" className="mt-1 text-xs text-danger">
          {t(err)}
        </p>
      )}
    </div>
  );
}

/** Multiple images (service gallery, pooja photos). */
export function MultiImageUpload({ value, onChange, folder = "services", max = 6 }: { value: string[]; onChange: (urls: string[]) => void; folder?: string; max?: number }) {
  const t = useT();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    const urls: string[] = [];
    try {
      for (const f of Array.from(files).slice(0, max - value.length)) urls.push(await uploadFile(f, folder));
    } catch (e) {
      setErr(`common.${e instanceof UploadError ? e.message : "uploadFailed"}`);
    } finally {
      // Keep whatever finished before a failure.
      if (urls.length) onChange([...value, ...urls]);
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {value.map((u, i) => (
          <div key={u + i} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
              aria-label={t("common.remove")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[10px] text-white">{t("common.cover")}</span>}
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            aria-label={t("common.uploadPhoto")}
            className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-2 text-muted hover:border-primary/60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          </button>
        )}
        <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handle(e.target.files)} />
      </div>
      {err && (
        <p role="alert" className="mt-1.5 text-xs text-danger">
          {t(err)}
        </p>
      )}
    </div>
  );
}
