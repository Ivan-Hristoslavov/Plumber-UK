import type Stripe from "stripe";

import { type BillingAction, type BillingDetails, buildSteps, isRunning, refundable } from "@/lib/membership-billing-admin";
import { stripe } from "@/lib/stripe";

export type BillingMember = {
  id: string;
  status: string;
  created_at: string;
  started_at?: string | null;
  cancelled_at?: string | null;
  payment_link_sent_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
};

/** A problem the admin can be told about as it is. */
export class BillingRequestError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

const idOf = (value: string | { id: string } | null | undefined) => (typeof value === "string" ? value : (value?.id ?? null));

function client(): Stripe {
  if (!stripe) throw new BillingRequestError("Stripe is not set up on this server yet.", 503);
  return stripe;
}

function periodEnd(subscription: Stripe.Subscription): number | null {
  // Newer API versions keep the period on the item, older ones on the subscription.
  return (
    subscription.items?.data?.[0]?.current_period_end ??
    (subscription as unknown as { current_period_end?: number }).current_period_end ??
    null
  );
}

/** Everything is read from Stripe at the moment of asking, so it is never out of date. */
export async function getBillingDetails(member: BillingMember): Promise<BillingDetails> {
  const api = client();

  const [subscription, charges] = await Promise.all([
    member.stripe_subscription_id ? api.subscriptions.retrieve(member.stripe_subscription_id) : null,
    member.stripe_customer_id ? api.charges.list({ customer: member.stripe_customer_id, limit: 100 }) : null,
  ]);
  const withRefunds = (charges?.data ?? []).filter((charge) => charge.amount_refunded > 0 || charge.refunded);
  const refundLists = await Promise.all(withRefunds.map((charge) => api.refunds.list({ charge: charge.id, limit: 100 })));

  const details = {
    subscription: subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          created: subscription.created,
          periodEnd: periodEnd(subscription),
          cancelAtPeriodEnd: subscription.cancel_at_period_end || subscription.cancel_at !== null,
          canceledAt: subscription.canceled_at,
          endedAt: subscription.ended_at,
          paused: subscription.pause_collection !== null,
          live: subscription.livemode,
        }
      : null,
    charges: (charges?.data ?? []).map((charge) => {
      const card = charge.payment_method_details?.card;
      return {
        id: charge.id,
        amount: charge.amount,
        refunded: charge.amount_refunded,
        currency: charge.currency,
        status: charge.status,
        failure: charge.failure_message,
        disputed: charge.disputed,
        card: card ? `${card.brand} •••• ${card.last4}` : (charge.payment_method_details?.type ?? null),
        receiptUrl: charge.receipt_url,
        created: charge.created,
      };
    }),
    refunds: refundLists.flatMap((list, index) =>
      list.data.map((refund) => ({
        id: refund.id,
        chargeId: withRefunds[index].id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status ?? "pending",
        created: refund.created,
      })),
    ),
  };

  const live = subscription?.livemode ?? charges?.data[0]?.livemode ?? false;
  return {
    ...details,
    steps: buildSteps(member, details),
    dashboardUrl: member.stripe_customer_id
      ? `https://dashboard.stripe.com/${live ? "" : "test/"}customers/${member.stripe_customer_id}`
      : null,
  };
}

async function runningSubscription(api: Stripe, member: BillingMember): Promise<Stripe.Subscription> {
  if (!member.stripe_subscription_id) throw new BillingRequestError("This member has no subscription in Stripe.", 409);
  const subscription = await api.subscriptions.retrieve(member.stripe_subscription_id);
  if (!isRunning(subscription)) throw new BillingRequestError("The subscription has already ended in Stripe.", 409);
  return subscription;
}

/** Refund (all of what is left, or part) of one of this member's own payments. */
async function refund(api: Stripe, member: BillingMember, input: { chargeId: string; amount: number; requestId: string }) {
  const charge = await api.charges.retrieve(input.chargeId);
  if (!member.stripe_customer_id || idOf(charge.customer) !== member.stripe_customer_id) {
    throw new BillingRequestError("That payment does not belong to this member.", 404);
  }
  const left = refundable({
    status: charge.status,
    amount: charge.amount,
    refunded: charge.amount_refunded,
    disputed: charge.disputed,
  });
  if (left === 0) throw new BillingRequestError("There is nothing left to refund on this payment.", 409);
  if (input.amount > left) throw new BillingRequestError("That is more than is left to refund on this payment.", 409);

  await api.refunds.create(
    { charge: charge.id, amount: input.amount, reason: "requested_by_customer", metadata: { membership_id: member.id } },
    // A double click or a retry sends the same id, and Stripe refunds once.
    { idempotencyKey: `membership-refund-${member.id}-${input.requestId}` },
  );
}

export async function runBillingAction(
  member: BillingMember,
  action: BillingAction,
  input: { chargeId?: unknown; amount?: unknown; requestId?: unknown },
): Promise<void> {
  const api = client();

  if (action === "refund") {
    const { chargeId, amount, requestId } = input;
    if (typeof chargeId !== "string" || !/^(ch|py)_\w+$/.test(chargeId)) throw new BillingRequestError("Choose a payment to refund.");
    if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) throw new BillingRequestError("Enter a valid amount.");
    if (typeof requestId !== "string" || !/^[\w-]{8,64}$/.test(requestId)) throw new BillingRequestError("Invalid request.");
    return refund(api, member, { chargeId, amount, requestId });
  }

  const subscription = await runningSubscription(api, member);
  switch (action) {
    case "cancel_at_period_end":
      await api.subscriptions.update(subscription.id, { cancel_at_period_end: true });
      return;
    case "keep":
      await api.subscriptions.update(subscription.id, { cancel_at_period_end: false });
      return;
    case "cancel_now":
      await api.subscriptions.cancel(subscription.id);
      return;
    case "pause":
      // Invoices raised while paused are voided, so nothing is collected later for them.
      await api.subscriptions.update(subscription.id, { pause_collection: { behavior: "void" } });
      return;
    case "resume":
      await api.subscriptions.update(subscription.id, { pause_collection: "" });
      return;
  }
}

/** Stop Stripe charging a member whose membership has just been cancelled. */
export async function stopSubscription(member: BillingMember): Promise<void> {
  if (!member.stripe_subscription_id) return;
  const api = client();
  const subscription = await api.subscriptions.retrieve(member.stripe_subscription_id);
  if (isRunning(subscription)) await api.subscriptions.cancel(subscription.id);
}

export function describeBillingError(error: unknown): { status: number; message: string } {
  if (error instanceof BillingRequestError) return { status: error.status, message: error.message };
  const code = (error as { code?: string } | null)?.code;
  if (code === "resource_missing") {
    return {
      status: 409,
      message: "This member was not found in the connected Stripe account. The keys may be for a different account, or for test instead of live.",
    };
  }
  if (code === "charge_already_refunded") return { status: 409, message: "This payment has already been refunded." };
  return { status: 502, message: "Stripe could not be reached or refused the request. Please try again." };
}
