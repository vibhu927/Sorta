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
  const admin = await readJson<{ email: string; passwordHash: string }>("admin.json", { email: "", passwordHash: "" });
  const ok = await bcrypt.compare(String(currentPassword || ""), admin.passwordHash || "");
  if (!ok) return NextResponse.json({ error: "Current password is wrong" }, { status: 401 });
  admin.passwordHash = await bcrypt.hash(String(newPassword), 10);
  try {
    await writeJson("admin.json", admin);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error)?.message || "Could not save new password" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
