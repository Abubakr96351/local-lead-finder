import "dotenv/config";
import { writeFile, mkdir } from "node:fs/promises";
import pLimit from "p-limit";
import { searchPlaces } from "./places.js";
import { checkWebsite } from "./websiteCheck.js";
import { scoreLead } from "./score.js";
import { toCsv } from "./csv.js";

const WEBSITE_CHECK_CONCURRENCY = 10;

async function main() {
  const [industry, city] = process.argv.slice(2);

  if (!industry || !city) {
    console.error('Usage: npm run find-leads -- "hvac contractor" "Boise, ID"');
    process.exit(1);
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error(
      "Missing GOOGLE_PLACES_API_KEY. Copy .env.example to .env and add your key.",
    );
    process.exit(1);
  }

  const query = `${industry} in ${city}`;
  console.log(`Searching Places API for: "${query}"`);

  const places = await searchPlaces(query, apiKey);
  console.log(`Found ${places.length} businesses. Checking websites...`);

  const limit = pLimit(WEBSITE_CHECK_CONCURRENCY);
  let checked = 0;

  const leads = await Promise.all(
    places.map((place) =>
      limit(async () => {
        const website = place.websiteUri
          ? await checkWebsite(place.websiteUri)
          : null;
        checked += 1;
        process.stdout.write(`\rChecked ${checked}/${places.length}`);
        return scoreLead(place, website);
      }),
    ),
  );
  console.log();

  leads.sort((a, b) => {
    const order = [
      "no_website",
      "broken_website",
      "outdated_website",
      "reputation_risk",
      "cold",
    ];
    return order.indexOf(a.opportunityType) - order.indexOf(b.opportunityType);
  });

  await mkdir("out", { recursive: true });
  const slug = `${industry}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const filename = `out/${slug}.csv`;

  await writeFile(filename, toCsv(leads), "utf-8");

  const counts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.opportunityType] = (acc[l.opportunityType] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`\nWrote ${leads.length} leads to ${filename}`);
  console.log("Breakdown:", counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
