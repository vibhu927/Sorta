import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BUNDLED_DIR = path.join(process.cwd(), "content");
// Writable override dir. Explicit env wins, otherwise /tmp on serverless.
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

function readFileSafe(p: string): unknown | undefined {
  try {
    if (!fs.existsSync(p)) return undefined;
    return JSON.parse(fs.readFileSync(p, "utf8")) as unknown;
  } catch {
    return undefined;
  }
}

function mtime(p: string): number {
  try {
    return fs.statSync(p).mtimeMs;
  } catch {
    return -1;
  }
}

export function readJson<T>(file: string, fallback: T): T {
  const bundled = path.join(BUNDLED_DIR, file);
  const over = path.join(OVERRIDE_DIR, file);
  const bb = mtime(bundled);
  const ob = canUseOverride() ? mtime(over) : -1;
  // A newer admin-saved override always wins (covers read-only deploys where
  // the bundled copy can never change at runtime).
  if (ob >= 0 && ob > bb) {
    const v = readFileSafe(over);
    if (v !== undefined) return v as T;
  }
  const v = readFileSafe(bundled);
  if (v !== undefined) {
    // Durable copy is newer — refresh a stale override so all readers agree.
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
  return fallback;
}

export type WriteResult = { ok: true; mode: "local" | "ephemeral" };

export function writeJson(file: string, data: unknown): WriteResult {
  const payload = JSON.stringify(data, null, 2) + "\n";
  // Prefer the bundled dir (durable on a real server / local dev).
  try {
    fs.mkdirSync(BUNDLED_DIR, { recursive: true });
    fs.writeFileSync(path.join(BUNDLED_DIR, file), payload, "utf8");
    // Keep the override in sync so reads are consistent either way.
    if (canUseOverride()) {
      try {
        fs.writeFileSync(path.join(OVERRIDE_DIR, file), payload, "utf8");
      } catch {
        /* best effort */
      }
    }
    return { ok: true, mode: "local" };
  } catch (e) {
    // Read-only deploy filesystem (e.g. Vercel) — fall back to ephemeral storage.
    if (!canUseOverride()) {
      throw new Error(
        `Storage is not writable here (${(e as Error)?.message || e}). On hosted deploys, saves need persistent storage.`
      );
    }
    fs.writeFileSync(path.join(OVERRIDE_DIR, file), payload, "utf8");
    return { ok: true, mode: "ephemeral" };
  }
}

export function storageMode(): "local" | "ephemeral" {
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
