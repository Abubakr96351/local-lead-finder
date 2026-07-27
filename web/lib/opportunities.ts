/** Friendly, bullet-point copy for the Prospect List's "Opportunities:" panel.
 *  Reuses the flags already computed in lib/score.ts — no new scoring logic. */
export const FLAG_OPPORTUNITY_COPY: Record<string, string> = {
  no_website: "No website found — invisible to searchers comparing options online",
  broken_website: "Website appears to be down — visitors are hitting a dead link",
  not_mobile_optimized: "Not mobile-friendly — most local searches happen on phones",
  no_ssl: "No SSL certificate — browsers flag the site as \"Not secure\"",
  stale_copyright: "Outdated website design — first impression is costing you customers",
  recent_negative_review: "Recent negative review — may need reputation help",
  no_reviews: "Almost no reviews — maps profile looks abandoned",
  low_reviews: "Only a few reviews — not enough to build trust or get ranked by Google",
};

export function opportunityBullets(flags: string[]): string[] {
  return flags
    .map((flag) => FLAG_OPPORTUNITY_COPY[flag])
    .filter((copy): copy is string => Boolean(copy));
}
