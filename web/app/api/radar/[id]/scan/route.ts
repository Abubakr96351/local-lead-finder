import { prisma } from "@/lib/prisma";
import { runSearch } from "@/lib/runSearch";
import { cityForRadar } from "@/lib/regions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const radar = await prisma.radar.findUnique({ where: { id } });
  if (!radar) {
    return new Response("Radar not found", { status: 404 });
  }

  const city = cityForRadar(radar.region, radar.state, radar.nextCityIndex);

  const result = await runSearch({
    industry: radar.niche,
    city: `${city}, ${radar.state}`,
    country: radar.region,
    resultCount: radar.maxLeadsPerScan,
  });

  const placeIds = result.leads.map((lead) => lead.placeId);
  const businesses = await prisma.business.findMany({
    where: { placeId: { in: placeIds } },
  });

  const existingProspects = await prisma.prospect.findMany({
    where: { businessId: { in: businesses.map((b) => b.id) } },
    select: { businessId: true },
  });
  const existingIds = new Set(existingProspects.map((p) => p.businessId));
  const newCount = businesses.filter((b) => !existingIds.has(b.id)).length;

  await Promise.all(
    businesses.map((business) =>
      prisma.prospect.upsert({
        where: { businessId: business.id },
        create: { businessId: business.id },
        update: {},
      }),
    ),
  );

  const updated = await prisma.radar.update({
    where: { id },
    data: {
      nextCityIndex: radar.nextCityIndex + 1,
      lastScanAt: new Date(),
      lastScanNewCount: newCount,
    },
  });

  return Response.json({ radar: updated, newCount, city, scanned: businesses.length });
}
