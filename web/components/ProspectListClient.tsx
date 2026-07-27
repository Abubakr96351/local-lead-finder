"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { ProspectRow, type ProspectRowData } from "./ProspectRow";

export function ProspectListClient({ prospects: initialProspects }: { prospects: ProspectRowData[] }) {
  const [view, setView] = useState<"grid" | "list">("list");
  const [prospects, setProspects] = useState(initialProspects);

  function handleDeleted(id: string) {
    setProspects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">
          Prospect List ({prospects.length})
        </h1>
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

      {prospects.length === 0 ? (
        <p className="text-sm text-gray-500">
          No prospects yet — run a search on the Scraper page and add businesses here.
        </p>
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 gap-4 lg:grid-cols-2" : "flex flex-col gap-4"}>
          {prospects.map((prospect) => (
            <ProspectRow key={prospect.id} prospect={prospect} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
