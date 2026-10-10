import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { hasBlob, blobReadJson, blobWriteJson } from "./blob-store";

const BUNDLED_DIR = path.join(process.cwd(), "content");
// Writable override dir for hosts without Blob (dev machines, plain servers).
// Explicit env wins, otherwise the OS temp dir.
const OVERRIDE_DIR =
  process.env.SORTA_CONTENT_DIR || path.join(os.tmpdir(), "sorta-content");

let overrideUsable: boolean | null = null;

function canUseOverride(): boolean {
  if (overrideUsable !== null) return overrideUsable;
  try {
    fs.mkdirSync(OVERRIDE_DIR, { recursive: true });
    const probe = path.join(OVERRIDE_DIR, ".probe");
    fs.writeFileSync(probe, "ok", "utf8");
    fs.unlinkSync(probe);
    overrideUsable = true;
  } catch {
    overrideUsable = false;
  }
  return overrideUsable;
}

function canWriteBundled(): boolean {
  try {
    fs.mkdirSync(BUNDLED_DIR, { recursive: true });
    const probe = path.join(BUNDLED_DIR, ".probe");
    fs.writeFileSync(probe, "ok", "utf8");
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

function mtime(p: string): number {
  try {
    return fs.statSync(p).mtimeMs;
  } catch {
    return -1;
  }
}

function readFileSafe(p: string): unknown | undefined {
  try {
    if (!fs.existsSync(p)) return undefined;
    return JSON.parse(fs.readFileSync(p, "utf8")) as unknown;
  } catch {
    return undefined;
  }
}

function readLocalTier<T>(file: string): T | undefined {
  const bundled = path.join(BUNDLED_DIR, file);
  const over = path.join(OVERRIDE_DIR, file);
  const bb = mtime(bundled);
  const ob = canUseOverride() ? mtime(over) : -1;
  // A newer admin-saved override always wins locally.
  if (ob >= 0 && ob > bb) {
    const v = readFileSafe(over);
    if (v !== undefined) return v as T;
  }
  const v = readFileSafe(bundled);
  if (v !== undefined) {
    if (ob >= 0 && bb > ob) {
      try {
        fs.writeFileSync(over, JSON.stringify(v, null, 2) + "\n", "utf8");
      } catch {
        /* best effort */
      }
    }
    return v as T;
  }
  if (ob >= 0) {
    const ov = readFileSafe(over);
    if (ov !== undefined) return ov as T;
  }
  return undefined;
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  // Tier 1: Vercel Blob — durable and shared across all instances.
  if (hasBlob()) {
    const v = await blobReadJson<T>(file);
    if (v !== undefined) return v;
  }
  // Tier 2/3: local override, then the file shipped with the deploy.
  const v = readLocalTier<T>(file);
  return (v === undefined ? fallback : v) as T;
}

export type WriteResult = { ok: true; mode: "blob" | "local" | "ephemeral" };

export async function writeJson(file: string, data: unknown): Promise<WriteResult> {
  // Tier 1: Blob when configured — survives redeploys and is shared.
  if (hasBlob()) {
    try {
      await blobWriteJson(file, data);
      return { ok: true, mode: "blob" };
    } catch (e) {
      throw new Error(
        `Blob save failed (${(e as Error)?.message || e}). Check BLOB_READ_WRITE_TOKEN.`
      );
    }
  }
  const payload = JSON.stringify(data, null, 2) + "\n";
  // Tier 2: project content dir (durable on real servers / local dev).
  try {
    fs.mkdirSync(BUNDLED_DIR, { recursive: true });
    fs.writeFileSync(path.join(BUNDLED_DIR, file), payload, "utf8");
    if (canUseOverride()) {
      try {
        fs.writeFileSync(path.join(OVERRIDE_DIR, file), payload, "utf8");
      } catch {
        /* best effort */
      }
    }
    return { ok: true, mode: "local" };
  } catch (e) {
    // Tier 3: read-only deploy filesystem without Blob — ephemeral fallback.
    if (!canUseOverride()) {
      throw new Error(
        `Storage is not writable here (${(e as Error)?.message || e}). Add BLOB_READ_WRITE_TOKEN for durable hosted saves.`
      );
    }
    fs.writeFileSync(path.join(OVERRIDE_DIR, file), payload, "utf8");
    return { ok: true, mode: "ephemeral" };
  }
}

export function storageMode(): "blob" | "local" | "ephemeral" {
  if (hasBlob()) return "blob";
  return canWriteBundled() ? "local" : "ephemeral";
}

export type SiteContent = Record<string, any>;
export type Project = {
  slug: string;
  title: string;
  client: string;
  category: string;
  type: string;
  description: string;
  long?: string;
  image: string;
  imageAlt?: string;
  featured?: boolean;
  accent?: string;
};
export type Enquiry = {
  id: string;
  name: string;
  email: string;
  company?: string;
  need?: string;
  budget?: string;
  message?: string;
  createdAt: string;
};
