import type { Radar } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { runSearch } from "@/lib/runSearch";
import { cityForRadar } from "@/lib/regions";

const CADENCE_DAYS: Record<string, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

function cadenceDays(cadence: string): number {
  return CADENCE_DAYS[cadence] ?? CADENCE_DAYS.weekly;
}

/** Whether a radar's cadence has elapsed since its last scan (or it's never
 *  been scanned at all). Paused radars are never due. */
export function isRadarDue(radar: Pick<Radar, "active" | "cadence" | "lastScanAt">, now = new Date()): boolean {
  if (!radar.active) return false;
  if (!radar.lastScanAt) return true;
  const elapsedDays = (now.getTime() - radar.lastScanAt.getTime()) / (1000 * 60 * 60 * 24);
  return elapsedDays >= cadenceDays(radar.cadence);
}

export interface NewRadarLead {
  name: string;
  gaugeLabel: string;
}

export interface RadarScanResult {
  newCount: number;
  city: string;
  scanned: number;
  newLeads: NewRadarLead[];
}

/** Core scan → dedupe → prospect-upsert pipeline shared by the manual
 *  "Scan now" route and the daily cron. Prospects it creates belong to
 *  `radar.userId` (falling back to `fallbackOwnerId` for the rare case of a
 *  radar with no owner, e.g. pre-auth legacy data an admin is scanning). */
export async function runRadarScan(
  radar: Radar,
  fallbackOwnerId: string,
): Promise<RadarScanResult> {
  const ownerId = radar.userId ?? fallbackOwnerId;
  const city = cityForRadar(radar.region, radar.state, radar.nextCityIndex);

  const result = await runSearch({
    industry: radar.niche,
    city: `${city}, ${radar.state}`,
    country: radar.region,
    resultCount: radar.maxLeadsPerScan,
    userId: ownerId,
  });

  const placeIds = result.leads.map((lead) => lead.placeId);
  const businesses = await prisma.business.findMany({
    where: { placeId: { in: placeIds } },
  });

  const existingProspects = await prisma.prospect.findMany({
    where: { userId: ownerId, businessId: { in: businesses.map((b) => b.id) } },
    select: { businessId: true },
  });
  const existingIds = new Set(existingProspects.map((p) => p.businessId));
  const newBusinesses = businesses.filter((b) => !existingIds.has(b.id));

  await Promise.all(
    businesses.map((business) =>
      prisma.prospect.upsert({
        where: { userId_businessId: { userId: ownerId, businessId: business.id } },
        create: { businessId: business.id, userId: ownerId },
        update: {},
      }),
    ),
  );

  await prisma.radar.update({
    where: { id: radar.id },
    data: {
      nextCityIndex: radar.nextCityIndex + 1,
      lastScanAt: new Date(),
      lastScanNewCount: newBusinesses.length,
    },
  });

  const leadByPlaceId = new Map(result.leads.map((lead) => [lead.placeId, lead]));
  const newLeads: NewRadarLead[] = newBusinesses
    .map((b) => leadByPlaceId.get(b.placeId))
    .filter((lead): lead is NonNullable<typeof lead> => lead !== undefined)
    .map((lead) => ({ name: lead.name, gaugeLabel: lead.gaugeLabel }));

  return { newCount: newBusinesses.length, city, scanned: businesses.length, newLeads };
}
