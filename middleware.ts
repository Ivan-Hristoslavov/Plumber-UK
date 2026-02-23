import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/admin");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  if (isApiRoute) {
    // Allow auth endpoint without authentication
    if (request.nextUrl.pathname === "/api/admin/auth") {
      return NextResponse.next();
    }

    const adminAuth = request.cookies.get("adminAuth");
    if (!adminAuth || adminAuth.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (isAdminPage) {
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    const adminAuth = request.cookies.get("adminAuth");
    if (!adminAuth || adminAuth.value !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
