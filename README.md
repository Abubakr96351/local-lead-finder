# Local Lead Finder (Phase 1-2 script)

Pulls businesses for an industry + city from the Google Places API, checks each one's
website for red flags (no site, broken site, outdated site, low reviews), and writes
a scored, sorted CSV you can work through as a call list.

This is the lean, script-only stage. If it proves out, the same scoring logic ports
directly into the Next.js app described in the architecture doc.

## 1. Get a Google Places API key

You need a Google Cloud project with billing enabled and the **Places API (New)** turned
on. Google gives new accounts free trial credit, and Places API also has a small
recurring monthly free tier, but real usage will incur cost — see the pricing note below.

1. Go to https://console.cloud.google.com/ and create a new project (or pick an existing one).
2. Enable billing on the project (Billing → Link a billing account). Google requires
   this even to use the free tier.
3. Go to **APIs & Services → Library**, search for **"Places API (New)"**, and click Enable.
   (Note: this is a different product from the legacy "Places API" — make sure you enable
   the "(New)" one, since this project's code calls the new `places.googleapis.com/v1` endpoint.)
4. Go to **APIs & Services → Credentials → Create Credentials → API key**.
5. Immediately restrict the key (click into it after creation):
   - Under **API restrictions**, choose "Restrict key" and select only **Places API (New)**.
   - Under **Application restrictions**, "IP addresses" is reasonable for a key that only
     ever runs from your machine/server, not a browser.
6. Copy the key.

## 2. Configure the project

```bash
cp .env.example .env
```

Paste your key into `.env`:

```
GOOGLE_PLACES_API_KEY=your-key-here
```

`.env` is gitignored — never commit it.

## 3. Install and run

```bash
npm install
npm run find-leads -- "hvac contractor" "Boise, ID"
```

This will:
1. Query the Places API for that industry + city (Text Search, up to 60 results).
2. Fetch each result's website (10 at a time) and check: reachable, HTTPS, mobile
   viewport tag, stale copyright year.
3. Score each business into one bucket: `no_website`, `broken_website`,
   `outdated_website`, `reputation_risk`, `cold`.
4. Write a sorted CSV to `out/<industry>-<city>.csv` with a suggested opener per row,
   matching the three call scripts from the "Ugly Site Scraper" approach.

`out/` and all `*.csv` files are gitignored — this data is real people's business info,
don't commit it.

## Known limitations of this phase (by design — see the architecture doc for the fix)

- **60-result cap per query.** Text Search returns at most 3 pages of 20. A dense
  industry in a big city will undercount. Fix later: geo-grid search (split the city
  into overlapping sub-areas and query each one, dedup by place `id`).
- **No review-recency check yet.** Flagging "recent negative review" requires a separate
  Place Details call with the `reviews` field (pricier tier) — not wired up in this
  script. Currently `reputation_risk` is based only on total review count.
- **No phone-type (mobile vs. landline) detection.** Needs a paid lookup (e.g. Twilio
  Lookup) — not included yet.
- **Website checks are heuristic, not exhaustive.** No PageSpeed score, no broken-link
  crawl yet — those are cheap to add once you know the core loop is worth using.
- **A 403/429 response is treated as inconclusive, not "broken."** Many real, live
  small-business sites sit behind a WAF (Cloudflare, Wordfence, etc.) that fingerprints
  and blocks non-browser HTTP clients — including Node's `fetch`, even with a browser
  User-Agent set. Confirmed while building this: several 4.9-star, thousands-of-reviews
  businesses returned 403 to this script's requests while being completely live in an
  actual browser. Rows like this get flagged `site_check_inconclusive_verify_manually`
  and are routed to the `cold` bucket with no suggested opener, specifically so the tool
  never tells you (or a business owner) their site is down when it isn't. Open these
  manually in a browser before deciding whether to use the "outdated" or "no website"
  script on them — a real fix (headless-browser fetch via Playwright, which presents a
  full browser fingerprint) is a Phase 3+ upgrade, not worth the added weight for a
  personal-use script yet.

## Cost awareness

Every run costs real money once you're past any free tier — Text Search billing is
per request (each request = up to 20 results), so a 60-result search is a few requests,
not 60. Check current pricing at https://mapsplatform.google.com/pricing/ before running
this against many cities — pricing tiers change and this doc won't stay current.
# local-lead-finder
