import { prisma } from "@/lib/prisma";

export async function GET() {
  const radars = await prisma.radar.findMany({ orderBy: { createdAt: "desc" } });
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
    },
  });

  return Response.json(radar);
}
