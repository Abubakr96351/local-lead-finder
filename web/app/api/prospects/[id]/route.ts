import { prisma } from "@/lib/prisma";

interface UpdateProspectBody {
  status?: string;
  notes?: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
  const { id } = await params;
  await prisma.prospect.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
