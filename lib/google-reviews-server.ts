import { createMembershipsClient, isMissingTableError } from "@/lib/founding-server";
import {
  type GooglePlaceCandidate,
  type GoogleReviewsConfig,
  type GoogleReviewsSummary,
  toCandidates,
  toSummary,
} from "@/lib/google-reviews";

/**
 * Server-only: reads the API key, so this module must never reach the browser.
 *
 * The key and the chosen place are stored in the locked integration_settings
 * table (Admin -> Settings -> Integrations). GOOGLE_PLACES_API_KEY in the
 * environment works too, as a fallback when nothing is saved there.
 */

const SETTINGS_KEY = "google_reviews";
const PLACES = "https://places.googleapis.com/v1";
export const GOOGLE_REVIEWS_TAG = "google-reviews";

/**
 * Re-asked from Google at most every six hours (four times a day), however many
 * people visit: visitors only ever see the saved answer. That is about 120
 * calls a month per deployment (preview and live together about 240), well
 * inside the Places API free allowance of about 1,000 a month, so showing
 * Google reviews costs nothing. "Test connection" in the admin always asks
 * Google fresh.
 */
const REVALIDATE_SECONDS = 6 * 60 * 60;

export class GoogleApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type StoredGoogleConfig = {
  config: GoogleReviewsConfig;
  tableReady: boolean;
};

export async function getStoredGoogleConfig(): Promise<StoredGoogleConfig> {
  const supabase = createMembershipsClient();
  const { data, error } = await supabase
    .from("integration_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) return { config: {}, tableReady: false };
    throw new Error(`integration_settings: ${error.code} ${error.message}`);
  }
  const value = (data?.value ?? {}) as GoogleReviewsConfig;
  return { config: typeof value === "object" && value ? value : {}, tableReady: true };
}

export async function saveGoogleConfig(config: GoogleReviewsConfig): Promise<void> {
  const supabase = createMembershipsClient();
  const { error } = await supabase
    .from("integration_settings")
    .upsert({ key: SETTINGS_KEY, value: config, updated_at: new Date().toISOString() });
  if (error) throw new Error(`integration_settings: ${error.code} ${error.message}`);
}

/** The key to use: the one saved in the admin, else the environment's. */
export function effectiveApiKey(config: GoogleReviewsConfig): { key: string | null; source: "admin" | "env" | null } {
  if (config.apiKey) return { key: config.apiKey, source: "admin" };
  const env = process.env.GOOGLE_PLACES_API_KEY?.trim();
  return env ? { key: env, source: "env" } : { key: null, source: null };
}

async function googleError(response: Response): Promise<GoogleApiError> {
  let message = `Google answered ${response.status}.`;
  try {
    const body = (await response.json()) as { error?: { message?: string; status?: string } };
    if (body.error?.message) message = body.error.message;
  } catch {
    // keep the generic message
  }
  if (response.status === 403) {
    message = `${message} Check that "Places API (New)" is enabled for this key and that billing is on.`;
  }
  return new GoogleApiError(message, response.status);
}

export async function searchPlaces(apiKey: string, textQuery: string): Promise<GooglePlaceCandidate[]> {
  const response = await fetch(`${PLACES}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount",
    },
    // includePureServiceAreaBusinesses: businesses that serve an area without a
    // public address (FixMyLeak is one) are left out of search unless asked
    // for, which made the admin pick a different, nearby business by mistake.
    body: JSON.stringify({ textQuery, regionCode: "GB", languageCode: "en", includePureServiceAreaBusinesses: true }),
    cache: "no-store",
  });
  if (!response.ok) throw await googleError(response);
  return toCandidates(await response.json());
}

export async function fetchPlaceSummary(
  apiKey: string,
  placeId: string,
  options: { fresh?: boolean } = {},
): Promise<GoogleReviewsSummary | null> {
  const response = await fetch(`${PLACES}/places/${encodeURIComponent(placeId)}?languageCode=en`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,googleMapsUri,reviews",
    },
    ...(options.fresh
      ? { cache: "no-store" as const }
      : { next: { revalidate: REVALIDATE_SECONDS, tags: [GOOGLE_REVIEWS_TAG] } }),
  });
  if (!response.ok) throw await googleError(response);
  return toSummary(await response.json(), placeId);
}

/**
 * Why there is no Google data, in words safe to show publicly (never the key).
 * Lets the public endpoint say what is wrong on a deployment we cannot log in to.
 */
export type GoogleReviewsReason =
  | "no_server_key"
  | "settings_table_missing"
  | "settings_unreadable"
  | "disabled"
  | "no_place"
  | "no_api_key"
  | "google_error"
  | "no_data";

export type GoogleReviewsResult = {
  summary: GoogleReviewsSummary | null;
  reason: GoogleReviewsReason | null;
  /** Google's HTTP status when reason is google_error. */
  googleStatus?: number;
};

/** Never throws: Google down, a wrong key or a missing table just mean "no Google data". */
export async function getGoogleReviewsResult(): Promise<GoogleReviewsResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { summary: null, reason: "no_server_key" };
  }

  let config: GoogleReviewsConfig;
  try {
    const stored = await getStoredGoogleConfig();
    if (!stored.tableReady) return { summary: null, reason: "settings_table_missing" };
    config = stored.config;
  } catch (error) {
    console.error("Google reviews: settings unreadable:", error instanceof Error ? error.message : error);
    return { summary: null, reason: "settings_unreadable" };
  }

  if (config.enabled === false) return { summary: null, reason: "disabled" };
  if (!config.placeId) return { summary: null, reason: "no_place" };
  const { key } = effectiveApiKey(config);
  if (!key) return { summary: null, reason: "no_api_key" };

  try {
    const summary = await fetchPlaceSummary(key, config.placeId);
    return summary ? { summary, reason: null } : { summary: null, reason: "no_data" };
  } catch (error) {
    console.error("Google reviews unavailable:", error instanceof Error ? error.message : error);
    return {
      summary: null,
      reason: "google_error",
      googleStatus: error instanceof GoogleApiError ? error.status : undefined,
    };
  }
}

/** For the public pages: the summary alone. */
export async function getGoogleReviewsSummary(): Promise<GoogleReviewsSummary | null> {
  return (await getGoogleReviewsResult()).summary;
}
