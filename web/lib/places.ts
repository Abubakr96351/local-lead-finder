const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const DETAILS_URL = "https://places.googleapis.com/v1/places";

/**
 * Text Search bills per request, not per result — one request already covers
 * up to 20 places for a flat fee, so rating/userRatingCount (a small tier
 * upgrade over the base contact fields) are cheap to bundle for the whole
 * result set. The genuinely per-place expensive resource is the `reviews`
 * array (Enterprise+Atmosphere tier), fetched separately via
 * getPlaceReviews() — and only for leads that need it. See that function.
 */
const SEARCH_FIELD_MASK = [
  "nextPageToken",
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.businessStatus",
  "places.location",
  "places.rating",
  "places.userRatingCount",
].join(",");

const REVIEWS_FIELD_MASK = "reviews";

export interface RawPlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  location?: { latitude: number; longitude: number };
}

interface SearchTextResponse {
  places?: RawPlace[];
  nextPageToken?: string;
}

export interface PlacesSearchResult {
  places: RawPlace[];
  requestCount: number;
}

/**
 * Text Search returns at most 3 pages of 20 results (60 total) per query.
 * Full city coverage on dense industries needs a geo-grid of sub-area queries
 * instead of relying on one query here — not needed at personal-use volumes yet.
 */
export async function searchPlaces(
  query: string,
  apiKey: string,
  maxResults: number,
): Promise<PlacesSearchResult> {
  const results: RawPlace[] = [];
  let pageToken: string | undefined;
  let requestCount = 0;

  do {
    const body: Record<string, unknown> = pageToken
      ? { textQuery: query, pageToken }
      : { textQuery: query };

    const res = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": SEARCH_FIELD_MASK,
      },
      body: JSON.stringify(body),
    });
    requestCount += 1;

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Places API error ${res.status}: ${text}`);
    }

    const data = (await res.json()) as SearchTextResponse;
    results.push(...(data.places ?? []));
    pageToken = results.length < maxResults ? data.nextPageToken : undefined;

    if (pageToken) {
      // Google requires a short delay before a pageToken becomes valid.
      await new Promise((r) => setTimeout(r, 2000));
    }
  } while (pageToken);

  return { places: results.slice(0, maxResults), requestCount };
}

export interface RawReview {
  rating?: number;
  publishTime?: string;
}

/**
 * The genuinely per-place expensive fetch. Only call this for leads that
 * pass the cheap first filter (has a reachable website — no_website and
 * broken_website leads are already slam-dunk leads regardless of reviews, so
 * spending a per-place call on them would be pure waste).
 */
export async function getPlaceReviews(
  placeId: string,
  apiKey: string,
): Promise<RawReview[]> {
  const res = await fetch(`${DETAILS_URL}/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": REVIEWS_FIELD_MASK,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Places API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { reviews?: RawReview[] };
  return data.reviews ?? [];
}

/** Rough Places API Text Search cost, Enterprise-tier field mask (incl. rating/reviewCount), per request. */
export const EST_COST_PER_SEARCH_REQUEST_USD = 0.032;
/** Rough Place Details cost, per individual place, for the reviews array (Enterprise+Atmosphere tier). */
export const EST_COST_PER_REVIEWS_DETAILS_USD = 0.025;
