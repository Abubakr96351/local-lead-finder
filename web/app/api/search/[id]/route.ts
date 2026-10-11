import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const search = await prisma.search.findUnique({ where: { id } });
  if (!search) return new Response("Not found", { status: 404 });
  if (user.role !== "ADMIN" && search.userId !== user.id) {
    return new Response("Not found", { status: 404 });
  }

  // SearchResult rows cascade-delete with it; the underlying Business /
  // WebsiteSignal records are a shared cache and stay untouched.
  await prisma.search.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
