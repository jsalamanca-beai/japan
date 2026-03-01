import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "jp_session";
const SESSION_VALUE = "authenticated";

const protectedPages = ["/dashboard", "/history"];
const protectedApi = ["/api/entries"];

export function middleware(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME);
  const isAuth = session?.value === SESSION_VALUE;
  const { pathname } = request.nextUrl;

  // Protect pages
  if (protectedPages.some((p) => pathname.startsWith(p))) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect API routes
  if (protectedApi.some((p) => pathname.startsWith(p))) {
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Redirect authenticated users from login to dashboard
  if (pathname === "/" && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/history/:path*", "/api/entries/:path*"],
};
