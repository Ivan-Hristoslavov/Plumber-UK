/**
 * What the admin sees about a member's money: every step from the application
 * to the last refund, and what can still be done. Pure (types and rules only),
 * so it can be used in the browser and tested without Stripe.
 */

export type BillingCharge = {
  id: string;
  amount: number; // pence
  refunded: number; // pence
  currency: string;
  status: "succeeded" | "pending" | "failed";
  failure: string | null;
  disputed: boolean;
  card: string | null;
  receiptUrl: string | null;
  created: number;
};

export type BillingRefund = {
  id: string;
  chargeId: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
};

export type BillingSubscription = {
  id: string;
  status: string;
  created: number;
  periodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: number | null;
  endedAt: number | null;
  paused: boolean;
  live: boolean;
};

export type BillingDetails = {
  subscription: BillingSubscription | null;
  charges: BillingCharge[];
  refunds: BillingRefund[];
  steps: BillingStep[];
  dashboardUrl: string | null;
};

export type BillingStep = { at: string; title: string; detail?: string; tone: "info" | "good" | "bad"; /** Only the day is known. */ dayOnly?: boolean };

export const BILLING_ACTIONS = ["refund", "cancel_at_period_end", "keep", "cancel_now", "pause", "resume"] as const;
export type BillingAction = (typeof BILLING_ACTIONS)[number];
export const isBillingAction = (value: unknown): value is BillingAction => BILLING_ACTIONS.includes(value as BillingAction);

export const formatMoney = (minor: number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: currency.toUpperCase() }).format(minor / 100);

/** Still running, so Stripe will try to take money again. */
export const isRunning = (subscription: Pick<BillingSubscription, "status"> | null) =>
  !!subscription && !["canceled", "incomplete_expired"].includes(subscription.status);

/** Pence that can still be refunded on a charge. */
export const refundable = (charge: Pick<BillingCharge, "status" | "amount" | "refunded" | "disputed">) =>
  charge.status === "succeeded" && !charge.disputed ? Math.max(0, charge.amount - charge.refunded) : 0;

/** Pounds typed by the admin ("5", "5.50") to pence, or null when it is not a valid amount. */
export function parseAmount(value: string): number | null {
  const text = value.trim();
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(text)) return null;
  const pence = Math.round(Number(text) * 100);
  return pence > 0 ? pence : null;
}

export function buildSteps(
  member: {
    created_at: string;
    started_at?: string | null;
    cancelled_at?: string | null;
    payment_link_sent_at?: string | null;
    status: string;
  },
  details: Pick<BillingDetails, "subscription" | "charges" | "refunds">,
): BillingStep[] {
  const iso = (seconds: number) => new Date(seconds * 1000).toISOString();
  const steps: BillingStep[] = [{ at: member.created_at, title: "Application received", tone: "info" }];

  if (member.payment_link_sent_at) steps.push({ at: member.payment_link_sent_at, title: "Payment link created", tone: "info" });

  if (member.started_at) steps.push({ at: member.started_at, title: "Accepted, membership start date", tone: "good", dayOnly: true });
  if (member.cancelled_at) steps.push({ at: member.cancelled_at, title: "Membership cancelled", tone: "bad", dayOnly: true });

  const { subscription, charges, refunds } = details;
  if (subscription) {
    steps.push({ at: iso(subscription.created), title: "Subscription started in Stripe", tone: "good" });
    if (subscription.canceledAt) {
      steps.push({
        at: iso(subscription.canceledAt),
        title: subscription.endedAt ? "Subscription cancelled" : "Cancellation scheduled",
        detail: !subscription.endedAt && subscription.periodEnd ? `Ends ${iso(subscription.periodEnd).slice(0, 10)}` : undefined,
        tone: "bad",
      });
    }
    if (subscription.endedAt && subscription.endedAt !== subscription.canceledAt) {
      steps.push({ at: iso(subscription.endedAt), title: "Subscription ended", tone: "bad" });
    }
  }

  for (const charge of charges) {
    const money = formatMoney(charge.amount, charge.currency);
    if (charge.status === "failed") {
      steps.push({ at: iso(charge.created), title: `Payment of ${money} failed`, detail: charge.failure ?? undefined, tone: "bad" });
    } else {
      steps.push({
        at: iso(charge.created),
        title: charge.status === "pending" ? `Payment of ${money} is processing` : `Payment of ${money} received`,
        detail: [charge.card, charge.disputed ? "Disputed by the customer's bank" : null].filter(Boolean).join(" · ") || undefined,
        tone: charge.disputed ? "bad" : charge.status === "pending" ? "info" : "good",
      });
    }
  }

  for (const refund of refunds) {
    const failed = refund.status === "failed" || refund.status === "canceled";
    steps.push({
      at: iso(refund.created),
      title: `Refund of ${formatMoney(refund.amount, refund.currency)}${failed ? " did not go through" : ""}`,
      detail: refund.status === "pending" ? "On its way" : undefined,
      tone: failed ? "bad" : "info",
    });
  }

  return steps.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}
