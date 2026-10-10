import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { getSessionEmail } from "@/lib/auth";
import { hasBlob, blobUploadImage } from "@/lib/blob-store";

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

  // Tier 1: Vercel Blob — durable, CDN-served, survives redeploys.
  if (hasBlob()) {
    try {
      const url = await blobUploadImage(safe, bytes, file.type || "application/octet-stream");
      return NextResponse.json({ url });
    } catch (e) {
      return NextResponse.json(
        { error: `Blob upload failed (${(e as Error)?.message || e}). Check BLOB_READ_WRITE_TOKEN.` },
        { status: 500 }
      );
    }
  }

  // Tier 2: local public/uploads (dev machines / real servers).
  const dir = path.join(process.cwd(), "public", "uploads");
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, safe), bytes);
    return NextResponse.json({ url: `/uploads/${safe}` });
  } catch {
    return NextResponse.json(
      {
        error:
          "Image uploads need persistent storage on this host. Add BLOB_READ_WRITE_TOKEN (Vercel Blob) for durable hosted uploads, or paste a hosted image URL instead.",
      },
      { status: 500 }
    );
  }
}
