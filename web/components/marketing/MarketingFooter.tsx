import Link from "next/link";
import { Radar as RadarIcon } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111214] text-amber-400">
            <RadarIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <span>Local Lead Finder</span>
        </div>
        <p>Built on Google Maps data. Not affiliated with Google.</p>
        <Link href="/scraper" className="font-medium text-gray-900 hover:underline">
          Open the scraper →
        </Link>
      </div>
    </footer>
  );
}
