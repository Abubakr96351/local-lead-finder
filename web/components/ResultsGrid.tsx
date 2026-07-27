"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import type { ScoredLead } from "@/lib/score";
import { BusinessCard } from "./BusinessCard";

export function ResultsGrid({
  leads,
  industry,
  city,
  selected,
  onToggle,
  onAddToProspects,
  onExportCsv,
  addingToProspects,
}: {
  leads: ScoredLead[];
  industry: string;
  city: string;
  selected: Set<string>;
  onToggle: (placeId: string) => void;
  onAddToProspects: () => void;
  onExportCsv: () => void;
  addingToProspects: boolean;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base">
          <span className="font-semibold text-gray-900">{leads.length} Results For:</span>{" "}
          <span className="text-gray-600">
            {industry} in {city}
          </span>
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Selected Sites: {selected.size}</span>
          <button
            type="button"
            onClick={onAddToProspects}
            disabled={selected.size === 0 || addingToProspects}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addingToProspects ? "Adding…" : "Add To Prospect List"}
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            Export CSV
          </button>
          <div className="flex overflow-hidden rounded-lg border border-gray-300">
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
              className={`flex h-9 w-9 items-center justify-center ${
                view === "list" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              className={`flex h-9 w-9 items-center justify-center border-l border-gray-300 ${
                view === "grid" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={
          view === "grid" ? "grid grid-cols-1 gap-4 md:grid-cols-2" : "flex flex-col gap-4"
        }
      >
        {leads.map((lead) => (
          <BusinessCard
            key={lead.placeId}
            lead={lead}
            selected={selected.has(lead.placeId)}
            onToggle={() => onToggle(lead.placeId)}
          />
        ))}
      </div>
    </div>
  );
}
