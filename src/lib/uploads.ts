import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Role } from "@prisma/client";
import { db } from "./db";

/**
 * Vercel rejects function request bodies over 4.5 MB, so files are capped a little below that.
 * Photos are shrunk in the browser before upload (see `uploadFile`), so this only bites large PDFs.
 */
export const UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

const RASTER = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_TYPES = new Set([...RASTER, "image/svg+xml", "application/pdf"]);

/** Folders whose files are never public: served only to the uploader and to admins. */
const PRIVATE_FOLDERS = new Set(["kyc"]);

/** Where each role may upload. Admins may use any folder. */
const ROLE_FOLDERS: Record<Exclude<Role, "ADMIN">, Set<string>> = {
  PANDIT: new Set(["kyc", "pandits", "pooja-photos"]),
  USER: new Set(["avatars"]),
};

/** Limits for non-admin uploads kept in the database (they share its storage quota). */
const MAX_FILES_PER_HOUR = 40;
const MAX_BYTES_PER_DAY = 60 * 1024 * 1024;

export type UploadBackend = "blob" | "database" | "disk";

export type UploadError =
  | "uploadTooLarge"
  | "uploadBadType"
  | "uploadNotAllowed"
  | "uploadQuota"
  | "uploadNoFile";

export class UploadRejected extends Error {
  constructor(
    readonly code: UploadError,
    readonly status: number,
  ) {
    super(code);
  }
}

const SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);

/**
 * Storage for public files:
 *  - Vercel Blob when BLOB_READ_WRITE_TOKEN is set (CDN, no database growth)
 *  - the database on serverless hosts without it (their filesystem is read-only)
 *  - `public/uploads/` on a normal server or in development
 * `UPLOAD_STORAGE=database|disk|blob` overrides the choice. Private files always use the database.
 */
export function publicUploadBackend(): UploadBackend {
  const forced = process.env.UPLOAD_STORAGE;
  if (forced === "database" || forced === "disk") return forced;
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return SERVERLESS ? "database" : "disk";
}

export function cleanFolder(raw: unknown) {
  return String(raw ?? "misc").replace(/[^a-z0-9_-]/gi, "").toLowerCase().slice(0, 32) || "misc";
}

function extensionFor(type: string, originalName: string) {
  const byType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
  };
  return byType[type] ?? ((originalName.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin");
}

function safeName(file: File) {
  const base =
    file.name
      .replace(/\.[^.]*$/, "")
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 40) || "file";
  return `${base}-${Math.random().toString(36).slice(2, 8)}.${extensionFor(file.type, file.name)}`;
}

/** Validate an upload for this user and folder. Throws `UploadRejected`. */
export async function checkUpload(user: { id: string; role: Role }, folder: string, file: File) {
  if (file.size > UPLOAD_MAX_BYTES) throw new UploadRejected("uploadTooLarge", 413);
  if (!ALLOWED_TYPES.has(file.type)) throw new UploadRejected("uploadBadType", 415);
  if (user.role === "ADMIN") return;

  // SVG can carry scripts: only admins (catalogue artwork) may upload it.
  if (file.type === "image/svg+xml") throw new UploadRejected("uploadBadType", 415);
  if (!ROLE_FOLDERS[user.role].has(folder)) throw new UploadRejected("uploadNotAllowed", 403);

  if (PRIVATE_FOLDERS.has(folder) || publicUploadBackend() === "database") {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [lastHour, lastDay] = await Promise.all([
      db.storedFile.count({ where: { ownerId: user.id, createdAt: { gt: hourAgo } } }),
      db.storedFile.aggregate({ where: { ownerId: user.id, createdAt: { gt: dayAgo } }, _sum: { size: true } }),
    ]);
    if (lastHour >= MAX_FILES_PER_HOUR || (lastDay._sum.size ?? 0) + file.size > MAX_BYTES_PER_DAY) {
      throw new UploadRejected("uploadQuota", 429);
    }
  }
}

/** Store a validated upload and return the URL to save in the record that uses it. */
export async function storeUpload(user: { id: string }, folder: string, file: File): Promise<{ url: string; backend: UploadBackend }> {
  const name = safeName(file);
  const isPrivate = PRIVATE_FOLDERS.has(folder);
  const backend: UploadBackend = isPrivate ? "database" : publicUploadBackend();

  if (backend === "blob") {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${folder}/${name}`, file, { access: "public", contentType: file.type, addRandomSuffix: true });
    return { url: blob.url, backend };
  }

  if (backend === "database") {
    const data = new Uint8Array(await file.arrayBuffer());
    const row = await db.storedFile.create({
      data: { folder, name, contentType: file.type, size: data.byteLength, data, isPrivate, ownerId: user.id },
      select: { id: true },
    });
    return { url: `/api/files/${row.id}/${name}`, backend };
  }

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), new Uint8Array(await file.arrayBuffer()));
  return { url: `/uploads/${folder}/${name}`, backend };
}
