import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

const scryptAsync = promisify(scrypt);

const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// A fixed, validly-formatted hash with no real matching password. Verifying
// against this when an email doesn't exist costs the same scrypt time as a
// real wrong-password attempt, so a login's response time can't be used to
// tell "no such account" apart from "wrong password" (user enumeration via
// timing side-channel).
const DUMMY_PASSWORD_HASH =
  "85fe2340c487567f259693ff76dbe7d4:9497e408e769ef1e78d1896c0eb670beba3d61d20fa30c6fd3e0d8f10aa6358ac63290ce669d094836bb7ec29d340bb0db9478b7e0439653022f6f4e30b6d0f6";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hashHex, "hex");
  if (derived.length !== storedBuf.length) return false;
  return timingSafeEqual(derived, storedBuf);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Always runs a real scrypt verification, even for a nonexistent user
 *  (against DUMMY_PASSWORD_HASH), so login timing doesn't leak which case
 *  it was. Always returns false for the dummy case regardless of password. */
export async function verifyPasswordTimingSafe(
  password: string,
  stored: string | null,
): Promise<boolean> {
  const ok = await verifyPassword(password, stored ?? DUMMY_PASSWORD_HASH);
  return stored !== null && ok;
}

export function isLockedOut(user: { lockedUntil: Date | null }): boolean {
  return user.lockedUntil !== null && user.lockedUntil > new Date();
}

/** Call on a failed login. Locks the account for 15 minutes after
 *  LOGIN_MAX_ATTEMPTS consecutive failures. */
export async function recordFailedLogin(userId: string): Promise<void> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: { increment: 1 } },
  });

  if (user.failedLoginAttempts >= LOGIN_MAX_ATTEMPTS) {
    await prisma.user.update({
      where: { id: userId },
      data: { lockedUntil: new Date(Date.now() + LOGIN_LOCKOUT_MS) },
    });
  }
}

export async function recordSuccessfulLogin(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
}

/** Creates a session row and sets the httpOnly cookie. Call from a Route Handler. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Destroys the current session (DB row + cookie). Call from a Route Handler. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

/** Authoritative, DB-backed check. Usable in Server Components and Route Handlers. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.active) {
    return null;
  }

  const { id, email, name, role } = session.user;
  return { id, email, name, role };
}
