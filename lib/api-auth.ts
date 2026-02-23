import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function requireAdminAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("adminAuth");
  if (!adminAuth || adminAuth.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
