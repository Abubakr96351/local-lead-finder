import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface UpdateProspectBody {
  status?: string;
  notes?: string;
}

async function assertOwnedProspect(id: string, userId: string, isAdmin: boolean) {
  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect) return null;
  if (!isAdmin && prospect.userId !== userId) return null;
  return prospect;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const owned = await assertOwnedProspect(id, user.id, user.role === "ADMIN");
  if (!owned) return new Response("Not found", { status: 404 });

  const body = (await request.json()) as UpdateProspectBody;

  const prospect = await prisma.prospect.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
    },
  });

  return Response.json(prospect);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const owned = await assertOwnedProspect(id, user.id, user.role === "ADMIN");
  if (!owned) return new Response("Not found", { status: 404 });

  await prisma.prospect.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
