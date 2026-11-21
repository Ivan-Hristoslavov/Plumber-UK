import type Stripe from "stripe";

/**
 * A Stripe payment link for one member's monthly Founding 100 plan.
 *
 * It takes the Stripe client as an argument and imports only a type from the
 * SDK, so it can be exercised against Stripe's test mode on its own. The link
 * starts a subscription: a recurring monthly price, with the membership's id
 * written onto the link and the subscription so the webhook can tell whose
 * payment it is.
 */

export type MembershipLinkInput = {
  membershipId: string;
  planId: string;
  planName: string;
  /** Monthly fee in pounds, as agreed when the member applied. */
  monthlyPrice: number;
  /** Pre-fills the email on Stripe's page. */
  email?: string;
  brandName: string;
};

export type MembershipLink = { id: string; url: string; priceId: string; productId: string };

const CURRENCY = "gbp";

/** One Stripe product per plan, reused for every member of that plan. */
async function findOrCreateProduct(stripe: Stripe, input: MembershipLinkInput): Promise<Stripe.Product> {
  const existing = await stripe.products.list({ active: true, limit: 100 });
  const found = existing.data.find((product) => product.metadata?.founding_plan === input.planId);
  if (found) return found;

  return stripe.products.create({
    name: `${input.brandName} ${input.planName} membership`,
    metadata: { founding_plan: input.planId, kind: "founding_membership" },
  });
}

/**
 * Prices cannot be edited in Stripe, so a price change means a new price. An
 * existing one is reused when the amount matches, so members on the same plan
 * at the same fee share one.
 */
async function findOrCreatePrice(stripe: Stripe, product: Stripe.Product, unitAmount: number): Promise<Stripe.Price> {
  const prices = await stripe.prices.list({ product: product.id, active: true, type: "recurring", limit: 100 });
  const found = prices.data.find(
    (price) =>
      price.unit_amount === unitAmount &&
      price.currency === CURRENCY &&
      price.recurring?.interval === "month" &&
      price.recurring?.interval_count === 1,
  );
  if (found) return found;

  return stripe.prices.create({
    product: product.id,
    unit_amount: unitAmount,
    currency: CURRENCY,
    recurring: { interval: "month" },
  });
}

export async function createMembershipPaymentLink(stripe: Stripe, input: MembershipLinkInput): Promise<MembershipLink> {
  const unitAmount = Math.round(input.monthlyPrice * 100);
  if (!Number.isInteger(unitAmount) || unitAmount < 50) {
    throw new Error("The monthly price is not valid for a payment link.");
  }

  const product = await findOrCreateProduct(stripe, input);
  const price = await findOrCreatePrice(stripe, product, unitAmount);

  const metadata = {
    membership_id: input.membershipId,
    plan: input.planId,
    kind: "founding_membership",
  };

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata,
    // The same details go on the subscription, so later invoice events carry them.
    subscription_data: { metadata, description: `${input.brandName} ${input.planName} membership` },
    after_completion: {
      type: "hosted_confirmation",
      hosted_confirmation: {
        custom_message: `Thank you! Your ${input.brandName} membership payment is set up. We will be in touch to confirm everything.`,
      },
    },
  });

  const url = input.email ? `${link.url}?prefilled_email=${encodeURIComponent(input.email)}` : link.url;
  return { id: link.id, url, priceId: price.id, productId: product.id };
}
