import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "dd_session";

async function readSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret"));
    return { uid: payload.uid as string, role: (payload.role as string) ?? "USER" };
  } catch {
    return null;
  }
}

// Route → allowed roles. Public pandit/admin entry points are excluded below.
const USER_PROTECTED = ["/bookings", "/account", "/onboarding", "/notifications", "/checkout", "/consult/my"];
const PANDIT_PUBLIC = ["/pandit/login", "/pandit/register"];
const ADMIN_PUBLIC = ["/admin/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await readSession(req);

  const redirectTo = (path: string) => {
    const url = req.nextUrl.clone();
    url.pathname = path;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  };

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (ADMIN_PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
    if (!session) return redirectTo("/admin/login");
    if (session.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  if (pathname === "/pandit" || pathname.startsWith("/pandit/")) {
    if (PANDIT_PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
    if (!session) return redirectTo("/pandit/login");
    if (session.role !== "PANDIT" && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/pandit/register", req.url));
    }
    return NextResponse.next();
  }

  if (USER_PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (!session) return redirectTo("/login");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|images|uploads|sw.js|manifest.webmanifest).*)"],
};
