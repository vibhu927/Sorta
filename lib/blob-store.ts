import { put, list } from "@vercel/blob";

export function hasBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function pathname(key: string) {
  return `sorta/${key}`;
}

async function blobUrl(key: string): Promise<string | null> {
  const res = await list({ prefix: pathname(key), limit: 10 });
  const exact = res.blobs.find((b) => b.pathname === pathname(key));
  return exact ? exact.url : null;
}

export async function blobReadJson<T>(key: string): Promise<T | undefined> {
  if (!hasBlob()) return undefined;
  try {
    const url = await blobUrl(key);
    if (!url) return undefined;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return undefined;
    return (await res.json()) as T;
  } catch {
    return undefined;
  }
}

export async function blobWriteJson(key: string, data: unknown): Promise<void> {
  await put(pathname(key), JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  });
}

export async function blobUploadImage(
  filename: string,
  bytes: Buffer,
  contentType: string
): Promise<string> {
  const blob = await put(`sorta/uploads/${filename}`, bytes, {
    access: "public",
    contentType,
  });
  return blob.url;
}
