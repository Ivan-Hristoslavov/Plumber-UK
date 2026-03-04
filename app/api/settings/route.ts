import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Keys that are safe to expose publicly (displayed on the website).
// Sensitive keys (VAT, banking, email/SMS config) are NOT in this list.
const PUBLIC_SETTINGS_KEYS = new Set([
  "companyStatus",
  "mcsCertified",
  "mcsNumber",
  "gasSafeRegistered",
  "gasSafeNumber",
  "fullyInsured",
  "insuranceProvider",
  "responseTime",
  "emergencyRate",
  "standardRate",
  "workingHoursStart",
  "workingHoursEnd",
  "workingDays",
  "dayOffEnabled",
  "dayOffMessage",
]);

export async function GET() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", Array.from(PUBLIC_SETTINGS_KEYS));

    if (error) {
      console.error("Error fetching public settings:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    const settingsObject =
      data?.reduce(
        (acc, setting) => {
          try {
            acc[setting.key] = JSON.parse(setting.value);
          } catch {
            acc[setting.key] = setting.value;
          }
          return acc;
        },
        {} as Record<string, unknown>
      ) ?? {};

    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error("Error in public settings API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
