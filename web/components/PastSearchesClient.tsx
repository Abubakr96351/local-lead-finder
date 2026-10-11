"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export interface PastSearchRow {
  id: string;
  industry: string;
  city: string;
  country: string;
  resultCount: number;
  estCostUsd: number;
  /** Pre-formatted on the server (toLocaleString()) to avoid a hydration
   *  mismatch from server/client locale differences. */
  runAt: string;
}

export function PastSearchesClient({ initialSearches }: { initialSearches: PastSearchRow[] }) {
  const [searches, setSearches] = useState<PastSearchRow[]>(initialSearches);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const allSelected = searches.length > 0 && selected.size === searches.length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(searches.map((s) => s.id)));
  }

  async function handleDelete(search: PastSearchRow) {
    if (!window.confirm(`Delete this search (${search.industry} in ${search.city})?`)) {
      return;
    }
    const res = await fetch(`/api/search/${search.id}`, { method: "DELETE" });
    if (!res.ok) return;
    setSearches((prev) => prev.filter((s) => s.id !== search.id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(search.id);
      return next;
    });
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected search${ids.length === 1 ? "" : "es"}?`)) {
      return;
    }

    setDeleting(true);
    const results = await Promise.all(
      ids.map((id) => fetch(`/api/search/${id}`, { method: "DELETE" }).then((r) => ({ id, ok: r.ok }))),
    );
    setDeleting(false);

    const deletedIds = new Set(results.filter((r) => r.ok).map((r) => r.id));
    setSearches((prev) => prev.filter((s) => !deletedIds.has(s.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      deletedIds.forEach((id) => next.delete(id));
      return next;
    });

    const failedCount = results.length - deletedIds.size;
    if (failedCount > 0) {
      window.alert(`${failedCount} search${failedCount === 1 ? "" : "es"} couldn't be deleted.`);
    }
  }

  if (searches.length === 0) {
    return (
      <p className="mt-6 text-sm text-gray-500">
        No searches yet — run one from the Scraper page.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="h-4 w-4 accent-brand-blue"
          />
          Select all
        </label>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? "Deleting…" : `Delete ${selected.size} selected`}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {searches.map((search) => (
          <div
            key={search.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.has(search.id)}
                onChange={() => toggleOne(search.id)}
                aria-label="Select search"
                className="h-4 w-4 accent-brand-blue"
              />
              <div>
                <h3 className="font-semibold capitalize text-gray-900">
                  {search.industry} in {search.city}
                </h3>
                <p className="text-xs text-gray-500">
                  {search.country} · {search.resultCount} results · $
                  {search.estCostUsd.toFixed(2)} · {search.runAt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/scraper?industry=${encodeURIComponent(search.industry)}&city=${encodeURIComponent(
                  search.city,
                )}&country=${encodeURIComponent(search.country)}&resultCount=${
                  search.resultCount
                }&autorun=1`}
                className="rounded-lg border border-brand-blue px-4 py-2 text-sm font-medium text-brand-blue hover:bg-brand-blue-subtle"
              >
                View Results
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(search)}
                aria-label="Delete search"
                className="flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
