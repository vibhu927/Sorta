import { NextResponse } from "next/server";
import { destroySession, getSessionEmail } from "@/lib/auth";
import { storageMode } from "@/lib/content";

export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const email = await getSessionEmail();
  return NextResponse.json({ authenticated: !!email, email, storage: storageMode() });
}
