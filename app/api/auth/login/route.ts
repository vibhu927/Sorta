import { NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  const ok = await verifyCredentials(String(email), String(password));
  if (!ok) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  await createSession(String(email));
  return NextResponse.json({ ok: true });
}
