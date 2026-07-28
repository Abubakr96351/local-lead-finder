import { runSearch } from "@/lib/runSearch";
import { findCachedSearch } from "@/lib/searchCache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface SearchRequestBody {
  industry: string;
  city: string;
  country: string;
  resultCount: number;
  forceRefresh?: boolean;
}

export async function POST(request: Request) {
  const body = (await request.json()) as SearchRequestBody;
  const { industry, city, country, resultCount, forceRefresh } = body;

  if (!industry || !city) {
    return new Response("industry and city are required", { status: 400 });
  }

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return new Response("Missing GOOGLE_PLACES_API_KEY", { status: 500 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        if (!forceRefresh) {
          const cached = await findCachedSearch(industry, city, country, resultCount);
          if (cached) {
            send({ type: "cached", cachedAt: cached.cachedAt });
            send({
              type: "done",
              searchId: cached.searchId,
              estCostUsd: 0,
              placesApiRequests: 0,
              fromCache: true,
              leads: cached.leads.slice(0, resultCount),
            });
            return;
          }
        }

        const result = await runSearch(
          { industry, city, country, resultCount },
          (progress) => send({ type: "progress", ...progress }),
          (total) => send({ type: "found", total }),
        );

        send({
          type: "done",
          searchId: result.searchId,
          estCostUsd: result.estCostUsd,
          placesApiRequests: result.placesApiRequests,
          fromCache: false,
          leads: result.leads,
        });
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
