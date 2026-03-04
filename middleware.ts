import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET env var is not set");
  return new TextEncoder().encode(secret);
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const adminAuth = request.cookies.get("adminAuth");
  if (!adminAuth?.value) return false;
  try {
    await jwtVerify(adminAuth.value, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/admin");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  if (isApiRoute) {
    // Allow auth endpoint without authentication
    if (request.nextUrl.pathname === "/api/admin/auth") {
      return NextResponse.next();
    }

    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (isAdminPage) {
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    if (!(await isAuthenticated(request))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
