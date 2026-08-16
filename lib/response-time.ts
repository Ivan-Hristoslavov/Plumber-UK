/**
 * The admin `response_time` field is free text and has been entered in several
 * shapes over time — "45", "45 minutes", "45 Minutes Response Time". Everything
 * downstream (titles, meta descriptions, hero copy) wants just the number, so
 * pull the first integer out rather than trying to strip known suffixes.
 */
export function responseTimeMinutes(
  raw: string | null | undefined,
  fallback = "45"
): string {
  return raw?.match(/\d+/)?.[0] || fallback;
}
