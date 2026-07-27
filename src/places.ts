const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.location",
].join(",");

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

/**
 * Text Search returns at most 3 pages of 20 results (60 total) per query.
 * For full city coverage on dense industries, run multiple queries across
 * a geo-grid of sub-areas instead of relying on one query here.
 */
export async function searchPlaces(
  query: string,
  apiKey: string,
): Promise<RawPlace[]> {
  const results: RawPlace[] = [];
  let pageToken: string | undefined;

  do {
    const body: Record<string, unknown> = pageToken
      ? { textQuery: query, pageToken }
      : { textQuery: query };

    const res = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Places API error ${res.status}: ${text}`);
    }

    const data = (await res.json()) as SearchTextResponse;
    results.push(...(data.places ?? []));
    pageToken = data.nextPageToken;

    // Google requires a short delay before a pageToken becomes valid.
    if (pageToken) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  } while (pageToken);

  return results;
}
