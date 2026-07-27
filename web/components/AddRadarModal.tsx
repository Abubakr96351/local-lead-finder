"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { REGIONS, statesForRegion, stateByName } from "@/lib/regions";

const SCANS_PER_MONTH: Record<string, number> = {
  weekly: 4.3,
  biweekly: 2.15,
  monthly: 1,
};

const STATE_LABEL: Record<string, string> = {
  "United States": "State",
  India: "State",
  Canada: "Province",
  "United Kingdom": "Region",
  Australia: "State/Territory",
};

export interface RadarFormValues {
  niche: string;
  state: string;
  region: string;
  maxLeadsPerScan: number;
  cadence: string;
  notificationEmail: string;
}

export function AddRadarModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Partial<RadarFormValues>;
  onClose: () => void;
  onSave: (values: RadarFormValues) => Promise<void>;
}) {
  const [niche, setNiche] = useState(initial?.niche ?? "");
  const [state, setState] = useState(initial?.state ?? "Alabama");
  const [region, setRegion] = useState(initial?.region ?? "United States");
  const [maxLeadsPerScan, setMaxLeadsPerScan] = useState(initial?.maxLeadsPerScan ?? 25);
  const [cadence, setCadence] = useState(initial?.cadence ?? "weekly");
  const [notificationEmail, setNotificationEmail] = useState(initial?.notificationEmail ?? "");
  const [saving, setSaving] = useState(false);

  const statesInRegion = statesForRegion(region);
  const stateInfo = stateByName(region, state);
  const cityCount = stateInfo?.cities.length ?? 0;
  const firstCity = stateInfo?.cities[0] ?? "";
  const perMonth = Math.round(maxLeadsPerScan * (SCANS_PER_MONTH[cadence] ?? 4.3));

  function changeRegion(nextRegion: string) {
    setRegion(nextRegion);
    setState(statesForRegion(nextRegion)[0]?.name ?? "");
  }

  async function submit() {
    setSaving(true);
    try {
      await onSave({ niche, state, region, maxLeadsPerScan, cadence, notificationEmail });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {initial ? "Edit Radar" : "Add a Radar"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-700">Niche</label>
        <input
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder='e.g. "plumbers"'
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">Region</label>
        <select
          value={region}
          onChange={(e) => changeRegion(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm font-medium text-gray-700">
          {STATE_LABEL[region] ?? "State"}
        </label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="mb-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
        >
          {statesInRegion.map((s) => (
            <option key={s.abbr} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <p className="mb-4 text-xs text-gray-500">
          We&apos;ll rotate through {cityCount} cities in {state} (biggest first). First
          scan: <strong>{firstCity}</strong>.
        </p>

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Max new leads per scan
        </label>
        <div className="mb-4 grid grid-cols-2 gap-3">
          {[15, 25].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setMaxLeadsPerScan(n)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-semibold ${
                maxLeadsPerScan === n
                  ? "border-amber-400 bg-amber-50 text-gray-900"
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              {n} {n === 25 && <span className="font-normal text-gray-400">max</span>}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-700">Scan cadence</label>
        <div className="mb-2 grid grid-cols-3 gap-3">
          {["weekly", "biweekly", "monthly"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCadence(c)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-semibold capitalize ${
                cadence === c
                  ? "border-amber-400 bg-amber-50 text-gray-900"
                  : "border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="mb-4 text-xs text-gray-500">
          This radar can find up to <strong>{maxLeadsPerScan} new leads</strong> per scan
          (~{perMonth}/month). Lower the cap or stretch the cadence to spread scans
          across more radars.
        </p>

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Notification email <span className="text-gray-400">(optional)</span>
        </label>
        <input
          value={notificationEmail}
          onChange={(e) => setNotificationEmail(e.target.value)}
          placeholder="Defaults to your account email"
          className="mb-6 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!niche || saving}
          className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : initial ? "Save Radar" : "Create Radar"}
        </button>
      </div>
    </div>
  );
}
