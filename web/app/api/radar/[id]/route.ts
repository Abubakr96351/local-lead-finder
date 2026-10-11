import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface UpdateRadarBody {
  niche?: string;
  state?: string;
  region?: string;
  maxLeadsPerScan?: number;
  cadence?: string;
  notificationEmail?: string | null;
  active?: boolean;
}

async function assertOwnedRadar(id: string, userId: string, isAdmin: boolean) {
  const radar = await prisma.radar.findUnique({ where: { id } });
  if (!radar) return null;
  if (!isAdmin && radar.userId !== userId) return null;
  return radar;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const owned = await assertOwnedRadar(id, user.id, user.role === "ADMIN");
  if (!owned) return new Response("Not found", { status: 404 });

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
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const owned = await assertOwnedRadar(id, user.id, user.role === "ADMIN");
  if (!owned) return new Response("Not found", { status: 404 });

  await prisma.radar.delete({ where: { id } });
  return Response.json({ ok: true });
}
