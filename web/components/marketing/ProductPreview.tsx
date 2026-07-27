import { Phone, Mail, Globe, Star } from "lucide-react";
import { LaptopMockup } from "@/components/LaptopMockup";
import { OutreachGauge } from "@/components/OutreachGauge";

const SAMPLE_LEADS = [
  {
    name: "Riverside Plumbing Co.",
    score: 82,
    label: "Great!" as const,
    reason: "No mobile-friendly site — most searches happen on a phone.",
    phone: "(555) 812-4471",
    email: "info@riversideplumb.com",
    website: "riversideplumbing.biz",
    rating: "4.2 (11 reviews)",
    screenshotPath: "/screenshots/ChIJzxqIw58_1moRZpwDsN5HOHY.png",
  },
  {
    name: "Sunset Auto Detailing",
    score: 58,
    label: "Good!" as const,
    reason: "Copyright footer stuck on 2018 — site hasn't been touched in years.",
    phone: "(555) 293-0087",
    email: "Not found",
    website: "sunsetautodetail.com",
    rating: "4.6 (34 reviews)",
    screenshotPath: "/screenshots/ChIJT9M218tC1moR7-_FV3BzI88.png",
  },
];

export function ProductPreview() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl shadow-gray-900/10 sm:p-5">
      <div className="mb-4 flex items-center gap-2 px-1">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="ml-3 text-xs font-medium text-gray-400">
          plumbers in Fort Lauderdale, FL — 2 of 18 results
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {SAMPLE_LEADS.map((lead) => (
          <div key={lead.name} className="rounded-xl border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">{lead.name}</h3>
            <div className="flex gap-3">
              <div className="w-1/2">
                <LaptopMockup screenshotPath={lead.screenshotPath} alt={`${lead.name} website`} />
              </div>
              <div className="flex w-1/2 flex-col gap-1.5 text-xs">
                <div className="mb-0.5 text-[10px] text-gray-400">Outreach Potential:</div>
                <OutreachGauge score={lead.score} label={lead.label} />
                <p className="-mt-1 text-center text-[10px] text-gray-500">{lead.reason}</p>
                <div className="mt-1.5 flex items-center gap-1.5 text-gray-600">
                  <Phone className="h-3 w-3 shrink-0 text-gray-400" />
                  <span className="truncate">{lead.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Mail className="h-3 w-3 shrink-0 text-gray-400" />
                  <span className="truncate">{lead.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Globe className="h-3 w-3 shrink-0 text-gray-400" />
                  <span className="truncate">{lead.website}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Star className="h-3 w-3 shrink-0" />
                  <span className="truncate">{lead.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
