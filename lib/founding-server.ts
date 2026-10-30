import { createClient } from "@supabase/supabase-js";

import { FOUNDING_LIMIT } from "@/lib/founding";

/**
 * Membership rows hold personal data, so the table is locked to the public key
 * (row level security, no policies). Only the server may touch it, with the
 * service role key — which is why this module must never reach the browser.
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
export async function getFoundingPlaces(): Promise<FoundingPlaces | null> {
  try {
    const supabase = createMembershipsClient();
    const { count, error } = await supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .in("status", [...PLACE_TAKING_STATUSES]);

    if (error || count === null) return null;

    return {
      taken: count,
      remaining: Math.max(0, FOUNDING_LIMIT - count),
      limit: FOUNDING_LIMIT,
    };
  } catch {
    return null;
  }
}
