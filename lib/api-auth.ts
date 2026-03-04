import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET env var is not set");
  return new TextEncoder().encode(secret);
}

export async function requireAdminAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("adminAuth");
  if (!adminAuth?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await jwtVerify(adminAuth.value, getJwtSecret());
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
