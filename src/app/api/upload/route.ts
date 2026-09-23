import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { UploadRejected, checkUpload, cleanFolder, storeUpload } from "@/lib/uploads";

export const runtime = "nodejs";
/** Vercel: a few seconds for a 4 MB body plus the database write. */
export const maxDuration = 30;

/**
 * POST /api/upload (multipart: `file`, `folder`) → `{ url }`.
 * Errors come back as `{ error: <code> }` so the client can show them in the user's language.
 * Where files go and who may upload what: `src/lib/uploads.ts`.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "loginRequired" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "uploadTooLarge" }, { status: 413 });
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "uploadNoFile" }, { status: 400 });
  const folder = cleanFolder(form.get("folder"));

  try {
    await checkUpload(user, folder, file);
    const { url } = await storeUpload(user, folder, file);
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof UploadRejected) return NextResponse.json({ error: e.code }, { status: e.status });
    console.error("[upload]", e);
    return NextResponse.json({ error: "uploadFailed" }, { status: 500 });
  }
}
