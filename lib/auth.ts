import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { readJson } from "./content";

const COOKIE = "sorta_session";

function secret() {
  const s =
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PASSWORD_HASH ||
    "sorta-dev-secret-change-me-please-32chars";
  return new TextEncoder().encode(s);
}

export async function verifyCredentials(email: string, password: string) {
  const admin = await readJson<{ email: string; passwordHash: string }>(
    "admin.json",
    { email: process.env.ADMIN_EMAIL || "", passwordHash: process.env.ADMIN_PASSWORD_HASH || "" }
  );
  const emailOk =
    email.trim().toLowerCase() === (admin.email || "").trim().toLowerCase();
  if (!emailOk || !admin.passwordHash) return false;
  return bcrypt.compare(password, admin.passwordHash);
}

export async function createSession(email: string) {
  const token = await new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  (await cookies()).set(COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getSessionEmail(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return (payload.email as string) || null;
  } catch {
    return null;
  }
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

export const SESSION_COOKIE = COOKIE;
