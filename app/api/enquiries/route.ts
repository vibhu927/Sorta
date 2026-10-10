import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/auth";
import { readJson, writeJson, type Enquiry } from "@/lib/content";

export async function GET() {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(readJson<Enquiry[]>("enquiries.json", []));
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!b.name || !b.email) return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  const list = readJson<Enquiry[]>("enquiries.json", []);
  const entry: Enquiry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: String(b.name).slice(0, 100),
    email: String(b.email).slice(0, 150),
    company: String(b.company || "").slice(0, 150),
    need: String(b.need || "").slice(0, 100),
    budget: String(b.budget || "").slice(0, 100),
    message: String(b.message || "").slice(0, 5000),
    createdAt: new Date().toISOString(),
  };
  list.unshift(entry);
  try {
    writeJson("enquiries.json", list);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error)?.message || "Could not save enquiry" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const list = readJson<Enquiry[]>("enquiries.json", []);
  try {
    writeJson("enquiries.json", id ? list.filter((e) => e.id !== id) : []);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error)?.message || "Could not delete enquiry" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
