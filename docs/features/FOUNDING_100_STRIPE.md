# Founding 100 — monthly payments with Stripe

Members pay a monthly Stripe subscription. The plumber accepts an application in
**Admin → Memberships**, which creates a Stripe payment link for the member's plan
and fee and (optionally) emails it. When the first payment is taken Stripe tells
the site through the webhook, and the member's card shows **Paid**.

Everything below is for **test mode** first. Nothing here touches live money until
live keys are set on the server.

## What you must set up in Stripe (test mode)

1. **Webhook events.** Developers → Webhooks → your endpoint
   (`https://<site>/api/webhooks/stripe`) must be subscribed to these events, in
   addition to the ones it already has. Without them membership payments never
   reach the site:
   - `checkout.session.completed`
   - `checkout.session.async_payment_failed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
2. **Customer portal** (lets members cancel or change their card without calling).
   Settings → Billing → Customer portal → turn it on, allow cancelling
   subscriptions, then copy the portal login link into the environment variable
   `STRIPE_CUSTOMER_PORTAL_URL` (it must start with `https://`). It is added to
   the member emails when set.
3. **Payment methods.** Settings → Payment methods: cards are on by default. Turn
   on **Bacs Direct Debit** if you want to offer it. Payment links use whatever is
   enabled here.

## Database

Run the migrations in this order in the Supabase SQL Editor (each is additive):

1. `20261029120000_create_memberships.sql`
2. `20261030100000_create_founding_settings.sql`
3. `20261101100000_add_billing_to_memberships.sql`

Until the third one is run the admin shows "Payments are not set up yet" and
payment links are switched off; accepting members still works.

## How the pieces fit

- `lib/stripe-membership.ts` — creates one Stripe product per plan, one recurring
  monthly price per fee (reused), and the payment link. The membership id is
  written on the link and the subscription.
- `lib/membership-billing.ts` — pure rules: which Stripe event means "paid",
  "overdue" or "cancelled" for which member. Unit-tested.
- `lib/membership-billing-server.ts` — applies those changes to the database.
- `app/api/webhooks/stripe/route.ts` — membership events are handled first and
  never reach the invoice/booking payment handlers.
- `app/api/admin/memberships/[id]/payment-link` — "Send payment link".

## Good to know

- A price change in Settings applies to **new** applications. Members keep the
  fee they applied at, and their Stripe price does not change.
- A used payment link is switched off so it cannot start a second subscription.
- When a subscription ends in Stripe (the member cancelled in the portal) the
  membership is marked cancelled automatically.
- The existing `payment_intent.succeeded` handling still runs for these
  payments: if the Stripe customer's email matches a row in `customers`, a
  `payments` record is created, so monthly fees appear in Admin → Payments.

## Going live

Only after a full test with Stripe's test cards: set the live keys and a live
webhook (with the same events) on the server, and have a solicitor review clause 3
of the terms (payment through Stripe, card or Direct Debit).
