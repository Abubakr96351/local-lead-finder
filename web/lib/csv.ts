import type { ScoredLead } from "./score";

const HEADERS = [
  "name",
  "address",
  "phone",
  "email",
  "website",
  "rating",
  "reviewCount",
  "opportunityType",
  "gaugeLabel",
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
      lead.email ?? "",
      lead.website,
      lead.rating ?? "",
      lead.reviewCount ?? "",
      lead.opportunityType,
      lead.gaugeLabel,
      lead.flags.join("|"),
      lead.suggestedOpener,
    ]
      .map((v) => escapeCsv(String(v)))
      .join(","),
  );

  return [HEADERS.join(","), ...rows].join("\n");
}

export function downloadCsv(leads: ScoredLead[], filename: string) {
  const blob = new Blob([toCsv(leads)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
