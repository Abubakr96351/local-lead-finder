import { Resend } from "resend";
import type { Radar } from "@prisma/client";
import type { NewRadarLead } from "@/lib/radarScan";

const FROM_ADDRESS = "Local Lead Finder <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Resolves who a radar's digest email goes to: the radar's own override,
 *  falling back to the owning account's email — matching what the "Add a
 *  Radar" form's placeholder already promises ("Defaults to your account
 *  email"). */
export function resolveNotificationEmail(
  radar: Pick<Radar, "notificationEmail">,
  ownerEmail: string,
): string {
  return radar.notificationEmail || ownerEmail;
}

/**
 * Fires a digest email for a radar's cron-triggered scan. Only called when
 * newCount > 0 (see app/api/cron/radar-scan/route.ts) — no "nothing found"
 * noise. A send failure is caught and logged by the caller, never thrown
 * back into the scan pipeline; one bad email shouldn't fail the scan or
 * block the rest of the cron run.
 */
export async function sendRadarDigestEmail(params: {
  to: string;
  radar: Pick<Radar, "niche" | "state">;
  newCount: number;
  newLeads: NewRadarLead[];
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(
      `[radar email] RESEND_API_KEY not set — would have emailed ${params.to}: ` +
        `${params.newCount} new ${params.radar.niche} prospect(s) in ${params.radar.state}`,
    );
    return;
  }

  const resend = new Resend(apiKey);
  const { to, radar, newCount, newLeads } = params;
  const plural = newCount === 1 ? "" : "s";

  const leadItems = newLeads
    .slice(0, 20)
    .map((lead) => `<li>${escapeHtml(lead.name)} — <strong>${escapeHtml(lead.gaugeLabel)}</strong></li>`)
    .join("");

  const html = `
    <p>Your radar for <strong>${escapeHtml(radar.niche)}</strong> in <strong>${escapeHtml(radar.state)}</strong> found ${newCount} new prospect${plural}.</p>
    <ul>${leadItems}</ul>
    <p><a href="${APP_URL}/prospects">View your Prospect List</a></p>
  `;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `${newCount} new prospect${plural} for ${radar.niche} in ${radar.state}`,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
