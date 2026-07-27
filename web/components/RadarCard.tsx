"use client";

import { useState } from "react";
import { RefreshCw, Pencil, PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import { stateByName, COUNTRY_CODES } from "@/lib/regions";

export interface RadarData {
  id: string;
  niche: string;
  state: string;
  region: string;
  maxLeadsPerScan: number;
  cadence: string;
  notificationEmail: string | null;
  active: boolean;
  lastScanAt: string | null;
  lastScanNewCount: number | null;
}

export function RadarCard({
  radar,
  onEdit,
  onDeleted,
  onChanged,
}: {
  radar: RadarData;
  onEdit: () => void;
  onDeleted: () => void;
  onChanged: (radar: RadarData) => void;
}) {
  const [scanning, setScanning] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function scanNow() {
    setScanning(true);
    try {
      const res = await fetch(`/api/radar/${radar.id}/scan`, { method: "POST" });
      const data = await res.json();
      onChanged(data.radar);
    } finally {
      setScanning(false);
    }
  }

  async function togglePause() {
    setToggling(true);
    try {
      const res = await fetch(`/api/radar/${radar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !radar.active }),
      });
      const updated = await res.json();
      onChanged(updated);
    } finally {
      setToggling(false);
    }
  }

  async function deleteRadar() {
    await fetch(`/api/radar/${radar.id}`, { method: "DELETE" });
    onDeleted();
  }

  const stateInfo = stateByName(radar.region, radar.state);
  const countryCode = COUNTRY_CODES[radar.region] ?? radar.region;

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${!radar.active ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold capitalize text-gray-900">
              {radar.niche} in {stateInfo?.name ?? radar.state}
            </h3>
            {radar.lastScanNewCount !== null && radar.lastScanNewCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                {radar.lastScanNewCount} new
              </span>
            )}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
              {countryCode}
            </span>
            {!radar.active && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                Paused
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Last scan: {radar.lastScanAt ? new Date(radar.lastScanAt).toLocaleDateString() : "Never"}{" "}
            · <span className="capitalize">{radar.cadence}</span> · up to{" "}
            {radar.maxLeadsPerScan} leads/scan
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={scanNow}
            disabled={scanning || !radar.active}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Scanning…" : "Scan now"}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
          <button
            type="button"
            onClick={togglePause}
            disabled={toggling}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
          >
            {radar.active ? (
              <>
                <PauseCircle className="h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" /> Resume
              </>
            )}
          </button>
          <button
            type="button"
            onClick={deleteRadar}
            className="flex items-center gap-1.5 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
