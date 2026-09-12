import Image from "next/image";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <Image
            src="/logo-mark.png"
            alt="Local Lead Finder"
            width={24}
            height={20}
            className="h-6 w-auto"
          />
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
