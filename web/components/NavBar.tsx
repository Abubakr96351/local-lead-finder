"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleUserRound,
  ChevronDown,
  Radar as RadarIcon,
  Menu,
  X,
} from "lucide-react";

const TABS = [
  { label: "Scraper", href: "/scraper" },
  { label: "Prospect List", href: "/prospects" },
  { label: "Radar", href: "/radar" },
  { label: "Past Searches", href: "/past-searches" },
];

export function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-[#111214] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-10">
          <Link
            href="/scraper"
            className="flex shrink-0 items-center gap-2.5"
            onClick={() => setMenuOpen(false)}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[#111214]">
              <RadarIcon className="h-4.5 w-4.5" strokeWidth={2.25} />
            </span>
            <span className="whitespace-nowrap text-lg font-semibold leading-tight tracking-tight">
              Local Lead Finder
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm lg:flex">
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
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-1 text-gray-400 sm:flex">
            <CircleUserRound className="h-7 w-7" />
            <ChevronDown className="h-4 w-4" />
          </div>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-300 hover:bg-white/10 hover:text-white lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 text-sm lg:hidden">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMenuOpen(false)}
                className={
                  active
                    ? "rounded-md bg-white/10 px-3 py-2 font-medium text-white"
                    : "rounded-md px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white"
                }
              >
                {tab.label}
              </Link>
            );
          })}
          <div className="flex items-center gap-2 px-3 py-2 text-gray-400 sm:hidden">
            <CircleUserRound className="h-6 w-6" />
            <span>Account</span>
          </div>
        </nav>
      )}
    </header>
  );
}
