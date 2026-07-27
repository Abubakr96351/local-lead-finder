"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchPanel, type SearchParams, type UsageStats } from "@/components/SearchPanel";
import { ResultsGrid } from "@/components/ResultsGrid";
import type { ScoredLead } from "@/lib/score";
import { downloadCsv } from "@/lib/csv";

interface SearchEvent {
  type: "found" | "progress" | "cached" | "done" | "error";
  phase?: "sites" | "reviews";
  total?: number;
  checked?: number;
  leads?: ScoredLead[];
  estCostUsd?: number;
  placesApiRequests?: number;
  fromCache?: boolean;
  cachedAt?: string;
  message?: string;
}

export default function ScraperPage() {
  return (
    <Suspense>
      <ScraperPageInner />
    </Suspense>
  );
}

function ScraperPageInner() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<SearchParams>(() => {
    const industry = searchParams.get("industry");
    const city = searchParams.get("city");
    if (industry && city) {
      return {
        industry,
        city,
        country: searchParams.get("country") || "United States",
        resultCount: Number(searchParams.get("resultCount")) || 15,
      };
    }
    return {
      industry: "",
      city: "",
      country: "United States",
      resultCount: 15,
    };
  });
  const [forceRefresh, setForceRefresh] = useState(false);
  const [leads, setLeads] = useState<ScoredLead[]>([]);
  const [ranQuery, setRanQuery] = useState({ industry: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{
    phase: "sites" | "reviews";
    checked: number;
    total: number;
  } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [costNote, setCostNote] = useState<string | undefined>();
  const [addingToProspects, setAddingToProspects] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<UsageStats | undefined>();

  function refreshStats() {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {});
  }

  useEffect(() => {
    refreshStats();
  }, []);

  useEffect(() => {
    if (searchParams.get("autorun") === "1" && params.industry && params.city) {
      startScrape();
    }
    // Only ever autorun once, right after the params were seeded from the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startScrape() {
    setLoading(true);
    setError(null);
    setLeads([]);
    setSelected(new Set());
    setProgress(null);
    setAddedMessage(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, forceRefresh }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Search failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const line = chunk.trim();
          if (!line.startsWith("data:")) continue;
          const event = JSON.parse(line.slice(5)) as SearchEvent;

          if (event.type === "found") {
            setProgress({ phase: "sites", checked: 0, total: event.total ?? 0 });
          } else if (event.type === "progress") {
            setProgress({
              phase: event.phase ?? "sites",
              checked: event.checked ?? 0,
              total: event.total ?? 0,
            });
          } else if (event.type === "cached") {
            const when = event.cachedAt ? new Date(event.cachedAt) : null;
            setCostNote(
              `Loaded from cache${when ? ` · searched ${when.toLocaleDateString()}` : ""} · $0.00`,
            );
          } else if (event.type === "done") {
            setLeads(event.leads ?? []);
            setRanQuery({ industry: params.industry, city: params.city });
            if (!event.fromCache && event.estCostUsd !== undefined) {
              setCostNote(
                `~${event.placesApiRequests} Places API requests · ~$${event.estCostUsd.toFixed(2)} this search`,
              );
            }
            refreshStats();
          } else if (event.type === "error") {
            setError(event.message ?? "Unknown error");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  function toggleSelected(placeId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  }

  async function addToProspectList() {
    setAddingToProspects(true);
    setAddedMessage(null);
    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeIds: Array.from(selected) }),
      });
      const data = await res.json();
      setAddedMessage(`Added ${data.added} to your prospect list.`);
      setSelected(new Set());
      refreshStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAddingToProspects(false);
    }
  }

  function exportCsv() {
    const filename = `${ranQuery.industry}-${ranQuery.city}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    downloadCsv(leads, `${filename || "leads"}.csv`);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <SearchPanel
        params={params}
        onChange={setParams}
        onSubmit={startScrape}
        loading={loading}
        costNote={costNote}
        forceRefresh={forceRefresh}
        onForceRefreshChange={setForceRefresh}
        stats={stats}
      />

      {loading && (
        <div className="mt-6 text-sm text-gray-500">
          {progress
            ? progress.phase === "reviews"
              ? `Checking reviews for ${progress.checked}/${progress.total} leads…`
              : `Checked ${progress.checked}/${progress.total} websites…`
            : "Searching Google Maps…"}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {addedMessage && (
        <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {addedMessage}
        </div>
      )}

      {leads.length > 0 && (
        <div className="mt-8">
          <ResultsGrid
            leads={leads}
            industry={ranQuery.industry}
            city={ranQuery.city}
            selected={selected}
            onToggle={toggleSelected}
            onAddToProspects={addToProspectList}
            onExportCsv={exportCsv}
            addingToProspects={addingToProspects}
          />
        </div>
      )}
    </div>
  );
}
