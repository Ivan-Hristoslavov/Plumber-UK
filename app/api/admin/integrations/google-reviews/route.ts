import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { requireAdminAuth } from "@/lib/api-auth";
import { isPlaceId, maskKey, searchTextFromInput, type GoogleReviewsConfig } from "@/lib/google-reviews";
import {
  GOOGLE_REVIEWS_TAG,
  GoogleApiError,
  effectiveApiKey,
  fetchPlaceSummary,
  getStoredGoogleConfig,
  saveGoogleConfig,
  searchPlaces,
} from "@/lib/google-reviews-server";

export const dynamic = "force-dynamic";

/** Hosts a pasted Google Maps share link may point at; nothing else is fetched. */
const GOOGLE_LINK_HOSTS = /^(maps\.app\.goo\.gl|goo\.gl|(www\.)?google\.[a-z.]+|maps\.google\.[a-z.]+)$/i;

function status(config: GoogleReviewsConfig, tableReady: boolean) {
  const { key, source } = effectiveApiKey(config);
  return {
    tableReady,
    hasKey: Boolean(key),
    keySource: source,
    keyHint: source === "admin" ? maskKey(config.apiKey) : source === "env" ? "set on the server" : null,
    placeId: config.placeId ?? null,
    placeName: config.placeName ?? null,
    enabled: config.enabled !== false,
  };
}

function fail(error: unknown) {
  if (error instanceof GoogleApiError) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
  console.error("Google reviews admin:", error instanceof Error ? error.message : error);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

/** Current settings, with the key masked. */
export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const { config, tableReady } = await getStoredGoogleConfig();
    return NextResponse.json(status(config, tableReady));
  } catch (error) {
    return fail(error);
  }
}

/**
 * Save. Body fields are all optional:
 *  - apiKey: a new key; "" removes the saved one
 *  - placeId / placeName: the business picked from the search
 *  - enabled: show Google reviews on the site or not
 */
export async function PUT(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const { config, tableReady } = await getStoredGoogleConfig();
    if (!tableReady) {
      return NextResponse.json(
        { error: "Google reviews have not been set up in the database yet.", setupRequired: true },
        { status: 503 },
      );
    }

    const next: GoogleReviewsConfig = { ...config };

    if ("apiKey" in body) {
      if (typeof body.apiKey !== "string" || body.apiKey.length > 200) {
        return NextResponse.json({ error: "The API key is not valid." }, { status: 400 });
      }
      const key = body.apiKey.trim();
      if (key && !/^[A-Za-z0-9_-]{20,200}$/.test(key)) {
        return NextResponse.json({ error: "That does not look like a Google API key." }, { status: 400 });
      }
      if (key) next.apiKey = key;
      else delete next.apiKey;
    }
    if ("placeId" in body) {
      if (body.placeId === null || body.placeId === "") {
        delete next.placeId;
        delete next.placeName;
      } else if (typeof body.placeId === "string" && isPlaceId(body.placeId)) {
        next.placeId = body.placeId.trim();
        next.placeName = typeof body.placeName === "string" ? body.placeName.trim().slice(0, 200) : next.placeName;
      } else {
        return NextResponse.json({ error: "That place is not valid." }, { status: 400 });
      }
    }
    if ("enabled" in body) {
      if (typeof body.enabled !== "boolean") {
        return NextResponse.json({ error: "Please say whether to show Google reviews." }, { status: 400 });
      }
      next.enabled = body.enabled;
    }

    await saveGoogleConfig(next);
    revalidateTag(GOOGLE_REVIEWS_TAG, "max");
    return NextResponse.json(status(next, true));
  } catch (error) {
    return fail(error);
  }
}

/**
 * Actions that call Google:
 *  - { action: "search", query, apiKey? }  find the business (name or Maps link)
 *  - { action: "test" }                    fetch the saved place's rating now
 * A key typed but not yet saved can be passed to "search", so the admin can
 * check it before saving.
 */
export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const { config } = await getStoredGoogleConfig();
    const typedKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
    const key = typedKey || effectiveApiKey(config).key;
    if (!key) return NextResponse.json({ error: "Add the Google API key first." }, { status: 400 });

    if (body.action === "search") {
      if (typeof body.query !== "string" || !body.query.trim() || body.query.length > 500) {
        return NextResponse.json({ error: "Type the business name or paste its Google Maps link." }, { status: 400 });
      }
      let input = body.query.trim();

      // A Place ID pasted directly: look it up instead of searching.
      if (isPlaceId(input) && input.startsWith("ChIJ")) {
        const summary = await fetchPlaceSummary(key, input, { fresh: true });
        return NextResponse.json({
          candidates: summary
            ? [{ placeId: summary.placeId, name: summary.name, address: "", rating: summary.rating, count: summary.count }]
            : [],
        });
      }

      // Short share links (maps.app.goo.gl/…) only reveal the business after
      // following the redirect. Only Google's own hosts are ever fetched.
      if (/^https?:\/\//i.test(input)) {
        let url: URL;
        try {
          url = new URL(input);
        } catch {
          return NextResponse.json({ error: "That link is not valid." }, { status: 400 });
        }
        if (!GOOGLE_LINK_HOSTS.test(url.hostname)) {
          return NextResponse.json({ error: "Paste a Google Maps link, or type the business name." }, { status: 400 });
        }
        if (/goo\.gl$/i.test(url.hostname)) {
          const followed = await fetch(url, { redirect: "follow", cache: "no-store" });
          input = followed.url;
        }
      }

      const candidates = await searchPlaces(key, searchTextFromInput(input));
      return NextResponse.json({ candidates });
    }

    if (body.action === "test") {
      if (!config.placeId) return NextResponse.json({ error: "Choose the business first." }, { status: 400 });
      const summary = await fetchPlaceSummary(key, config.placeId, { fresh: true });
      return NextResponse.json({
        name: summary?.name ?? config.placeName ?? "",
        rating: summary?.rating ?? null,
        count: summary?.count ?? 0,
        reviews: summary?.reviews.length ?? 0,
      });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    return fail(error);
  }
}
