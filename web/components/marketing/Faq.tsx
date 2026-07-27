"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Where does the business data come from?",
    a: "Every lead is pulled live from the Google Places API — name, address, phone, website, rating, and review count — so the details are current, not scraped from a stale database.",
  },
  {
    q: "How does it decide a lead is a good opportunity?",
    a: "Each business's website gets checked for reachability, HTTPS, mobile viewport support, and a stale copyright year, then rolled up into an opportunity score with a plain-language reason so you know exactly what to lead with.",
  },
  {
    q: "Do repeat searches cost anything?",
    a: "No. Results are cached for 7 days, so reopening a past search from the Past Searches tab is instant and free — you only pay Places API costs on a fresh search.",
  },
  {
    q: "Can I get new leads without running searches myself?",
    a: "Yes — set up a Radar for a niche and region with a weekly or custom cadence, and it scans on autopilot and can email you when it finds new prospects.",
  },
  {
    q: "Can I get the data out?",
    a: "Every result set exports to CSV in one click, and anything you shortlist can be added to a persistent Prospect List to track outreach status over time.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-gray-200 border-y border-gray-200">
      {FAQS.map((item, i) => {
        const expanded = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : i)}
              aria-expanded={expanded}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-medium text-gray-900">{item.q}</span>
              <ChevronDown
                className={`h-4.5 w-4.5 shrink-0 text-gray-400 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>
            {expanded && (
              <p className="pb-5 pr-8 text-sm leading-relaxed text-gray-600">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
