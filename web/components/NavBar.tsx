"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound, ChevronDown, Radar as RadarIcon } from "lucide-react";

const TABS = [
  { label: "Scraper", href: "/scraper" },
  { label: "Prospect List", href: "/prospects" },
  { label: "Radar", href: "/radar" },
  { label: "Past Searches", href: "/past-searches" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="bg-[#111214] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-10">
          <Link href="/scraper" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-[#111214]">
              <RadarIcon className="h-4.5 w-4.5" strokeWidth={2.25} />
            </span>
            <span className="text-lg font-semibold leading-tight tracking-tight">
              Local Lead
              <br />
              Finder
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {TABS.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={
                    active
                      ? "font-medium text-white underline decoration-2 underline-offset-8"
                      : "text-gray-400 hover:text-white"
                  }
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <CircleUserRound className="h-7 w-7" />
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </header>
  );
}
