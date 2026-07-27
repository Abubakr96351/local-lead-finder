export interface WebsiteSignals {
  reachable: boolean;
  httpStatus?: number;
  // 403/429 from a well-known small-business site is usually a WAF (Cloudflare,
  // Wordfence, etc.) fingerprinting the request as a bot, not the site being down.
  // Distinguishing this from a genuine failure matters: we never want to tell a
  // live business "your website seems down."
  likelyBotBlocked: boolean;
  usesHttps: boolean;
  hasViewportMeta: boolean;
  copyrightYear?: number;
  error?: string;
}

const FETCH_TIMEOUT_MS = 8000;
const VIEWPORT_RE = /<meta[^>]+name=["']viewport["']/i;
const COPYRIGHT_RE = /(?:©|copyright)\s*(\d{4})/i;

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

async function attemptFetch(url: string): Promise<WebsiteSignals> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        // Small-business sites often sit behind a WAF (Cloudflare, Wordfence, etc.)
        // that 403s any User-Agent it doesn't recognize as a browser. A bot-labeled
        // UA here produces false "broken_website" positives on perfectly live sites.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    const usesHttps = res.url.startsWith("https://");

    if (!res.ok) {
      return {
        reachable: false,
        httpStatus: res.status,
        likelyBotBlocked: res.status === 403 || res.status === 429,
        usesHttps,
        hasViewportMeta: false,
      };
    }

    const html = await res.text();
    const copyrightMatch = html.match(COPYRIGHT_RE);

    return {
      reachable: true,
      httpStatus: res.status,
      likelyBotBlocked: false,
      usesHttps,
      hasViewportMeta: VIEWPORT_RE.test(html),
      copyrightYear: copyrightMatch ? Number(copyrightMatch[1]) : undefined,
    };
  } catch (err) {
    clearTimeout(timeout);
    return {
      reachable: false,
      likelyBotBlocked: false,
      usesHttps: url.startsWith("https://"),
      hasViewportMeta: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function checkWebsite(url: string): Promise<WebsiteSignals> {
  const result = await attemptFetch(url);
  if (result.reachable || result.likelyBotBlocked) return result;

  // Bot-block failures just repeat on the other host, so only retry when the
  // failure looks host-related (DNS/connection/timeout, or a real HTTP error).
  const altUrl = toggleWwwHost(url);
  if (!altUrl) return result;

  const altResult = await attemptFetch(altUrl);
  return altResult.reachable ? altResult : result;
}
