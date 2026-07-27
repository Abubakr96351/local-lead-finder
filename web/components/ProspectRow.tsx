"use client";

import { useState } from "react";
import { Phone, Mail, Globe, Star, FileText, Flame, ThumbsDown, Sparkles, Trash2 } from "lucide-react";
import { LaptopMockup } from "./LaptopMockup";
import { OutreachGauge } from "./OutreachGauge";
import { OutreachModal } from "./OutreachModal";
import type { GaugeLabel } from "@/lib/score";
import { opportunityBullets } from "@/lib/opportunities";

const STATUSES = [
  "new",
  "called",
  "no_answer",
  "interested",
  "not_interested",
  "won",
];

export interface ProspectRowData {
  id: string;
  status: string;
  notes: string | null;
  business: {
    name: string;
    address: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    screenshotPath: string | null;
    rating: number | null;
    reviewCount: number | null;
  };
  signal: {
    opportunityScore: number;
    opportunityLabel: string;
    flags: string[];
    copyrightYear: number | null;
    suggestedOpener: string;
  } | null;
}

export function ProspectRow({
  prospect,
  onDeleted,
}: {
  prospect: ProspectRowData;
  onDeleted?: (id: string) => void;
}) {
  const [status, setStatus] = useState(prospect.status);
  const [notes, setNotes] = useState(prospect.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [outreachOpen, setOutreachOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  async function save(partial: { status?: string; notes?: string }) {
    setSaving(true);
    try {
      await fetch(`/api/prospects/${prospect.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteProspect() {
    if (!confirm(`Remove ${prospect.business.name} from the prospect list?`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/prospects/${prospect.id}`, { method: "DELETE" });
      onDeleted?.(prospect.id);
    } finally {
      setDeleting(false);
    }
  }

  const bullets = prospect.signal
    ? opportunityBullets(prospect.signal.flags).filter((b) => !dismissed.has(b))
    : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900">{prospect.business.name}</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <FileText className="h-4 w-4" /> Add Note
          </button>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              save({ status: e.target.value });
            }}
            className="h-9 rounded-lg border border-gray-300 px-2 text-sm capitalize"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={deleteProspect}
            disabled={deleting}
            aria-label="Delete prospect"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="w-full sm:w-48 shrink-0">
          <LaptopMockup
            screenshotPath={prospect.business.screenshotPath ?? undefined}
            alt={`${prospect.business.name} website screenshot`}
          />
        </div>

        <div className="flex w-44 shrink-0 flex-col gap-2 text-sm">
          {prospect.signal && (
            <div>
              <div className="mb-1 text-xs text-gray-500">Outreach Potential:</div>
              <OutreachGauge
                score={prospect.signal.opportunityScore}
                label={prospect.signal.opportunityLabel as GaugeLabel}
              />
            </div>
          )}
        </div>

        <div className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm">
          <div className="mb-1 text-xs font-medium text-gray-500">Company Info:</div>
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{prospect.business.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{prospect.business.email || "Not found"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Globe className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {prospect.business.website ? (
              <a
                href={prospect.business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-blue-600 hover:underline"
              >
                {prospect.business.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              <span className="truncate">No website</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Star className="h-3.5 w-3.5 shrink-0" />
            <span>
              {prospect.business.reviewCount === null
                ? "Reviews not checked yet"
                : prospect.business.reviewCount === 0
                  ? "No reviews yet"
                  : `${prospect.business.rating ?? "?"} (${prospect.business.reviewCount} reviews)`}
            </span>
          </div>
          {prospect.signal?.copyrightYear && (
            <div className="text-gray-400">© {prospect.signal.copyrightYear}</div>
          )}
        </div>

        {bullets.length > 0 && (
          <div className="min-w-56 flex-1 rounded-lg bg-gray-50 p-4">
            <div className="mb-2 text-sm font-medium text-gray-700">Opportunities:</div>
            <ul className="flex flex-col gap-2">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start justify-between gap-2 text-sm">
                  <span className="flex items-start gap-2 text-gray-700">
                    <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                    {bullet}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDismissed((prev) => new Set(prev).add(bullet))}
                    aria-label="Not relevant"
                    className="shrink-0 text-gray-300 hover:text-gray-500"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => save({ notes })}
        placeholder="Notes from your call…"
        rows={2}
        className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
      />

      <div className="mt-3 flex items-center justify-end gap-2">
        {saving && <span className="text-xs text-gray-400">Saving…</span>}
        <button
          type="button"
          onClick={() => setOutreachOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-amber-300"
        >
          <Sparkles className="h-4 w-4" /> Create Outreach
        </button>
      </div>

      {outreachOpen && (
        <OutreachModal
          lead={{
            name: prospect.business.name,
            phone: prospect.business.phone,
            email: prospect.business.email,
            website: prospect.business.website,
            screenshotPath: prospect.business.screenshotPath,
            gaugeLabel: prospect.signal?.opportunityLabel ?? "Fair",
            flags: prospect.signal?.flags ?? [],
          }}
          onClose={() => setOutreachOpen(false)}
        />
      )}
    </div>
  );
}
