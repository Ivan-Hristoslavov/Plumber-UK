-- Stripe billing for Founding 100 members: which payment link was sent, the
-- Stripe customer and subscription, and when the member first and last paid.
--
-- ADDITIVE ONLY: adds columns to public.memberships, which the memberships
-- migration (20261029120000) creates, so run that one first. Every column is
-- either nullable or has a default, so existing rows (there are none yet) and
-- the application form keep working unchanged. Safe to run twice.

alter table public.memberships
  add column if not exists payment_status text not null default 'not_started',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_payment_link_id text,
  add column if not exists payment_link_url text,
  add column if not exists payment_link_sent_at timestamptz,
  add column if not exists first_paid_at timestamptz,
  add column if not exists last_paid_at timestamptz,
  add column if not exists current_period_end timestamptz;

-- Where the money side stands, separate from the membership status:
--   not_started  no payment link yet
--   link_sent    the member has been sent a Stripe payment link
--   processing   checkout finished but the money has not cleared (Direct Debit)
--   paid         the latest invoice was paid
--   past_due     a payment failed
--   ended        the subscription is over
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'memberships_payment_status_check') then
    alter table public.memberships
      add constraint memberships_payment_status_check
      check (payment_status in ('not_started', 'link_sent', 'processing', 'paid', 'past_due', 'ended'));
  end if;
end
$$;

-- A Stripe subscription belongs to exactly one membership.
create unique index if not exists memberships_stripe_subscription_idx
  on public.memberships (stripe_subscription_id)
  where stripe_subscription_id is not null;
