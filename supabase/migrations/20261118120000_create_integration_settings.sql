-- Server-only settings for outside services, edited from Admin -> Settings ->
-- Integrations. First use: the Google Places API key and the business's Google
-- place, so the site can show its Google rating and reviews.
--
-- ADDITIVE ONLY: creates one new table. It does not alter, drop or read any
-- existing table. Safe to run twice.
--
-- Why not admin_settings: the public (anon) key can read that table, and an API
-- key stored there would be visible to anyone. This table is locked to the
-- server (service role) like memberships and founding_settings.

create table if not exists public.integration_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.integration_settings enable row level security;
revoke all on public.integration_settings from anon, authenticated;
