import type { Browser, Page } from "playwright-core";

export interface SiteInspection {
  reachable: boolean;
  httpStatus?: number;
  // 403/429, or a Cloudflare interstitial that never cleared, usually means a live
  // site whose WAF fingerprinted the request as a bot — not that the site is down.
  // Never confidently call this "broken"; see score.ts's site_check_inconclusive flag.
  likelyBotBlocked: boolean;
  usesHttps: boolean;
  hasViewportMeta: boolean;
  copyrightYear?: number;
  email?: string;
  screenshotPath?: string;
  error?: string;
}

const REAL_CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const NAV_TIMEOUT_MS = 20000;
const CHALLENGE_POLL_MS = 1000;
const CHALLENGE_MAX_WAIT_MS = 9000;
const COPYRIGHT_RE = /(?:©|copyright)\s*(\d{4})/i;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

const CHALLENGE_MARKERS = [
  "just a moment",
  "checking your browser",
  "attention required",
  "cf-browser-verification",
  "performing security verification",
];

function looksLikeChallenge(title: string, html: string): boolean {
  const haystack = (title + " " + html.slice(0, 2000)).toLowerCase();
  return CHALLENGE_MARKERS.some((marker) => haystack.includes(marker));
}

/** Many small-business sites are only wired up (DNS/vhost) on one of
 *  www.example.com / example.com — the other host times out or refuses to
 *  connect even though the business's site is genuinely live. */
function toggleWwwHost(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    u.hostname = u.hostname.startsWith("www.")
      ? u.hostname.slice(4)
      : `www.${u.hostname}`;
    return u.toString();
  } catch {
    return null;
  }
}

interface NavAttempt {
  ok: boolean;
  status?: number;
  likelyBotBlocked: boolean;
  usesHttps: boolean;
  html?: string;
  error?: string;
}

async function navigate(page: Page, url: string): Promise<NavAttempt> {
  try {
    const response = await page.goto(url, {
      // "load" waits on every subresource (trackers, chat widgets, ad
      // scripts, video embeds) — a single slow third party stalls the whole
      // navigation and gets misread as the site being down. DOM-ready is
      // enough to know the site actually responded.
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });

    // Give late CSS/images/client-rendered content a chance to settle before
    // we screenshot or scrape copyright/email text — but never let a page
    // that keeps polling (trackers, chat widgets) block or fail the check.
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

    let html = await page.content();
    let title = await page.title();

    const waitStart = Date.now();
    while (
      looksLikeChallenge(title, html) &&
      Date.now() - waitStart < CHALLENGE_MAX_WAIT_MS
    ) {
      await page.waitForTimeout(CHALLENGE_POLL_MS);
      html = await page.content();
      title = await page.title();
    }

    const status = response?.status();
    const usesHttps = page.url().startsWith("https://");
    const stillChallenged = looksLikeChallenge(title, html);

    if (!response || (status !== undefined && status >= 400) || stillChallenged) {
      return {
        ok: false,
        status,
        likelyBotBlocked: stillChallenged || status === 403 || status === 429,
        usesHttps,
      };
    }

    return { ok: true, status, likelyBotBlocked: false, usesHttps, html };
  } catch (err) {
    return {
      ok: false,
      likelyBotBlocked: false,
      usesHttps: url.startsWith("https://"),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function inspectWebsite(
  browser: Browser,
  url: string,
): Promise<SiteInspection> {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    userAgent: REAL_CHROME_UA,
  });

  // We only read DOM/text (viewport meta, copyright, mailto/email) — never
  // pixels — so skip images/fonts/media entirely. Real business sites are
  // often heavy with these, and loading them was crashing Chromium under
  // the serverless function's memory limit.
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (type === "image" || type === "media" || type === "font") {
      return route.abort();
    }
    return route.continue();
  });

  try {
    let attempt = await navigate(page, url);

    // A bot-block failure will just repeat on the other host too, so only
    // retry when the failure looks host-related (DNS/connection/timeout, or
    // a real HTTP error unrelated to a WAF challenge).
    if (!attempt.ok && !attempt.likelyBotBlocked) {
      const altUrl = toggleWwwHost(url);
      if (altUrl) {
        const altAttempt = await navigate(page, altUrl);
        if (altAttempt.ok) {
          attempt = altAttempt;
        }
      }
    }

    if (!attempt.ok) {
      return {
        reachable: false,
        httpStatus: attempt.status,
        likelyBotBlocked: attempt.likelyBotBlocked,
        usesHttps: attempt.usesHttps,
        hasViewportMeta: false,
        error: attempt.error,
      };
    }

    const html = attempt.html ?? (await page.content());
    const hasViewportMeta = (await page.$('meta[name="viewport"]')) !== null;
    const copyrightMatch = html.match(COPYRIGHT_RE);

    const mailtoHref = await page
      .locator('a[href^="mailto:"]')
      .first()
      .getAttribute("href")
      .catch(() => null);
    let email = mailtoHref?.replace(/^mailto:/i, "").split("?")[0].trim();
    if (!email) {
      const bodyText = await page.locator("body").innerText().catch(() => "");
      const match = bodyText.match(EMAIL_RE);
      email = match?.[0];
    }

    return {
      reachable: true,
      httpStatus: attempt.status,
      likelyBotBlocked: false,
      usesHttps: attempt.usesHttps,
      hasViewportMeta,
      copyrightYear: copyrightMatch ? Number(copyrightMatch[1]) : undefined,
      email,
    };
  } catch (err) {
    return {
      reachable: false,
      likelyBotBlocked: false,
      usesHttps: url.startsWith("https://"),
      hasViewportMeta: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await page.close();
  }
}
