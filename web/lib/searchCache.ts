import { prisma } from "./prisma";
import { classify, type GaugeLabel, type ScoredLead } from "./score";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days — business sites/reviews don't churn fast enough to justify re-paying for the same city/niche sooner than this.

/** Search rows are stored normalized so cache lookups don't depend on
 *  matching casing/whitespace between requests. */
export function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export interface CachedSearchResult {
  searchId: string;
  cachedAt: Date;
  leads: ScoredLead[];
}

export async function findCachedSearch(
  industry: string,
  city: string,
  country: string,
  resultCount: number,
): Promise<CachedSearchResult | null> {
  const cutoff = new Date(Date.now() - CACHE_TTL_MS);

  const cached = await prisma.search.findFirst({
    where: {
      industry: normalize(industry),
      city: normalize(city),
      country: normalize(country),
      runAt: { gte: cutoff },
      resultCount: { gte: resultCount },
    },
    orderBy: { runAt: "desc" },
    include: {
      results: {
        orderBy: { position: "asc" },
        take: resultCount,
        include: { business: { include: { signal: true } } },
      },
    },
  });

  if (!cached) return null;

  const leads: ScoredLead[] = cached.results
    .filter((r) => r.business.signal !== null)
    .map((r) => {
      const business = r.business;
      const signal = business.signal!;
      const flags = signal.flags.split("|").filter(Boolean);

      return {
        placeId: business.placeId,
        name: business.name,
        address: business.address,
        phone: business.phone ?? "",
        website: business.website ?? "",
        email: business.email ?? undefined,
        rating: business.rating,
        reviewCount: business.reviewCount,
        screenshotPath: business.screenshotPath ?? undefined,
        flags,
        opportunityType: classify(flags),
        suggestedOpener: signal.suggestedOpener,
        opportunityScore: signal.opportunityScore,
        gaugeLabel: signal.opportunityLabel as GaugeLabel,
      };
    });

  return { searchId: cached.id, cachedAt: cached.runAt, leads };
}
