import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.role !== "ADMIN") return new Response("Forbidden", { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });

  return Response.json(users);
}

interface CreateUserBody {
  email: string;
  password: string;
  name?: string;
  role?: "ADMIN" | "USER";
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (user.role !== "ADMIN") return new Response("Forbidden", { status: 403 });

  const body = (await request.json()) as CreateUserBody;
  if (!body.email || !body.password || body.password.length < 8) {
    return new Response("Email and an 8+ character password are required", {
      status: 400,
    });
  }

  const passwordHash = await hashPassword(body.password);

  try {
    const created = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        name: body.name || null,
        role: body.role === "ADMIN" ? "ADMIN" : "USER",
      },
      select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    });
    return Response.json(created);
  } catch {
    return new Response("A user with that email already exists", { status: 409 });
  }
}
