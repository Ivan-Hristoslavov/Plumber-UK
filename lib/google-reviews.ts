/**
 * Google rating and reviews for the business, from the Places API (New).
 *
 * Import-free so the shaping rules can be unit-tested without a network. The
 * calls themselves live in google-reviews-server.ts.
 */

export type GoogleReview = {
  id: string;
  authorName: string;
  authorUrl: string | null;
  authorPhoto: string | null;
  rating: number;
  text: string;
  /** As Google words it ("2 weeks ago"); Google asks for this rather than a date. */
  relativeTime: string;
  publishTime: string | null;
};

export type GoogleReviewsSummary = {
  placeId: string;
  name: string;
  rating: number | null;
  count: number;
  mapsUrl: string | null;
  /** Opens Google's own "write a review" box for this place. */
  writeReviewUrl: string;
  reviews: GoogleReview[];
};

export type GooglePlaceCandidate = {
  placeId: string;
  name: string;
  address: string;
  rating: number | null;
  count: number;
};

/** What Admin -> Integrations stores. */
export type GoogleReviewsConfig = {
  apiKey?: string;
  placeId?: string;
  placeName?: string;
  enabled?: boolean;
};

const PLACE_ID = /^[A-Za-z0-9_-]{10,300}$/;

export function isPlaceId(value: string): boolean {
  return PLACE_ID.test(value.trim()) && !value.includes(" ");
}

export function writeReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

/** Last four characters only, so the admin can tell which key is saved. */
export function maskKey(key: string | undefined | null): string | null {
  if (!key) return null;
  return `••••${key.slice(-4)}`;
}

/**
 * Turns what the admin pastes into something to search for. A Google Maps
 * link such as ".../maps/place/FixMyLeak/@51.4,-0.1,..." gives the business
 * name; anything else is used as typed ("FixMyLeak Clapham").
 */
export function searchTextFromInput(input: string): string {
  const value = input.trim();
  const fromPath = value.match(/\/maps\/place\/([^/@?]+)/);
  if (fromPath) {
    try {
      return decodeURIComponent(fromPath[1].replace(/\+/g, " ")).trim();
    } catch {
      return fromPath[1].replace(/\+/g, " ").trim();
    }
  }
  const fromQuery = value.match(/[?&]q=([^&]+)/);
  if (fromQuery && /google\./.test(value)) {
    try {
      return decodeURIComponent(fromQuery[1].replace(/\+/g, " ")).trim();
    } catch {
      return fromQuery[1].trim();
    }
  }
  return value;
}

type RawReview = {
  name?: string;
  rating?: number;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

type RawPlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: RawReview[];
};

const asNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/** Shapes a Place Details response; drops reviews with no text or rating. */
export function toSummary(raw: unknown, fallbackPlaceId: string): GoogleReviewsSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const place = raw as RawPlace;
  const placeId = place.id || fallbackPlaceId;

  const reviews: GoogleReview[] = (place.reviews ?? [])
    .map((review, index): GoogleReview | null => {
      const text = (review.text?.text ?? review.originalText?.text ?? "").trim();
      const rating = asNumber(review.rating);
      if (!text || rating === null) return null;
      return {
        id: review.name || `${placeId}-${index}`,
        authorName: review.authorAttribution?.displayName?.trim() || "Google user",
        authorUrl: review.authorAttribution?.uri || null,
        authorPhoto: review.authorAttribution?.photoUri || null,
        rating,
        text,
        relativeTime: review.relativePublishTimeDescription || "",
        publishTime: review.publishTime || null,
      };
    })
    .filter((review): review is GoogleReview => review !== null);

  return {
    placeId,
    name: place.displayName?.text || "",
    rating: asNumber(place.rating),
    count: asNumber(place.userRatingCount) ?? 0,
    mapsUrl: place.googleMapsUri || null,
    writeReviewUrl: writeReviewUrl(placeId),
    reviews,
  };
}

/** Shapes a Text Search response into a short list to pick from. */
export function toCandidates(raw: unknown): GooglePlaceCandidate[] {
  const places = (raw as { places?: RawPlace[] } | null)?.places ?? [];
  return places
    .filter((place) => place.id)
    .slice(0, 5)
    .map((place) => ({
      placeId: place.id!,
      name: place.displayName?.text || "",
      address: place.formattedAddress || "",
      rating: asNumber(place.rating),
      count: asNumber(place.userRatingCount) ?? 0,
    }));
}
