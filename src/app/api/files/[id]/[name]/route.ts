import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Uploaded files are user content served from the app's own origin: forbid scripts and embedding of
 * anything they reference, so an SVG or PDF opened directly cannot act on the viewer's session.
 */
const SAFE_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
  "Cross-Origin-Resource-Policy": "same-origin",
};

function notFound() {
  return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
}

/**
 * GET /api/files/:id/:name — a file stored by `/api/upload` in the database.
 * Public files are cached for a year (the id never gets new content).
 * Private files (KYC documents) are served only to their uploader and to admins, never cached.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; name: string }> }) {
  const { id, name } = await params;
  if (!/^[a-z0-9]{10,40}$/i.test(id)) return notFound();

  const meta = await db.storedFile.findUnique({ where: { id }, select: { name: true, isPrivate: true, ownerId: true } });
  if (!meta || meta.name !== decodeURIComponent(name)) return notFound();

  if (meta.isPrivate) {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Login required", { status: 401, headers: { "Cache-Control": "no-store" } });
    // Someone else's private document is reported as missing rather than confirming it exists.
    if (user.role !== "ADMIN" && user.id !== meta.ownerId) return notFound();
  }

  const file = await db.storedFile.findUnique({ where: { id }, select: { data: true, contentType: true, size: true } });
  if (!file) return notFound();

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      ...SAFE_HEADERS,
      "Content-Type": file.contentType,
      "Content-Length": String(file.size),
      "Content-Disposition": `inline; filename="${meta.name.replace(/[^\w.-]/g, "_")}"`,
      "Cache-Control": meta.isPrivate ? "private, no-store, max-age=0" : "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
