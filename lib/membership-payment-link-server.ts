import { BRAND_NAME } from "@/lib/brand";
import { findFoundingPlan } from "@/lib/founding";
import { createMembershipsClient, getFoundingConfig, isMissingColumnError } from "@/lib/founding-server";
import { BillingNotReadyError } from "@/lib/membership-billing-server";
import { isStripeAvailable, stripe } from "@/lib/stripe";
import { createMembershipPaymentLink } from "@/lib/stripe-membership";

/** Stripe keys are not set on this server. */
export class StripeNotConfiguredError extends Error {
  constructor() {
    super("Stripe is not set up on this server.");
    this.name = "StripeNotConfiguredError";
  }
}

type MembershipForLink = {
  id: string;
  plan: string;
  monthly_price: number | string;
  email: string;
  payment_status?: string | null;
  stripe_payment_link_id?: string | null;
};

/**
 * Create a Stripe payment link for a member's monthly plan at the fee they
 * agreed when they applied, and remember it on the membership. An earlier
 * unpaid link for the same person is switched off so only one is live.
 */
export async function createAndStorePaymentLink(membership: MembershipForLink): Promise<{ url: string; linkId: string }> {
  if (!isStripeAvailable() || !stripe) throw new StripeNotConfiguredError();

  const config = await getFoundingConfig();
  const plan = findFoundingPlan(config.plans, membership.plan);

  const link = await createMembershipPaymentLink(stripe, {
    membershipId: membership.id,
    planId: membership.plan,
    planName: plan?.name ?? membership.plan,
    monthlyPrice: Number(membership.monthly_price),
    email: membership.email,
    brandName: BRAND_NAME,
  });

  const supabase = createMembershipsClient();
  const { error } = await supabase
    .from("memberships")
    .update({
      payment_link_url: link.url,
      stripe_payment_link_id: link.id,
      payment_link_sent_at: new Date().toISOString(),
      // A member who has already paid keeps that status; the link is just a spare.
      ...(membership.payment_status === "paid" ? {} : { payment_status: "link_sent" }),
    })
    .eq("id", membership.id);

  if (error) {
    // Do not leave a live link we could not record.
    await stripe.paymentLinks.update(link.id, { active: false }).catch(() => {});
    if (isMissingColumnError(error)) throw new BillingNotReadyError();
    throw new Error(`Could not save the payment link: ${error.message}`);
  }

  if (membership.stripe_payment_link_id && membership.stripe_payment_link_id !== link.id) {
    await stripe.paymentLinks.update(membership.stripe_payment_link_id, { active: false }).catch(() => {});
  }

  return { url: link.url, linkId: link.id };
}

/** What to tell the admin, and with which status, when a payment link could not be made. */
export function describePaymentLinkError(error: unknown): { status: number; message: string } {
  if (error instanceof StripeNotConfiguredError) {
    return { status: 503, message: "Stripe is not set up on this server yet." };
  }
  if (error instanceof BillingNotReadyError) {
    return { status: 503, message: "Payments are not set up yet: the billing migration has not been run." };
  }
  return { status: 502, message: "Stripe could not create the payment link. Please try again." };
}
