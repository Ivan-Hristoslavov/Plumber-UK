-- Editable Founding 100 settings: plan prices and hourly rates, the number of
-- places, whether a plan can be joined, and the two opening-hours details the
-- terms need. One row, edited from the admin panel.
--
-- ADDITIVE ONLY: creates one new table and inserts one row into it. It does not
-- alter, drop or read any existing table. Independent of the memberships
-- migration (20261029120000), so the two can be run in either order.
--
-- Why a new table instead of admin_settings: the public (anon) key can write to
-- admin_settings, and a visitor could then change the prices the application
-- form records. This table is locked to the server like memberships is.

create table if not exists public.founding_settings (
  id boolean primary key default true check (id),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- The single row. An empty config means "use the defaults built into the site".
insert into public.founding_settings (id) values (true)
  on conflict (id) do nothing;

alter table public.founding_settings enable row level security;
revoke all on public.founding_settings from anon, authenticated;
