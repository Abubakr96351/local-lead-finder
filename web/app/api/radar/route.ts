import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const radars = await prisma.radar.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(radars);
}

interface CreateRadarBody {
  niche: string;
  state: string;
  region: string;
  maxLeadsPerScan: number;
  cadence: string;
  notificationEmail?: string;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json()) as CreateRadarBody;

  if (!body.niche || !body.state) {
    return new Response("niche and state are required", { status: 400 });
  }

  const radar = await prisma.radar.create({
    data: {
      niche: body.niche,
      state: body.state,
      region: body.region || "United States",
      maxLeadsPerScan: body.maxLeadsPerScan || 25,
      cadence: body.cadence || "weekly",
      notificationEmail: body.notificationEmail || undefined,
      userId: user.id,
    },
  });

  return Response.json(radar);
}
