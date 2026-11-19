import { NextResponse } from "next/server";

import { getGoogleReviewsResult } from "@/lib/google-reviews-server";

export const dynamic = "force-dynamic";

/**
 * Public: the business's Google rating and newest reviews (all public on
 * Google already), or why there are none. The homepage asks this after it
 * loads, so a change in the admin shows without waiting for the page to be
 * rebuilt. Google itself is asked at most once an hour (see fetchPlaceSummary).
 */
export async function GET() {
  const result = await getGoogleReviewsResult();
  return NextResponse.json(
    { google: result.summary, reason: result.reason, googleStatus: result.googleStatus ?? null },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
  );
}
