import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";

interface UpdateUserBody {
  role?: "ADMIN" | "USER";
  active?: boolean;
  password?: string;
  name?: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.role !== "ADMIN") return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  const body = (await request.json()) as UpdateUserBody;

  if (id === user.id && (body.active === false || body.role === "USER")) {
    return new Response("You can't demote or deactivate your own account", {
      status: 400,
    });
  }

  const data: Record<string, unknown> = {};
  if (body.role !== undefined) data.role = body.role;
  if (body.active !== undefined) data.active = body.active;
  if (body.name !== undefined) data.name = body.name;
  if (body.password) {
    if (body.password.length < 8) {
      return new Response("Password must be at least 8 characters", { status: 400 });
    }
    data.passwordHash = await hashPassword(body.password);
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });

  return Response.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.role !== "ADMIN") return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  if (id === user.id) {
    return new Response("You can't delete your own account", { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
