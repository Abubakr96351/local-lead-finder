import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "session";

/** Paths (and, for prefixes, trailing content) reachable without logging in. */
const PUBLIC_EXACT_PATHS = new Set([
  "/",
  "/login",
  "/setup",
  "/logo-mark.png",
  "/logo-full.png",
]);
const PUBLIC_PREFIXES = ["/api/auth/", "/api/cron/"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Cheap, DB-free gate: only checks whether a session cookie is present.
 * The authoritative check (is it valid, not expired, user still active)
 * happens in getCurrentUser() inside each page/route — see lib/auth.ts and
 * the Next.js proxy docs' own guidance not to rely on Proxy alone.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Run on everything except static assets / Next internals — the actual
  // public/protected split happens above, in isPublicPath().
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
