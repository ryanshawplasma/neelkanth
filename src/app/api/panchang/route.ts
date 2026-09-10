import { NextResponse, type NextRequest } from "next/server";
import { getPanchang, serializePanchang } from "@/lib/panchang";
import { fromDateKey } from "@/lib/utils";

/** GET /api/panchang?date=YYYY-MM-DD&lat=&lng= → serialized panchang JSON (used by /panchang). */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const dateKey = sp.get("date");
  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));

  const date = dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? fromDateKey(dateKey) : new Date();
  try {
    const p = getPanchang(date, Number.isFinite(lat) ? lat : undefined, Number.isFinite(lng) ? lng : undefined);
    return NextResponse.json(serializePanchang(p));
  } catch {
    return NextResponse.json({ error: "panchang_failed" }, { status: 500 });
  }
}
