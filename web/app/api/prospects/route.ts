import { prisma } from "@/lib/prisma";

export async function GET() {
  const prospects = await prisma.prospect.findMany({
    include: { business: { include: { signal: true } } },
    orderBy: { addedAt: "desc" },
  });
  return Response.json(prospects);
}

interface AddProspectsBody {
  placeIds: string[];
}

export async function POST(request: Request) {
  const { placeIds } = (await request.json()) as AddProspectsBody;

  if (!placeIds?.length) {
    return new Response("placeIds is required", { status: 400 });
  }

  const businesses = await prisma.business.findMany({
    where: { placeId: { in: placeIds } },
  });

  await Promise.all(
    businesses.map((business) =>
      prisma.prospect.upsert({
        where: { businessId: business.id },
        create: { businessId: business.id },
        update: {},
      }),
    ),
  );

  return Response.json({ added: businesses.length });
}
