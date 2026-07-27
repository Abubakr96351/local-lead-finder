import type { RawPlace, RawReview } from "./places.js";
import type { SiteInspection } from "./siteInspector.js";

export type OpportunityType =
  | "no_website"
  | "broken_website"
  | "outdated_website"
  | "reputation_risk"
  | "cold";

export type GaugeLabel = "Great!" | "Good!" | "Fair" | "Poor";

export interface ScoredLead {
  placeId: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  email?: string;
  rating: number | null;
  reviewCount: number | null;
  screenshotPath?: string;
  opportunityType: OpportunityType;
  flags: string[];
  suggestedOpener: string;
  opportunityScore: number;
  gaugeLabel: GaugeLabel;
}

const LOW_REVIEW_THRESHOLD = 10;
const CURRENT_YEAR = new Date().getFullYear();
const NEGATIVE_REVIEW_MAX_RATING = 2;
const NEGATIVE_REVIEW_RECENCY_DAYS = 60;

/** Short, human-readable reason shown on the card so it's obvious which of the
 *  three call scripts applies without opening the CSV. */
export const OPPORTUNITY_REASON: Record<OpportunityType, string> = {
  no_website: "No website",
  broken_website: "Website appears down",
  outdated_website: "Outdated website",
  reputation_risk: "Recent negative review",
  cold: "",
};

export const OPENERS: Record<OpportunityType, string> = {
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

/**
 * Website-related flags only — from the cheap search + free Playwright check.
 * No Places API cost involved.
 */
export function siteFlagsFor(
  websiteUri: string | undefined,
  site: SiteInspection | null,
): string[] {
  const flags: string[] = [];

  if (!websiteUri) {
    flags.push("no_website");
  } else if (site && !site.reachable && site.likelyBotBlocked) {
    // Ambiguous — could be dead, could be a live site whose WAF blocked us.
    // Never confidently call this "broken"; flag it for a manual look instead.
    flags.push("site_check_inconclusive_verify_manually");
  } else if (site && !site.reachable) {
    flags.push("broken_website");
  } else if (site) {
    if (!site.hasViewportMeta) flags.push("not_mobile_optimized");
    if (!site.usesHttps) flags.push("no_ssl");
    if (site.copyrightYear !== undefined && site.copyrightYear < CURRENT_YEAR - 2) {
      flags.push("stale_copyright");
    }
  }

  return flags;
}

/** From reviewCount, bundled cheaply into the Text Search response itself
 *  (no extra cost) — a mild score signal, but not proof of an actual
 *  negative review, so this alone must not drive the reputation_risk opener. */
export function reviewCountFlagsFor(reviewCount: number | null): string[] {
  const flags: string[] = [];
  if (reviewCount !== null && reviewCount < LOW_REVIEW_THRESHOLD) {
    flags.push("low_reviews");
  }
  if (reviewCount === 0) {
    flags.push("no_reviews");
  }
  return flags;
}

/** A business is worth the per-place `reviews` Details call only if it isn't
 *  already a slam-dunk lead from cheap signals alone (no_website /
 *  broken_website score 100/90 regardless of review content). */
export function needsReviewsCheck(flags: string[]): boolean {
  return !flags.includes("no_website") && !flags.includes("broken_website");
}

/** From the per-place `reviews` Details fetch — the one genuinely expensive,
 *  per-place resource. Only called for leads where needsReviewsCheck() is true. */
export function recentNegativeReviewFlagFor(reviews: RawReview[]): string[] {
  const cutoff = Date.now() - NEGATIVE_REVIEW_RECENCY_DAYS * 24 * 60 * 60 * 1000;
  const hasRecentNegative = reviews.some((review) => {
    if (review.rating === undefined || review.rating > NEGATIVE_REVIEW_MAX_RATING) {
      return false;
    }
    if (!review.publishTime) return false;
    const publishedAt = new Date(review.publishTime).getTime();
    return !Number.isNaN(publishedAt) && publishedAt >= cutoff;
  });
  return hasRecentNegative ? ["recent_negative_review"] : [];
}

export interface ScoredFields {
  opportunityType: OpportunityType;
  opportunityScore: number;
  gaugeLabel: GaugeLabel;
  suggestedOpener: string;
}

/** Shared by scoreLead() (search time) and the post-reviews-check re-score,
 *  so the classification rules only live in one place. */
export function buildScoredFields(flags: string[]): ScoredFields {
  const opportunityType = classify(flags);
  const opportunityScore = scoreFlags(flags);
  return {
    opportunityType,
    opportunityScore,
    gaugeLabel: gaugeLabelFor(opportunityScore),
    suggestedOpener: OPENERS[opportunityType],
  };
}

export function scoreLead(
  place: RawPlace,
  site: SiteInspection | null,
): ScoredLead {
  const rating = place.rating ?? null;
  const reviewCount = place.userRatingCount ?? null;

  const flags = [
    ...siteFlagsFor(place.websiteUri, site),
    ...reviewCountFlagsFor(reviewCount),
  ];
  const scored = buildScoredFields(flags);

  return {
    placeId: place.id,
    name: place.displayName?.text ?? "Unknown",
    address: place.formattedAddress ?? "",
    phone: place.nationalPhoneNumber ?? "",
    website: place.websiteUri ?? "",
    email: site?.email,
    rating,
    reviewCount,
    screenshotPath: site?.screenshotPath,
    flags,
    ...scored,
  };
}

export function classify(flags: string[]): OpportunityType {
  if (flags.includes("no_website")) return "no_website";
  if (flags.includes("broken_website")) return "broken_website";

  const outdatedSignals = ["not_mobile_optimized", "no_ssl", "stale_copyright"];
  const outdatedCount = flags.filter((f) => outdatedSignals.includes(f)).length;
  if (outdatedCount >= 2) return "outdated_website";

  // Requires a confirmed recent negative review, not just a low review count —
  // the reputation_risk opener explicitly claims "I noticed a recent review
  // that seemed like an outlier," which would be a false claim otherwise.
  if (flags.includes("recent_negative_review")) return "reputation_risk";

  return "cold";
}

/**
 * "Outreach Potential" score — how good a prospect this business is, not a
 * measure of confidence. Our own weighting (no reference formula available),
 * expect to retune against real results.
 */
export function scoreFlags(flags: string[]): number {
  if (flags.includes("no_website")) return 100;
  if (flags.includes("broken_website")) return 90;

  let score = 0;
  if (flags.includes("not_mobile_optimized")) score += 20;
  if (flags.includes("no_ssl")) score += 15;
  if (flags.includes("stale_copyright")) score += 15;
  if (flags.includes("recent_negative_review")) score += 35;

  // Low/no review count is a mild nudge, not a strong signal on its own —
  // it no longer drives the reputation_risk classification (see classify()).
  if (flags.includes("no_reviews")) score += 15;
  else if (flags.includes("low_reviews")) score += 10;

  return Math.min(score, 100);
}

function gaugeLabelFor(score: number): GaugeLabel {
  if (score >= 70) return "Great!";
  if (score >= 40) return "Good!";
  if (score >= 15) return "Fair";
  return "Poor";
}

export const GAUGE_COLORS: Record<GaugeLabel, string> = {
  "Great!": "#22c55e",
  "Good!": "#4ade80",
  Fair: "#f59e0b",
  Poor: "#9ca3af",
};
