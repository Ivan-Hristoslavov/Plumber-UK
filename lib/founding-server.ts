import { createClient } from "@supabase/supabase-js";

import { buildFoundingConfig, type FoundingConfig } from "@/lib/founding";

/**
 * Membership rows and the Founding 100 settings hold personal data and the
 * prices the application form records, so both tables are locked to the public
 * key (row level security, no policies, privileges revoked). Only the server
 * may touch them, with the service role key — which is why this module must
 * never reach the browser.
 */
export function createMembershipsClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/** Statuses that occupy one of the founding places. */
export const PLACE_TAKING_STATUSES = ["active", "paused"] as const;

/**
 * True when a query failed only because the migration has not been run yet, so
 * callers can say "not set up" instead of reporting a server error.
 */
export function isMissingTableError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /relation .* does not exist|could not find the table/i.test(error.message ?? "")
  );
}

/**
 * True when a query failed only because the billing migration has not been
 * run yet (a column is missing), so callers can say so instead of erroring.
 */
export function isMissingColumnError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    /column .* does not exist|could not find the .* column/i.test(error.message ?? "")
  );
}

/**
 * The live programme configuration: the admin's saved values over the defaults
 * in lib/founding.ts. Never throws and never returns nothing — before the
 * settings table exists, or if the read fails, the site simply runs on defaults.
 */
export async function getFoundingConfig(): Promise<FoundingConfig> {
  try {
    const { data, error } = await createMembershipsClient()
      .from("founding_settings")
      .select("config")
      .eq("id", true)
      .maybeSingle();

    if (error || !data) return buildFoundingConfig(null);
    return buildFoundingConfig(data.config);
  } catch {
    return buildFoundingConfig(null);
  }
}

export type FoundingPlaces = {
  taken: number;
  remaining: number;
  limit: number;
};

/**
 * How many founding places are filled, or null when it cannot be known (the
 * table does not exist yet, or the query failed). Callers treat null as "show
 * nothing" — a wrong number on a launch page is worse than no number.
 */
export async function getFoundingPlaces(limit: number): Promise<FoundingPlaces | null> {
  try {
    const supabase = createMembershipsClient();
    const { count, error } = await supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .in("status", [...PLACE_TAKING_STATUSES]);

    if (error || count === null) return null;

    return {
      taken: count,
      remaining: Math.max(0, limit - count),
      limit,
    };
  } catch {
    return null;
  }
}
