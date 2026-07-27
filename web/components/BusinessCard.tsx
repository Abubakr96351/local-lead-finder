import { Phone, Mail, Globe, Star, Check } from "lucide-react";
import { OPPORTUNITY_REASON, type ScoredLead } from "@/lib/score";
import { OutreachGauge } from "./OutreachGauge";
import { LaptopMockup } from "./LaptopMockup";

export function BusinessCard({
  lead,
  selected,
  onToggle,
}: {
  lead: ScoredLead;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm transition ${
        selected ? "border-amber-400 ring-2 ring-amber-300" : "border-gray-200"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{lead.name}</h3>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          aria-label={selected ? "Deselect business" : "Select business"}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
            selected
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-300 bg-white hover:border-gray-400"
          }`}
        >
          {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </button>
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <LaptopMockup
            screenshotPath={lead.screenshotPath}
            alt={`${lead.name} website screenshot`}
          />
        </div>

        <div className="flex w-1/2 flex-col gap-2 text-sm">
          <div>
            <div className="mb-1 text-xs text-gray-500">Outreach Potential:</div>
            <OutreachGauge score={lead.opportunityScore} label={lead.gaugeLabel} />
            {OPPORTUNITY_REASON[lead.opportunityType] && (
              <div className="-mt-1 text-center text-[11px] text-gray-500">
                {OPPORTUNITY_REASON[lead.opportunityType]}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{lead.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{lead.email || "Not found"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Globe className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              <span className="truncate">No website</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Star className="h-3.5 w-3.5 shrink-0" />
            <span>
              {lead.reviewCount === null
                ? "Reviews not checked yet"
                : lead.reviewCount === 0
                  ? "No reviews yet"
                  : `${lead.rating ?? "?"} (${lead.reviewCount} reviews)`}
            </span>
          </div>
        </div>
      </div>

      {lead.flags.includes("site_check_inconclusive_verify_manually") && (
        <p className="mt-3 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
          Site check was blocked by the site&apos;s bot protection — verify manually
          before assuming it&apos;s down.
        </p>
      )}
    </div>
  );
}
