import { prisma } from "@/lib/prisma";
import { ProspectListClient } from "@/components/ProspectListClient";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const prospects = await prisma.prospect.findMany({
    include: { business: { include: { signal: true } } },
    orderBy: { addedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <ProspectListClient
        prospects={prospects.map((prospect) => ({
          id: prospect.id,
          status: prospect.status,
          notes: prospect.notes,
          business: prospect.business,
          signal: prospect.business.signal
            ? {
                opportunityScore: prospect.business.signal.opportunityScore,
                opportunityLabel: prospect.business.signal.opportunityLabel,
                flags: prospect.business.signal.flags.split("|").filter(Boolean),
                copyrightYear: prospect.business.signal.copyrightYear,
                suggestedOpener: prospect.business.signal.suggestedOpener,
              }
            : null,
        }))}
      />
    </div>
  );
}
