import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { getSessionEmail } from "@/lib/auth";

export async function POST(req: Request) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json(
      { error: "Session expired — please sign in again." },
      { status: 401 }
    );
  }
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > 5 * 1024 * 1024) return NextResponse.json({ error: "Max 5MB" }, { status: 400 });
  const safe = `${Date.now()}-${String(file.name).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, safe), bytes);
    return NextResponse.json({ url: `/uploads/${safe}` });
  } catch (e) {
    // Read-only deploy filesystem (e.g. Vercel): park it in ephemeral /tmp so the
    // save itself succeeds, but warn that it may not serve or survive a redeploy.
    try {
      const tmp = path.join(os.tmpdir(), "sorta-uploads");
      fs.mkdirSync(tmp, { recursive: true });
      fs.writeFileSync(path.join(tmp, safe), bytes);
    } catch {
      /* serving from tmp isn't possible — still report the original problem */
    }
    return NextResponse.json(
      {
        error:
          "Image uploads need persistent storage on this host (Vercel Blob). Text saves work; for images, paste a hosted URL instead, or ask to enable Blob uploads.",
      },
      { status: 500 }
    );
  }
}
