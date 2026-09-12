import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Supabase's free tier pauses a project after ~7 days without a database
// connection. Vercel Cron hits this daily just to keep a connection alive
// so the project never sits idle long enough to trigger that.
export async function GET(request: Request) {
  if (process.env.CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  await prisma.$queryRaw`SELECT 1`;
  return Response.json({ ok: true, pingedAt: new Date().toISOString() });
}
