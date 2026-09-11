import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "application/pdf"]);

function fileName(file: File) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

/**
 * Storage backends:
 *  - Vercel Blob when BLOB_READ_WRITE_TOKEN is set (Vercel → Storage → Blob; public URLs)
 *  - local disk (public/uploads/<folder>/) otherwise — fine for dev and single-server hosts,
 *    not for serverless platforms whose filesystem is read-only.
 */
async function store(folder: string, file: File): Promise<string> {
  const name = fileName(file);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${folder}/${name}`, file, { access: "public", contentType: file.type, addRandomSuffix: false });
    return blob.url;
  }
  if (process.env.VERCEL) {
    throw new Error("Uploads need Vercel Blob on this host: add the BLOB_READ_WRITE_TOKEN environment variable (Storage → Blob).");
  }
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${name}`;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const folderRaw = String(form.get("folder") ?? "misc");
  const folder = folderRaw.replace(/[^a-z0-9_-]/gi, "").slice(0, 32) || "misc";

  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 413 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });

  try {
    const url = await store(folder, file);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    console.error("[upload]", message);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
