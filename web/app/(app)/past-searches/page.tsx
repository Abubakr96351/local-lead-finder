import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PastSearchesPage() {
  const searches = await prisma.search.findMany({
    orderBy: { runAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Past Searches</h1>
      <p className="mt-1 text-sm text-gray-500">
        Results are cached for 7 days — reopening one is instant and free.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {searches.length === 0 ? (
          <p className="text-sm text-gray-500">
            No searches yet — run one from the Scraper page.
          </p>
        ) : (
          searches.map((search) => (
            <div
              key={search.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div>
                <h3 className="font-semibold capitalize text-gray-900">
                  {search.industry} in {search.city}
                </h3>
                <p className="text-xs text-gray-500">
                  {search.country} · {search.resultCount} results · $
                  {search.estCostUsd.toFixed(2)} · {search.runAt.toLocaleString()}
                </p>
              </div>
              <Link
                href={`/scraper?industry=${encodeURIComponent(search.industry)}&city=${encodeURIComponent(
                  search.city,
                )}&country=${encodeURIComponent(search.country)}&resultCount=${
                  search.resultCount
                }&autorun=1`}
                className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                View Results
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
