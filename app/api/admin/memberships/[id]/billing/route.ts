import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/api-auth";
import { createMembershipsClient } from "@/lib/founding-server";
import { isBillingAction } from "@/lib/membership-billing-admin";
import { describeBillingError, getBillingDetails, runBillingAction } from "@/lib/membership-billing-admin-server";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

type Context = { params: Promise<{ id: string }> };

async function loadMember(id: string) {
  if (!UUID.test(id)) return { response: NextResponse.json({ error: "Invalid membership id." }, { status: 400 }) };
  const { data, error } = await createMembershipsClient().from("memberships").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("Admin billing: lookup failed", error.code, error.message);
    return { response: NextResponse.json({ error: "Failed to load the membership." }, { status: 500 }) };
  }
  if (!data) return { response: NextResponse.json({ error: "Membership not found." }, { status: 404 }) };
  return { member: data };
}

function failure(error: unknown) {
  const { status, message } = describeBillingError(error);
  if (status >= 500) console.error("Admin billing:", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: message }, { status });
}

/** Every billing step for one member, read live from Stripe. */
export async function GET(_request: NextRequest, { params }: Context) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { member, response } = await loadMember((await params).id);
    if (response) return response;
    return NextResponse.json(await getBillingDetails(member), { headers: NO_STORE });
  } catch (error) {
    return failure(error);
  }
}

/** Refund a payment, or cancel, pause or resume the subscription. */
export async function POST(request: NextRequest, { params }: Context) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!isBillingAction(body?.action)) return NextResponse.json({ error: "Unknown action." }, { status: 400 });

  try {
    const { member, response } = await loadMember((await params).id);
    if (response) return response;
    await runBillingAction(member, body.action, body);
    // The action is done: failing to re-read must not look like it failed.
    const details = await getBillingDetails(member).catch(() => null);
    return NextResponse.json({ success: true, details }, { headers: NO_STORE });
  } catch (error) {
    return failure(error);
  }
}
