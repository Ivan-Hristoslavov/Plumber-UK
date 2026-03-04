import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";

import { supabase } from "../../../../lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET env var is not set");
  return new TextEncoder().encode(secret);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { limited } = rateLimit(`auth-login:${ip}`, { maxRequests: 5, windowMs: 300_000 });
  if (limited) {
    return NextResponse.json({ error: "Too many login attempts. Please try again in 5 minutes." }, { status: 429 });
  }

  try {
    const { email, password } = await request.json();

    // Get admin profile by email
    const { data: adminProfile, error } = await supabase
      .from("admin_profile")
      .select("email, password")
      .eq("email", email)
      .single();

    // Validate credentials with bcrypt
    if (
      !error &&
      adminProfile &&
      (await bcrypt.compare(password, adminProfile.password))
    ) {
      // Issue a signed JWT so the cookie value cannot be forged
      const token = await new SignJWT({ role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(getJwtSecret());

      const cookieStore = await cookies();
      cookieStore.set("adminAuth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Auth error:", error);

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("adminAuth");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
