import type { RawPlace } from "./places.js";
import type { WebsiteSignals } from "./websiteCheck.js";

export type OpportunityType =
  | "no_website"
  | "broken_website"
  | "outdated_website"
  | "reputation_risk"
  | "cold";

export interface ScoredLead {
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: number | null;
  reviewCount: number | null;
  opportunityType: OpportunityType;
  flags: string[];
  suggestedOpener: string;
}

const LOW_REVIEW_THRESHOLD = 10;
const CURRENT_YEAR = new Date().getFullYear();

const OPENERS: Record<OpportunityType, string> = {
  no_website:
    "I found you on Google Maps this morning and noticed you didn't have a website connected. Any plans to build one?",
  broken_website:
    "I was checking out local businesses on Google Maps and your website link didn't seem to load for me — are you aware it might be down?",
  outdated_website:
    "I noticed your website's a little outdated — any plans to update it in the near future?",
  reputation_risk:
    "I noticed a recent review that seemed like an outlier compared to your other reviews — sorry that happened. There are a few ways we could help address that, would you be open to hearing about it?",
  cold: "",
};

export function scoreLead(
  place: RawPlace,
  website: WebsiteSignals | null,
): ScoredLead {
  const flags: string[] = [];
  const rating = place.rating ?? null;
  const reviewCount = place.userRatingCount ?? null;

  if (!place.websiteUri) {
    flags.push("no_website");
  } else if (website && !website.reachable && website.likelyBotBlocked) {
    // 403/429 is ambiguous — could be a dead site, could be a live site whose WAF
    // fingerprinted our request as a bot. Never confidently call this "broken";
    // flag it for a manual look instead of feeding a false claim into a call script.
    flags.push("site_check_inconclusive_verify_manually");
  } else if (website && !website.reachable) {
    flags.push("broken_website");
  } else if (website) {
    if (!website.hasViewportMeta) flags.push("not_mobile_optimized");
    if (!website.usesHttps) flags.push("no_ssl");
    if (
      website.copyrightYear !== undefined &&
      website.copyrightYear < CURRENT_YEAR - 2
    ) {
      flags.push("stale_copyright");
    }
  }

  if (reviewCount !== null && reviewCount < LOW_REVIEW_THRESHOLD) {
    flags.push("low_reviews");
  }
  if (reviewCount === 0) {
    flags.push("no_reviews");
  }

  const opportunityType = classify(flags);

  return {
    name: place.displayName?.text ?? "Unknown",
    address: place.formattedAddress ?? "",
    phone: place.nationalPhoneNumber ?? "",
    website: place.websiteUri ?? "",
    rating,
    reviewCount,
    opportunityType,
    flags,
    suggestedOpener: OPENERS[opportunityType],
  };
}

function classify(flags: string[]): OpportunityType {
  if (flags.includes("no_website")) return "no_website";
  if (flags.includes("broken_website")) return "broken_website";

  const outdatedSignals = ["not_mobile_optimized", "no_ssl", "stale_copyright"];
  const outdatedCount = flags.filter((f) => outdatedSignals.includes(f)).length;
  if (outdatedCount >= 2) return "outdated_website";

  if (flags.includes("low_reviews") || flags.includes("no_reviews")) {
    return "reputation_risk";
  }

  return "cold";
}
