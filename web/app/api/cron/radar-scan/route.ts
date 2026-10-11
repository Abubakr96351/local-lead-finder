import { prisma } from "@/lib/prisma";
import { isRadarDue, runRadarScan } from "@/lib/radarScan";
import { resolveNotificationEmail, sendRadarDigestEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Leave a safety margin under maxDuration so an in-flight scan isn't killed
// mid-write — anything we don't get to is still "due" and picks up on
// tomorrow's run, just a day later than ideal.
const TIME_BUDGET_MS = 270_000;

// Unlike /api/cron/keep-alive (a harmless SELECT 1), this route triggers
// real Google Places spend and real emails, so CRON_SECRET is required, not
// optional — there's no legitimate reason to run this without it configured.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response("CRON_SECRET is not configured", { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const startedAt = Date.now();
  const radars = await prisma.radar.findMany({
    where: { active: true },
    include: { user: true },
  });

  const due = radars.filter((radar) => isRadarDue(radar));

  const scanned: string[] = [];
  const skipped: string[] = [];

  for (const radar of due) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      skipped.push(radar.id);
      continue;
    }

    try {
      // A radar with no owner (pre-auth legacy data) has no one to notify —
      // skip it rather than guessing an owner.
      if (!radar.userId || !radar.user) {
        skipped.push(radar.id);
        continue;
      }

      const result = await runRadarScan(radar, radar.userId);
      scanned.push(radar.id);

      if (result.newCount > 0) {
        const to = resolveNotificationEmail(radar, radar.user.email);
        try {
          await sendRadarDigestEmail({ to, radar, newCount: result.newCount, newLeads: result.newLeads });
        } catch (err) {
          console.error(`[radar-scan cron] email failed for radar ${radar.id}:`, err);
        }
      }
    } catch (err) {
      console.error(`[radar-scan cron] scan failed for radar ${radar.id}:`, err);
      skipped.push(radar.id);
    }
  }

  return Response.json({
    dueCount: due.length,
    scanned: scanned.length,
    skipped: skipped.length,
    durationMs: Date.now() - startedAt,
  });
}
