import { createMembershipsClient, isMissingColumnError } from "@/lib/founding-server";
import type { BillingPlan } from "@/lib/membership-billing";
import { londonToday } from "@/lib/memberships";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BillingRow = {
  id: string;
  status: string;
  first_paid_at: string | null;
};

/** The billing migration has not been run, so the billing columns do not exist. */
export class BillingNotReadyError extends Error {
  constructor() {
    super("Billing is not set up yet: the billing migration has not been run.");
    this.name = "BillingNotReadyError";
  }
}

/**
 * Apply what a Stripe event means to the member it is about. Returns whether a
 * membership was found: an event for someone we do not know is not an error
 * (Stripe sends every event on the account), but a failed database write is,
 * and it throws so the webhook answers with a failure and Stripe retries.
 */
export async function applyBillingPlan(
  plan: BillingPlan,
): Promise<{ found: boolean; membershipId?: string; firstPayment?: boolean }> {
  const supabase = createMembershipsClient();

  let row: BillingRow | null = null;

  if (plan.match.subscriptionId) {
    const { data, error } = await supabase
      .from("memberships")
      .select("id, status, first_paid_at")
      .eq("stripe_subscription_id", plan.match.subscriptionId)
      .maybeSingle();
    if (error) {
      if (isMissingColumnError(error)) throw new BillingNotReadyError();
      throw new Error(`Could not look up the membership: ${error.message}`);
    }
    row = data;
  }

  if (!row && plan.match.membershipId && UUID.test(plan.match.membershipId)) {
    const { data, error } = await supabase
      .from("memberships")
      .select("id, status, first_paid_at")
      .eq("id", plan.match.membershipId)
      .maybeSingle();
    if (error) {
      if (isMissingColumnError(error)) throw new BillingNotReadyError();
      throw new Error(`Could not look up the membership: ${error.message}`);
    }
    row = data;
  }

  if (!row) return { found: false };

  const { error: updateError } = await supabase.from("memberships").update(plan.set).eq("id", row.id);
  if (updateError) throw new Error(`Could not save the payment status: ${updateError.message}`);

  // The subscription is over, so the membership is too — unless it already was.
  if (plan.endMembership) {
    const { error: endError } = await supabase
      .from("memberships")
      .update({ status: "cancelled", cancelled_at: londonToday() })
      .eq("id", row.id)
      .in("status", ["active", "paused"]);
    if (endError) throw new Error(`Could not end the membership: ${endError.message}`);
  }

  // The first payment is recorded once and never overwritten. Stripe sends two
  // events for it (checkout.session.completed and invoice.paid), often at the
  // same moment, so the database decides which one was first: only that one
  // reports firstPayment, and the payment emails go out once.
  let firstPayment = false;
  if (plan.firstPaidAt && !row.first_paid_at) {
    const { data: claimed, error: claimError } = await supabase
      .from("memberships")
      .update({ first_paid_at: plan.firstPaidAt })
      .eq("id", row.id)
      .is("first_paid_at", null)
      .select("id");
    if (claimError) throw new Error(`Could not save the first payment: ${claimError.message}`);
    firstPayment = (claimed ?? []).length > 0;
  }

  return { found: true, membershipId: row.id, firstPayment };
}
