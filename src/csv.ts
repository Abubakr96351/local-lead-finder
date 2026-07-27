import type { ScoredLead } from "./score.js";

const HEADERS = [
  "name",
  "address",
  "phone",
  "website",
  "rating",
  "reviewCount",
  "opportunityType",
  "flags",
  "suggestedOpener",
];

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(leads: ScoredLead[]): string {
  const rows = leads.map((lead) =>
    [
      lead.name,
      lead.address,
      lead.phone,
      lead.website,
      lead.rating ?? "",
      lead.reviewCount ?? "",
      lead.opportunityType,
      lead.flags.join("|"),
      lead.suggestedOpener,
    ]
      .map((v) => escapeCsv(String(v)))
      .join(","),
  );

  return [HEADERS.join(","), ...rows].join("\n");
}
