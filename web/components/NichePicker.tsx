"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { NICHE_CATEGORIES } from "@/lib/niches";

export function NichePicker({
  onSelect,
}: {
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#111214] text-white"
        aria-label="Browse niche categories"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute left-0 top-13 z-20 max-h-96 w-[26rem] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
          {NICHE_CATEGORIES.map((category) => (
            <div key={category.title} className="mb-4 last:mb-0">
              <div className="mb-2 text-xs font-semibold tracking-wide text-gray-400">
                {category.title.toUpperCase()}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {category.niches.map((niche) => {
                  const Icon = niche.icon;
                  return (
                    <button
                      key={niche.value}
                      type="button"
                      onClick={() => {
                        onSelect(niche.value);
                        setOpen(false);
                      }}
                      className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-200 p-2 text-center hover:border-gray-400"
                    >
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full"
                        style={{ backgroundColor: niche.bg }}
                      >
                        <Icon className="h-4.5 w-4.5" style={{ color: niche.fg }} />
                      </span>
                      <span className="text-[11px] leading-tight text-gray-700">
                        {niche.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
