"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { RadarCard, type RadarData } from "./RadarCard";
import { AddRadarModal, type RadarFormValues } from "./AddRadarModal";

const MAX_RADARS = 15;

export function RadarPageClient({ initialRadars }: { initialRadars: RadarData[] }) {
  const [radars, setRadars] = useState<RadarData[]>(initialRadars);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RadarData | null>(null);

  const activeCount = radars.filter((r) => r.active).length;

  async function handleSave(values: RadarFormValues) {
    if (editing) {
      const res = await fetch(`/api/radar/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const updated = await res.json();
      setRadars((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } else {
      const res = await fetch("/api/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const created = await res.json();
      setRadars((prev) => [created, ...prev]);
    }
    setModalOpen(false);
    setEditing(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Radar</h1>
      <p className="mt-1 text-sm text-gray-500">
        Pick a niche + state. We&apos;ll scan on your chosen cadence and drop new matches
        straight into your Prospect List.
      </p>

      <div className="mt-5 flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {activeCount} / {MAX_RADARS} radars active
        </span>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          disabled={radars.length >= MAX_RADARS}
          className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add Radar
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {radars.length === 0 ? (
          <p className="text-sm text-gray-500">
            No radars yet — add one to start automatically watching a niche + state.
          </p>
        ) : (
          radars.map((radar) => (
            <RadarCard
              key={radar.id}
              radar={radar}
              onEdit={() => {
                setEditing(radar);
                setModalOpen(true);
              }}
              onDeleted={() => setRadars((prev) => prev.filter((r) => r.id !== radar.id))}
              onChanged={(updated) =>
                setRadars((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
              }
            />
          ))
        )}
      </div>

      {modalOpen && (
        <AddRadarModal
          initial={
            editing
              ? { ...editing, notificationEmail: editing.notificationEmail ?? undefined }
              : undefined
          }
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
