import { prisma } from "@/lib/prisma";
import {
  verifyPasswordTimingSafe,
  createSession,
  isLockedOut,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "@/lib/auth";

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as LoginBody;

  if (!email || !password) {
    return new Response("Email and password are required", { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Locked accounts are rejected before touching the password at all — the
  // verification work only happens below, on the "not locked" path, so the
  // response time here can't be used to confirm a guessed password (there's
  // nothing to confirm; it was never checked).
  if (user && isLockedOut(user)) {
    const minutes = Math.ceil((user.lockedUntil!.getTime() - Date.now()) / 60_000);
    return new Response(
      `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      { status: 429 },
    );
  }

  // Always runs the real (slow) scrypt check, even for a nonexistent email,
  // so response time can't distinguish "no such account" from "wrong
  // password" — see verifyPasswordTimingSafe in lib/auth.ts.
  const passwordOk = await verifyPasswordTimingSafe(password, user?.passwordHash ?? null);
  const success = Boolean(user?.active) && passwordOk;

  if (!success) {
    if (user) {
      await recordFailedLogin(user.id);
    }
    return new Response("Invalid email or password", { status: 401 });
  }

  await recordSuccessfulLogin(user!.id);
  await createSession(user!.id);

  return Response.json({ id: user!.id, email: user!.email, role: user!.role });
}
