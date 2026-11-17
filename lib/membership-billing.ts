/**
 * What a Stripe event means for a Founding 100 member.
 *
 * Pure and import-free (no Stripe SDK, no database) so every rule can be tested
 * directly with sample events. The webhook turns a Stripe event into a
 * `BillingPlan` here, then a thin server layer applies it.
 *
 * Which membership an event is about is found two ways, because Stripe only
 * tells us some things some of the time:
 *  - `membership_id` in the metadata we put on the payment link and subscription;
 *  - the subscription id, which we store the moment checkout completes.
 */

export type PaymentStatus = "not_started" | "link_sent" | "processing" | "paid" | "past_due" | "ended";

export type StripeEventLike = {
  id?: string;
  type: string;
  /** Unix seconds. */
  created?: number;
  data: { object: any };
};

export type BillingPlan = {
  match: { membershipId?: string; subscriptionId?: string };
  /** Columns to set on the membership row. */
  set: Record<string, unknown>;
  /** Set `first_paid_at` to this, but only if it is still empty. */
  firstPaidAt?: string;
  /** The subscription is over: cancel the membership too. */
  endMembership?: boolean;
  /** The payment link has done its job; stop it being used again. */
  disablePaymentLinkId?: string;
};

const iso = (unixSeconds: unknown): string | undefined =>
  typeof unixSeconds === "number" && Number.isFinite(unixSeconds) ? new Date(unixSeconds * 1000).toISOString() : undefined;

const asId = (value: unknown): string | undefined => {
  if (typeof value === "string" && value) return value;
  // An expanded object carries its own id.
  if (value && typeof value === "object" && typeof (value as { id?: unknown }).id === "string") return (value as { id: string }).id;
  return undefined;
};

function membershipIdFrom(...sources: unknown[]): string | undefined {
  for (const source of sources) {
    const id = (source as { membership_id?: unknown } | null | undefined)?.membership_id;
    if (typeof id === "string" && id) return id;
  }
  return undefined;
}

/**
 * Subscription id and our membership id from an invoice. The API version this
 * project uses nests them under `parent.subscription_details`; older versions
 * put the subscription id at the top, so both are read.
 */
function fromInvoice(invoice: any): { subscriptionId?: string; membershipId?: string } {
  const details = invoice?.parent?.subscription_details;
  return {
    subscriptionId: asId(details?.subscription) ?? asId(invoice?.subscription),
    membershipId: membershipIdFrom(details?.metadata, invoice?.subscription_details?.metadata),
  };
}

export function planBillingUpdate(event: StripeEventLike): BillingPlan | null {
  const object = event?.data?.object;
  if (!object) return null;

  switch (event.type) {
    case "checkout.session.completed": {
      const membershipId = membershipIdFrom(object.metadata);
      // Only our membership links: other checkouts (invoice payment links) are not ours.
      if (!membershipId || object.mode !== "subscription") return null;

      const paid = object.payment_status === "paid";
      const when = iso(event.created) ?? new Date().toISOString();
      const set: Record<string, unknown> = {
        payment_status: paid ? "paid" : "processing",
      };
      const customer = asId(object.customer);
      const subscription = asId(object.subscription);
      if (customer) set.stripe_customer_id = customer;
      if (subscription) set.stripe_subscription_id = subscription;
      if (paid) set.last_paid_at = when;

      return {
        match: { membershipId },
        set,
        ...(paid ? { firstPaidAt: when } : {}),
        ...(asId(object.payment_link) ? { disablePaymentLinkId: asId(object.payment_link) } : {}),
      };
    }

    case "checkout.session.async_payment_failed": {
      const membershipId = membershipIdFrom(object.metadata);
      if (!membershipId || object.mode !== "subscription") return null;
      return { match: { membershipId }, set: { payment_status: "past_due" } };
    }

    case "invoice.paid":
    case "invoice.payment_succeeded": {
      const { subscriptionId, membershipId } = fromInvoice(object);
      if (!subscriptionId && !membershipId) return null;
      // A zero invoice (a credit, a trial) is not a member paying.
      if (typeof object.amount_paid === "number" && object.amount_paid <= 0) return null;

      const paidAt = iso(object.status_transitions?.paid_at) ?? iso(event.created) ?? new Date().toISOString();
      const periodEnd = iso(object.lines?.data?.[0]?.period?.end);
      const set: Record<string, unknown> = { payment_status: "paid", last_paid_at: paidAt };
      if (periodEnd) set.current_period_end = periodEnd;
      if (subscriptionId) set.stripe_subscription_id = subscriptionId;
      const customer = asId(object.customer);
      if (customer) set.stripe_customer_id = customer;

      return { match: { subscriptionId, membershipId }, set, firstPaidAt: paidAt };
    }

    case "invoice.payment_failed": {
      const { subscriptionId, membershipId } = fromInvoice(object);
      if (!subscriptionId && !membershipId) return null;
      return { match: { subscriptionId, membershipId }, set: { payment_status: "past_due" } };
    }

    case "customer.subscription.updated": {
      // Only the trouble states matter here; a recovery arrives as invoice.paid.
      if (object.status !== "past_due" && object.status !== "unpaid") return null;
      const subscriptionId = asId(object.id);
      const membershipId = membershipIdFrom(object.metadata);
      if (!subscriptionId && !membershipId) return null;
      return { match: { subscriptionId, membershipId }, set: { payment_status: "past_due" } };
    }

    case "customer.subscription.deleted": {
      const subscriptionId = asId(object.id);
      const membershipId = membershipIdFrom(object.metadata);
      if (!subscriptionId && !membershipId) return null;
      return { match: { subscriptionId, membershipId }, set: { payment_status: "ended" }, endMembership: true };
    }

    default:
      return null;
  }
}

/** The label the admin sees for a payment status. */
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  not_started: "No payment yet",
  link_sent: "Payment link sent",
  processing: "Payment processing",
  paid: "Paid",
  past_due: "Payment overdue",
  ended: "Subscription ended",
};

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return typeof value === "string" && value in PAYMENT_STATUS_LABEL;
}
