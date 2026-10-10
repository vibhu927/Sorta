import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getSessionEmail } from "@/lib/auth";
import { storageMode } from "@/lib/content";
import { hasBlob } from "@/lib/blob-store";

// Identifies this server instance — if two requests show different ids,
// they were served by different instances (useful on serverless hosts).
const INSTANCE_ID = Math.random().toString(36).slice(2, 9);

function stat(p: string) {
  try {
    const s = fs.statSync(p);
    return { exists: true, mtime: new Date(s.mtimeMs).toISOString(), size: s.size };
  } catch {
    return { exists: false };
  }
}

export async function GET() {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bundledDir = path.join(process.cwd(), "content");
  const overrideDir =
    process.env.SORTA_CONTENT_DIR || path.join(os.tmpdir(), "sorta-content");

  let blobFiles: unknown = null;
  if (hasBlob()) {
    try {
      const { list } = await import("@vercel/blob");
      const res = await list({ prefix: "sorta/", limit: 50 });
      blobFiles = res.blobs.map((b) => ({
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt,
        url: b.url,
      }));
    } catch (e) {
      blobFiles = { error: (e as Error)?.message || String(e) };
    }
  }

  // Where would site.json be read from right now?
  let siteSource = "fallback";
  try {
    const { readJson } = await import("@/lib/content");
    void readJson;
    if (hasBlob() && Array.isArray(blobFiles)) {
      siteSource = (blobFiles as any[]).some((b) => b.pathname === "sorta/site.json")
        ? "blob"
        : "bundled-or-local (not in blob yet)";
    } else {
      const over = stat(path.join(overrideDir, "site.json"));
      const bund = stat(path.join(bundledDir, "site.json"));
      siteSource =
        over.exists && (!bund.exists || String(over.mtime) > String(bund.mtime))
          ? "local-override"
          : "bundled";
    }
  } catch {
    /* ignore */
  }

  return NextResponse.json({
    instance: INSTANCE_ID,
    region: process.env.VERCEL_REGION || "local",
    storage: storageMode(),
    blobTokenPresent: hasBlob(),
    blobFiles,
    siteSource,
    files: {
      "content/site.json": stat(path.join(bundledDir, "site.json")),
      "content/projects.json": stat(path.join(bundledDir, "projects.json")),
      "tmp-override/site.json": stat(path.join(overrideDir, "site.json")),
    },
    now: new Date().toISOString(),
  });
}
