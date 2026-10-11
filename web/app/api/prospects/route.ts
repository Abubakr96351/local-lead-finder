import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const prospects = await prisma.prospect.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    include: { business: { include: { signal: true } } },
    orderBy: { addedAt: "desc" },
  });
  return Response.json(prospects);
}

interface AddProspectsBody {
  placeIds: string[];
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

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
        where: { userId_businessId: { userId: user.id, businessId: business.id } },
        create: { businessId: business.id, userId: user.id },
        update: {},
      }),
    ),
  );

  return Response.json({ added: businesses.length });
}
