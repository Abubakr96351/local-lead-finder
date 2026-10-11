import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PastSearchesClient } from "@/components/PastSearchesClient";

export const dynamic = "force-dynamic";

export default async function PastSearchesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const searches = await prisma.search.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    orderBy: { runAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Past Searches</h1>
      <p className="mt-1 text-sm text-gray-500">
        Results are cached for 7 days — reopening one is instant and free.
      </p>

      <PastSearchesClient
        initialSearches={searches.map((search) => ({
          id: search.id,
          industry: search.industry,
          city: search.city,
          country: search.country,
          resultCount: search.resultCount,
          estCostUsd: search.estCostUsd,
          runAt: search.runAt.toLocaleString(),
        }))}
      />
    </div>
  );
}
