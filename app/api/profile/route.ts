import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Public endpoint — returns only the fields shown on the public website.
// No auth required. Sensitive fields (bank details, password, email) are excluded.
export async function GET() {
  try {
    const supabase = createClient();

    const { data: profile, error } = await supabase
      .from("admin_profile")
      .select(
        "id, name, phone, business_email, company_name, company_address, about, years_of_experience, specializations, certifications, response_time, gas_safe_number, insurance_provider, service_areas, updated_at"
      )
      .single();

    if (error) {
      console.error("Error fetching public profile:", error);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in public profile API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
