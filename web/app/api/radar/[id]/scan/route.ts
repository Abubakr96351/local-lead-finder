import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { runRadarScan } from "@/lib/radarScan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const radar = await prisma.radar.findUnique({ where: { id } });
  if (!radar) {
    return new Response("Radar not found", { status: 404 });
  }
  if (user.role !== "ADMIN" && radar.userId !== user.id) {
    return new Response("Not found", { status: 404 });
  }

  // Manual "Scan now" never emails — the user is already watching the
  // result live in the UI. Email is only for the unattended cron path
  // (see app/api/cron/radar-scan/route.ts).
  const { newCount, city, scanned } = await runRadarScan(radar, user.id);

  const updated = await prisma.radar.findUniqueOrThrow({ where: { id } });
  return Response.json({ radar: updated, newCount, city, scanned });
}
