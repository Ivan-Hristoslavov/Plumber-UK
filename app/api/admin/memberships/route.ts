import { NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/api-auth";
import { createMembershipsClient, getFoundingConfig, isMissingTableError } from "@/lib/founding-server";
import { isStripeAvailable } from "@/lib/stripe";
import { takesPlace } from "@/lib/memberships";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

/**
 * Everything the admin Memberships page needs in one call: every application
 * and member, the live configuration, how many places are filled, and whether
 * each migration has been run (so the page can say what is missing).
 */
export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const supabase = createMembershipsClient();
    const config = await getFoundingConfig();

    const [members, settings, billing] = await Promise.all([
      supabase.from("memberships").select("*").order("created_at", { ascending: false }).limit(1000),
      supabase.from("founding_settings").select("id").limit(1),
      // Does the billing migration's column exist yet?
      supabase.from("memberships").select("payment_status").limit(1),
    ]);

    const settingsReady = !settings.error;
    const billingReady = !billing.error;
    const stripeReady = isStripeAvailable();

    if (members.error) {
      if (isMissingTableError(members.error)) {
        return NextResponse.json(
          { setupRequired: true, settingsReady, billingReady: false, stripeReady, memberships: [], config, places: null },
          { headers: NO_STORE },
        );
      }
      console.error("Admin memberships: list failed", members.error.code, members.error.message);
      return NextResponse.json({ error: "Failed to load memberships" }, { status: 500 });
    }

    const rows = members.data ?? [];
    const taken = rows.filter((row) => takesPlace(row.status)).length;

    return NextResponse.json(
      {
        setupRequired: false,
        settingsReady,
        billingReady,
        stripeReady,
        memberships: rows,
        config,
        places: { taken, limit: config.limit, remaining: Math.max(0, config.limit - taken) },
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("Admin memberships: unexpected error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
