# Project Memory — local-lead-finder

Portable session notes. This file lives in the project so context survives
the project being moved/copied (moved from `/Volumes/AbuSSD/projects/local-lead-finder`
to `~/Desktop/local-lead-finder` on 2026-07-20).

## What this project is

A local-lead-generation tool: scrapes Google Places (New API) for businesses
matching an industry + city/country, inspects each business's website with
Playwright, and scores them as sales leads ("Outreach Potential") based on
how bad their web presence is — the worse the site, the hotter the lead.

Two entry points:
- `src/` — an older/simpler CLI version (`src/score.ts` etc.) — **stale**,
  logic has drifted from the web app. Don't treat it as source of truth.
- `web/` — the actual Next.js app in active use (`npm run dev` from inside
  `web/`, not the repo root — root `package.json` has no `dev` script).
  Runs on port 3000 (or 3100 if 3000 is taken by another instance).

## How scoring actually works (verified against code, not docs/tables)

`web/lib/score.ts` `classify()`, in priority order:
1. `no_website` — no `websiteUri` from Google Places at all. Score 100 ("Great!").
2. `broken_website` — site inspected, unreachable, not bot-blocked. Score 90 ("Great!").
3. `outdated_website` — site reachable AND ≥2 of: no HTTPS / no viewport meta / copyright year > 2 years stale.
4. `reputation_risk` — **NOT** "low review count" (that's the old/stale CLI
   version's logic). Requires a *confirmed recent negative review*: rating ≤2,
   published within last 60 days, fetched via a separate paid Place Details
   call (`getPlaceReviews`, only run for leads that aren't already
   no_website/broken_website — see `needsReviewsCheck`). Low/no review count
   only adds +10/+15 to the numeric score, doesn't drive classification.
5. `cold` — catch-all. Also silently catches bot-blocked/inconclusive sites
   (flag `site_check_inconclusive_verify_manually` isn't mapped to any bucket).

`no_website`/`broken_website` are the only two with a flat guaranteed max
score — everything else is additive from weaker signals and only reaches
"Great!" (≥70) if multiple problems stack at once.

## Bug found + fixed this session: false-positive `broken_website`

Queried the actual sqlite DB (`web/prisma/dev.db`) instead of trusting the
code/docs, because a real search ("real estate agency" in Melbourne,
Australia, resultCount 15) was flagging 9/15 well-known, clearly-live
franchises (Ray White, Harcourts, MICM, Ironfish, etc.) as `broken_website`.

Root cause: `web/lib/siteInspector.ts` used `page.goto(url, { waitUntil:
"load", timeout: 20000 })`. `"load"` waits for *every* subresource
(trackers, chat widgets, ad scripts) — one slow third party stalls the whole
navigation, throws a Playwright TimeoutError, and gets misclassified as the
site being down (indistinguishable in the data: no httpStatus recorded,
`likelyBotBlocked: false`).

**Fix applied:** switched to `waitUntil: "domcontentloaded"`, plus an
opportunistic `page.waitForLoadState("networkidle", { timeout: 5000
}).catch(() => {})` afterward so screenshots/copyright-year/email scraping
still get a chance to see a settled page, without that wait ever failing the
overall check.

**Verified with a live re-run** (forceRefresh, same 15 Melbourne real estate
businesses): `broken_website` count dropped from 9/15 → 2/15. The remaining
2 (`mre.today`, `realestateofmelbourne.com.au`) return HTTP 200 to a plain
`curl` but still fail via Playwright — likely headless-Chromium-specific bot
detection (different bug, not yet fixed/root-caused).

**Caveat:** the fix only affects sites checked *after* the change. Anything
already cached (7-day TTL, see `web/lib/searchCache.ts`) still carries the
old, possibly-false `broken_website`/`no_website` results until re-run with
"Force refresh" checked.

## Reviews API limitation (not fixable in code, Google API constraint)

`getPlaceReviews` (`web/lib/places.ts`) hits the New Places API v1
(`places.googleapis.com/v1/places/{id}`), which — unlike the Legacy API —
has no `reviewsSort`/`reviews_sort` param. It always returns up to 5 reviews
sorted by relevance, not recency. So a genuinely recent 1★ review can be
absent from the 5 returned, causing `reputation_risk` under-detection. No
code fix available; it's a Google API surface limitation.

## Country/niche additions — done then reverted

Added India as a country option, an "Indian Businesses" niche category
(kirana store, beauty parlour, coaching center, etc.), Indian example
cities, and an opportunity-type result filter ("Show Only: no website /
broken / outdated / reputation risk") to `web/components/SearchPanel.tsx`,
`web/app/page.tsx`, `web/lib/niches.ts`. **User asked to undo this — it was
fully reverted.** If asked again, the diff is straightforward (see git
history / conversation) but nothing from that change currently exists in
the code.

## Environment notes

- `web/.env` holds `GOOGLE_PLACES_API_KEY` — real, live key, calls cost
  money (~$0.032/search request, ~$0.025/reviews-details call). Don't run
  searches against it without the user's go-ahead.
- `web/prisma/dev.db` — sqlite, has real accumulated search data. Good
  source of truth for auditing actual tool behavior (as done above) rather
  than reasoning from code alone.
- No git commits exist yet in this repo as of 2026-07-20 (working tree only).
