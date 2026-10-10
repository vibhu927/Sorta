import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { readJson, writeJson } from "@/lib/content";

const FILES = ["site.json", "projects.json"] as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file") || "site.json";
  if (!(FILES as readonly string[]).includes(file)) {
    return NextResponse.json({ error: "Unknown file" }, { status: 400 });
  }
  return NextResponse.json(readJson(file, file === "projects.json" ? [] : {}));
}

export async function PUT(req: Request) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json(
      { error: "Session expired — please sign in again." },
      { status: 401 }
    );
  }
  const body = await req.json().catch(() => null);
  if (!body || !body.file || body.data === undefined) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
  if (!(FILES as readonly string[]).includes(body.file)) {
    return NextResponse.json({ error: "Unknown file" }, { status: 400 });
  }
  try {
    const res = writeJson(body.file, body.data);
    return NextResponse.json(
      res.mode === "ephemeral"
        ? {
            ok: true,
            warning:
              "Saved, but this host uses temporary storage — a redeploy or instance recycle may reset it. Export a backup from Settings.",
          }
        : { ok: true }
    );
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error)?.message || "Save failed" },
      { status: 500 }
    );
  }
}
