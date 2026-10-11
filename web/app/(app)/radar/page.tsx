import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { RadarPageClient } from "@/components/RadarPageClient";

export const dynamic = "force-dynamic";

export default async function RadarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const radars = await prisma.radar.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <RadarPageClient
        initialRadars={radars.map((radar) => ({
          id: radar.id,
          niche: radar.niche,
          state: radar.state,
          region: radar.region,
          maxLeadsPerScan: radar.maxLeadsPerScan,
          cadence: radar.cadence,
          notificationEmail: radar.notificationEmail,
          active: radar.active,
          lastScanAt: radar.lastScanAt ? radar.lastScanAt.toISOString() : null,
          lastScanNewCount: radar.lastScanNewCount,
        }))}
      />
    </div>
  );
}
