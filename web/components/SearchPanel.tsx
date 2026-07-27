"use client";

import { Search, Shuffle } from "lucide-react";
import { NichePicker } from "./NichePicker";
import { EXAMPLE_CITIES, NICHE_CATEGORIES } from "@/lib/niches";

const ALL_NICHES = NICHE_CATEGORIES.flatMap((c) => c.niches);

export interface SearchParams {
  industry: string;
  city: string;
  country: string;
  resultCount: number;
}

export interface UsageStats {
  searchesToday: number;
  prospectsCount: number;
  radarsActiveCount: number;
}

export function SearchPanel({
  params,
  onChange,
  onSubmit,
  loading,
  costNote,
  forceRefresh,
  onForceRefreshChange,
  stats,
}: {
  params: SearchParams;
  onChange: (params: SearchParams) => void;
  onSubmit: () => void;
  loading: boolean;
  costNote?: string;
  forceRefresh: boolean;
  onForceRefreshChange: (value: boolean) => void;
  stats?: UsageStats;
}) {
  function randomNiche() {
    const pick = ALL_NICHES[Math.floor(Math.random() * ALL_NICHES.length)];
    onChange({ ...params, industry: pick.value });
  }

  function randomCity() {
    const pick = EXAMPLE_CITIES[Math.floor(Math.random() * EXAMPLE_CITIES.length)];
    onChange({ ...params, city: pick });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Business Niche
          </label>
          <div className="flex gap-2">
            <input
              value={params.industry}
              onChange={(e) => onChange({ ...params, industry: e.target.value })}
              placeholder='e.g. "pest control", "plumber"'
              className="h-11 flex-1 rounded-lg border border-gray-300 px-3 text-sm focus:border-gray-500 focus:outline-none"
            />
            <NichePicker onSelect={(value) => onChange({ ...params, industry: value })} />
            <button
              type="button"
              onClick={randomNiche}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#111214] text-white"
              aria-label="Random niche"
            >
              <Shuffle className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
          <div className="flex gap-2">
            <input
              value={params.city}
              onChange={(e) => onChange({ ...params, city: e.target.value })}
              placeholder='e.g. "Boise, ID", "Tampa, FL"'
              className="h-11 flex-1 rounded-lg border border-gray-300 px-3 text-sm focus:border-gray-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={randomCity}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#111214] text-white"
              aria-label="Random city"
            >
              <Shuffle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Scrape Results
          </label>
          <select
            value={params.resultCount}
            onChange={(e) =>
              onChange({ ...params, resultCount: Number(e.target.value) })
            }
            className="h-11 rounded-lg border border-gray-300 px-3 text-sm"
          >
            {[10, 15, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n} results
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Country
          </label>
          <select
            value={params.country}
            onChange={(e) => onChange({ ...params, country: e.target.value })}
            className="h-11 rounded-lg border border-gray-300 px-3 text-sm"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="India">India</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !params.industry || !params.city}
          className="flex h-11 items-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-semibold text-gray-900 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          {loading ? "Scraping…" : "Start Scrape"}
        </button>

        <label className="flex h-11 items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={forceRefresh}
            onChange={(e) => onForceRefreshChange(e.target.checked)}
            className="h-4 w-4 accent-amber-500"
          />
          Force refresh
        </label>

        {costNote && (
          <span className="ml-auto text-xs text-gray-400">{costNote}</span>
        )}
      </div>

      {stats && (
        <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400">
          <span>{stats.searchesToday} searches today</span>
          <span>·</span>
          <span>{stats.prospectsCount} prospects in list</span>
          <span>·</span>
          <span>{stats.radarsActiveCount} radars active</span>
        </div>
      )}
    </div>
  );
}
