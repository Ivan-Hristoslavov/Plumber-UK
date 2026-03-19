import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Public read-only day-off periods (banner / booking calendar).
 * Admin writes stay on /api/admin/day-off with requireAdminAuth.
 */
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("day_off_periods")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const response = NextResponse.json(data ?? []);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Vercel-CDN-Cache-Control", "no-store");
  return response;
}
