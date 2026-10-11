import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const scope = user.role === "ADMIN" ? {} : { userId: user.id };
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [searchesToday, prospectsCount, radarsActiveCount] = await Promise.all([
    prisma.search.count({ where: { ...scope, runAt: { gte: startOfDay } } }),
    prisma.prospect.count({ where: scope }),
    prisma.radar.count({ where: { ...scope, active: true } }),
  ]);

  return Response.json({ searchesToday, prospectsCount, radarsActiveCount });
}
