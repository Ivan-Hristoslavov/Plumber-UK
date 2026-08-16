import { createClient } from "@/lib/supabase/server";

export type Availability = {
  available: boolean;
  /** Set only when unavailable — what the admin called the period. */
  reason?: string;
  /** ISO date the team is back, when known. */
  returnsOn?: string;
};

/**
 * Today's date in Europe/London, as YYYY-MM-DD.
 *
 * day_off_periods stores plain dates with no timezone. The server runs in UTC,
 * so comparing against `new Date()` would flip the answer for part of the day
 * during BST — the business is in London, so the business's day is what counts.
 */
function londonToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * The business takes emergency calls around the clock; a day-off period is the
 * only thing that makes that untrue. So availability is the absence of a period
 * covering today, rather than anything derived from working hours (those govern
 * bookable slots, not whether the phone is answered).
 *
 * `show_banner` is deliberately ignored: it controls whether the banner is
 * displayed, not whether anyone is working.
 */
export async function getAvailability(): Promise<Availability> {
  const today = londonToday();

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("day_off_periods")
      .select("title, start_date, end_date")
      .lte("start_date", today)
      .gte("end_date", today)
      .order("end_date", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return { available: true };
    }

    const period = data[0];

    return {
      available: false,
      reason: period.title || undefined,
      returnsOn: period.end_date || undefined,
    };
  } catch {
    // Never claim the business is closed because a query failed.
    return { available: true };
  }
}
