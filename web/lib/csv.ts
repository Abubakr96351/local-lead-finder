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

// Scraped business data (names, addresses) is untrusted external input. A
// value starting with =, +, -, or @ gets interpreted as a formula by Excel
// and Google Sheets when the CSV is opened — prefixing it with a single
// quote neutralizes that without changing what the cell displays.
const FORMULA_TRIGGER_RE = /^[=+\-@]/;

function escapeCsv(value: string): string {
  const safeValue = FORMULA_TRIGGER_RE.test(value) ? `'${value}` : value;
  if (safeValue.includes(",") || safeValue.includes('"') || safeValue.includes("\n")) {
    return `"${safeValue.replace(/"/g, '""')}"`;
  }
  return safeValue;
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
