import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

interface SetupBody {
  email: string;
  password: string;
  name?: string;
}

// Arbitrary fixed key identifying "the setup lock" — any int8 works, it just
// needs to be the same constant every time this route runs.
const SETUP_LOCK_KEY = 72774455;

/**
 * Creates the very first account (always ADMIN). Only works while the User
 * table is empty — once any account exists, this route refuses so it can't
 * be used to mint a second admin later.
 *
 * The count-check and the create happen inside one transaction behind a
 * Postgres advisory lock (held for the transaction's duration), so two
 * requests racing this endpoint at the same moment can't both pass the
 * "table is empty" check and each mint their own admin account.
 */
export async function POST(request: Request) {
  const { email, password, name } = (await request.json()) as SetupBody;

  if (!email || !password || password.length < 8) {
    return new Response("Email and an 8+ character password are required", {
      status: 400,
    });
  }

  const passwordHash = await hashPassword(password);
  const normalizedEmail = email.toLowerCase();

  const admin = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${SETUP_LOCK_KEY})`;

    const existingUserCount = await tx.user.count();
    if (existingUserCount > 0) {
      throw new SetupAlreadyCompleteError();
    }

    const created = await tx.user.create({
      data: { email: normalizedEmail, passwordHash, name: name || null, role: "ADMIN" },
    });

    // Adopt any pre-existing data (from before accounts existed) so it
    // isn't orphaned once per-user scoping takes effect.
    await tx.search.updateMany({
      where: { userId: null },
      data: { userId: created.id },
    });
    await tx.prospect.updateMany({
      where: { userId: null },
      data: { userId: created.id },
    });
    await tx.radar.updateMany({
      where: { userId: null },
      data: { userId: created.id },
    });

    return created;
  }).catch((err) => {
    if (err instanceof SetupAlreadyCompleteError) return null;
    throw err;
  });

  if (!admin) {
    return new Response("Setup has already been completed", { status: 403 });
  }

  await createSession(admin.id);

  return Response.json({ id: admin.id, email: admin.email, role: admin.role });
}

class SetupAlreadyCompleteError extends Error {}
