import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import pLimit from "p-limit";
import {
  searchPlaces,
  getPlaceReviews,
  EST_COST_PER_SEARCH_REQUEST_USD,
  EST_COST_PER_REVIEWS_DETAILS_USD,
} from "@/lib/places";
import { inspectWebsite } from "@/lib/siteInspector";
import {
  scoreLead,
  buildScoredFields,
  needsReviewsCheck,
  recentNegativeReviewFlagFor,
  type ScoredLead,
} from "@/lib/score";
import { prisma } from "@/lib/prisma";
import { normalize } from "@/lib/searchCache";

// Each concurrent tab is another full page load competing for the same
// function's memory ceiling, so keep serverless Chromium's fan-out modest.
const INSPECT_CONCURRENCY = process.env.VERCEL ? 1 : 4;
const REVIEWS_CONCURRENCY = 5;

export interface RunSearchParams {
  industry: string;
  city: string;
  country: string;
  resultCount: number;
}

export interface RunSearchProgress {
  phase: "sites" | "reviews";
  checked: number;
  total: number;
}

export interface RunSearchResult {
  searchId: string;
  leads: ScoredLead[];
  estCostUsd: number;
  placesApiRequests: number;
}

/** Core scrape → inspect → score → persist pipeline, shared by the streaming
 *  Scraper page (api/search) and Radar's manual "Scan now" (api/radar/[id]/scan).
 *  `onProgress` is optional so Radar can call this without wiring up SSE. */
export async function runSearch(
  params: RunSearchParams,
  onProgress?: (progress: RunSearchProgress) => void,
  onFound?: (total: number) => void,
): Promise<RunSearchResult> {
  const { industry, city, country, resultCount } = params;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_PLACES_API_KEY");
  }

  const query = `${industry} in ${city}, ${country}`;
  const { places, requestCount } = await searchPlaces(query, apiKey, resultCount);
  onFound?.(places.length);

  // On Vercel there's no system Chromium, so we launch the serverless-sized
  // build from @sparticuz/chromium. Locally, Playwright's own bundled Chromium
  // isn't installable on this machine's macOS version, so we drive the
  // system-installed Microsoft Edge (Chromium-based) instead via its channel.
  if (process.env.VERCEL) {
    // We only read DOM/text (no rendering), so disabling WebGL trims memory
    // use — Chromium crashing under memory pressure is what surfaces as
    // "Target page, context or browser has been closed" at newPage().
    chromium.setGraphicsMode = false;
  }
  const browser = process.env.VERCEL
    ? await playwright.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      })
    : await playwright.launch({ channel: "msedge" });
  try {
    const inspectLimit = pLimit(INSPECT_CONCURRENCY);
    const copyrightYears = new Map<string, number | undefined>();
    let checked = 0;

    const leads: ScoredLead[] = await Promise.all(
      places.map((place) =>
        inspectLimit(async () => {
          const site = place.websiteUri
            ? await inspectWebsite(browser, place.websiteUri)
            : null;
          if (site && !site.reachable) {
            console.error(
              `[siteInspector] ${place.websiteUri} unreachable: httpStatus=${site.httpStatus} likelyBotBlocked=${site.likelyBotBlocked} error=${site.error}`,
            );
          }
          checked += 1;
          onProgress?.({ phase: "sites", checked, total: places.length });
          copyrightYears.set(place.id, site?.copyrightYear);
          return scoreLead(place, site);
        }),
      ),
    );

    const reviewCandidates = leads.filter((lead) => needsReviewsCheck(lead.flags));
    const reviewsLimit = pLimit(REVIEWS_CONCURRENCY);
    let reviewsChecked = 0;
    let reviewsRequestCount = 0;

    await Promise.all(
      reviewCandidates.map((lead) =>
        reviewsLimit(async () => {
          const reviews = await getPlaceReviews(lead.placeId, apiKey);
          reviewsRequestCount += 1;
          reviewsChecked += 1;
          onProgress?.({
            phase: "reviews",
            checked: reviewsChecked,
            total: reviewCandidates.length,
          });

          const negativeFlag = recentNegativeReviewFlagFor(reviews);
          if (negativeFlag.length > 0) {
            const flags = [...lead.flags, ...negativeFlag];
            Object.assign(lead, { flags, ...buildScoredFields(flags) });
          }
        }),
      ),
    );

    const order: ScoredLead["opportunityType"][] = [
      "no_website",
      "broken_website",
      "outdated_website",
      "reputation_risk",
      "cold",
    ];
    leads.sort(
      (a, b) => order.indexOf(a.opportunityType) - order.indexOf(b.opportunityType),
    );

    const estCostUsd =
      requestCount * EST_COST_PER_SEARCH_REQUEST_USD +
      reviewsRequestCount * EST_COST_PER_REVIEWS_DETAILS_USD;

    const search = await prisma.search.create({
      data: {
        industry: normalize(industry),
        city: normalize(city),
        country: normalize(country),
        resultCount: leads.length,
        placesApiRequests: requestCount + reviewsRequestCount,
        estCostUsd,
      },
    });

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const business = await prisma.business.upsert({
        where: { placeId: lead.placeId },
        create: {
          placeId: lead.placeId,
          name: lead.name,
          address: lead.address,
          phone: lead.phone,
          website: lead.website,
          email: lead.email,
          rating: lead.rating ?? undefined,
          reviewCount: lead.reviewCount ?? undefined,
          screenshotPath: lead.screenshotPath,
        },
        update: {
          name: lead.name,
          address: lead.address,
          phone: lead.phone,
          website: lead.website,
          email: lead.email,
          rating: lead.rating ?? undefined,
          reviewCount: lead.reviewCount ?? undefined,
          screenshotPath: lead.screenshotPath,
          lastFetchedAt: new Date(),
        },
      });

      await prisma.websiteSignal.upsert({
        where: { businessId: business.id },
        create: {
          businessId: business.id,
          reachable: !lead.flags.includes("broken_website"),
          usesHttps: !lead.flags.includes("no_ssl"),
          hasViewportMeta: !lead.flags.includes("not_mobile_optimized"),
          copyrightYear: copyrightYears.get(lead.placeId),
          likelyBotBlocked: lead.flags.includes(
            "site_check_inconclusive_verify_manually",
          ),
          opportunityScore: lead.opportunityScore,
          opportunityLabel: lead.gaugeLabel,
          flags: lead.flags.join("|"),
          suggestedOpener: lead.suggestedOpener,
        },
        update: {
          reachable: !lead.flags.includes("broken_website"),
          usesHttps: !lead.flags.includes("no_ssl"),
          hasViewportMeta: !lead.flags.includes("not_mobile_optimized"),
          copyrightYear: copyrightYears.get(lead.placeId),
          likelyBotBlocked: lead.flags.includes(
            "site_check_inconclusive_verify_manually",
          ),
          opportunityScore: lead.opportunityScore,
          opportunityLabel: lead.gaugeLabel,
          flags: lead.flags.join("|"),
          suggestedOpener: lead.suggestedOpener,
          checkedAt: new Date(),
        },
      });

      await prisma.searchResult.upsert({
        where: {
          searchId_businessId: { searchId: search.id, businessId: business.id },
        },
        create: { searchId: search.id, businessId: business.id, position: i },
        update: { position: i },
      });
    }

    return {
      searchId: search.id,
      leads,
      estCostUsd,
      placesApiRequests: requestCount + reviewsRequestCount,
    };
  } finally {
    await browser.close();
  }
}
