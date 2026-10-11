import { prisma } from "@/lib/prisma";
import { getCurrentUser, verifyPassword, hashPassword } from "@/lib/auth";

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { currentPassword, newPassword } = (await request.json()) as ChangePasswordBody;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return new Response("Current password and a new 8+ character password are required", {
      status: 400,
    });
  }

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(currentPassword, dbUser.passwordHash))) {
    return new Response("Current password is incorrect", { status: 401 });
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return new Response(null, { status: 204 });
}
