import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionEmail } from "@/lib/auth";
import { readJson, writeJson } from "@/lib/content";

export async function POST(req: Request) {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { currentPassword, newPassword } = await req.json().catch(() => ({}));
  if (!newPassword || String(newPassword).length < 8) {
    return NextResponse.json({ error: "New password must be 8+ characters" }, { status: 400 });
  }
  const admin = readJson<{ email: string; passwordHash: string }>("admin.json", { email: "", passwordHash: "" });
  const ok = await bcrypt.compare(String(currentPassword || ""), admin.passwordHash || "");
  if (!ok) return NextResponse.json({ error: "Current password is wrong" }, { status: 401 });
  admin.passwordHash = await bcrypt.hash(String(newPassword), 10);
  writeJson("admin.json", admin);
  return NextResponse.json({ ok: true });
}
