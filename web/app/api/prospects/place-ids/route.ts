import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/** Just the Google placeIds already in the current user's Prospect List —
 *  cheap enough to refetch after every search/add so the results grid can
 *  badge leads that are already there, without affecting what a search
 *  itself returns (see lib/searchCache.ts: cached results stay a frozen
 *  snapshot, keeping Past Searches reliably reproducible). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const prospects = await prisma.prospect.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    select: { business: { select: { placeId: true } } },
  });

  return Response.json(prospects.map((p) => p.business.placeId));
}
