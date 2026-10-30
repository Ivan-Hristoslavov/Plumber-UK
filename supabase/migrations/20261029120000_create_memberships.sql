-- Founding 100 membership applications and members.
--
-- ADDITIVE ONLY: this creates one new table, one index pair, one trigger
-- function and one trigger. It does not alter, drop or read any existing table.
-- Safe to run once on the live database; every statement is guarded so a
-- second run changes nothing.

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),

  -- What was chosen. The price and rate are copied at application time so a
  -- later change to the published plans never rewrites an agreed membership.
  plan text not null check (plan in ('essential', 'priority', 'premium')),
  monthly_price numeric(6, 2) not null,
  labour_rate numeric(6, 2) not null,

  status text not null default 'pending'
    check (status in ('pending', 'active', 'paused', 'declined', 'cancelled')),

  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  postcode text not null,

  marketing_opt_in boolean not null default false,

  -- Proof of what the member agreed to, and when.
  terms_version text not null,
  terms_accepted_at timestamptz not null default now(),

  admin_notes text,
  started_at date,
  cancelled_at date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One open application or live membership per email address.
create unique index if not exists memberships_one_open_per_email
  on public.memberships (lower(email))
  where status in ('pending', 'active', 'paused');

create index if not exists memberships_status_idx
  on public.memberships (status);

create or replace function public.memberships_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function public.memberships_set_updated_at();

-- Personal data. Row level security on with no policies means the public (anon)
-- key can neither read nor write it; only the server, using the service role
-- key, can.
alter table public.memberships enable row level security;

-- Belt and braces: the public roles are given no table privileges either, so
-- the table stays closed even if a policy is ever added by mistake.
revoke all on public.memberships from anon, authenticated;
