import { NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/api-auth";
import { createMembershipsClient } from "@/lib/founding-server";
import { describeBillingError, listMembershipPayments } from "@/lib/membership-billing-admin-server";

export const dynamic = "force-dynamic";

/** Every membership charge, newest first, read live from Stripe. */
export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { data, error } = await createMembershipsClient()
      .from("memberships")
      .select("id, full_name, plan, stripe_customer_id")
      .not("stripe_customer_id", "is", null);
    if (error) {
      console.error("Membership payments: lookup failed", error.code, error.message);
      return NextResponse.json({ error: "Could not load the members." }, { status: 500 });
    }
    return NextResponse.json(await listMembershipPayments(data ?? []), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const { status, message } = describeBillingError(error);
    if (status >= 500) console.error("Membership payments:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: message }, { status });
  }
}
