import { prisma } from "@/lib/prisma";

export async function GET() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [searchesToday, prospectsCount, radarsActiveCount] = await Promise.all([
    prisma.search.count({ where: { runAt: { gte: startOfDay } } }),
    prisma.prospect.count(),
    prisma.radar.count({ where: { active: true } }),
  ]);

  return Response.json({ searchesToday, prospectsCount, radarsActiveCount });
}
