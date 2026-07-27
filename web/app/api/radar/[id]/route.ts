import { prisma } from "@/lib/prisma";

interface UpdateRadarBody {
  niche?: string;
  state?: string;
  region?: string;
  maxLeadsPerScan?: number;
  cadence?: string;
  notificationEmail?: string | null;
  active?: boolean;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as UpdateRadarBody;

  const radar = await prisma.radar.update({
    where: { id },
    data: {
      ...(body.niche !== undefined ? { niche: body.niche } : {}),
      ...(body.state !== undefined ? { state: body.state } : {}),
      ...(body.region !== undefined ? { region: body.region } : {}),
      ...(body.maxLeadsPerScan !== undefined
        ? { maxLeadsPerScan: body.maxLeadsPerScan }
        : {}),
      ...(body.cadence !== undefined ? { cadence: body.cadence } : {}),
      ...(body.notificationEmail !== undefined
        ? { notificationEmail: body.notificationEmail }
        : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
    },
  });

  return Response.json(radar);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.radar.delete({ where: { id } });
  return Response.json({ ok: true });
}
