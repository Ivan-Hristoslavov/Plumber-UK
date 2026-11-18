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
 * Re-asked from Google at most once an hour. That keeps a busy homepage within
 * the Places API free monthly allowance (about 720 calls a month) while the
 * rating and newest reviews stay current.
 */
const REVALIDATE_SECONDS = 3600;

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
    body: JSON.stringify({ textQuery, regionCode: "GB", languageCode: "en" }),
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
 * For the public pages. Never throws: Google being down, a wrong key or a
 * missing table just means the site shows its own reviews alone.
 */
export async function getGoogleReviewsSummary(): Promise<GoogleReviewsSummary | null> {
  try {
    const { config } = await getStoredGoogleConfig();
    if (config.enabled === false || !config.placeId) return null;
    const { key } = effectiveApiKey(config);
    if (!key) return null;
    return await fetchPlaceSummary(key, config.placeId);
  } catch (error) {
    console.error("Google reviews unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}
