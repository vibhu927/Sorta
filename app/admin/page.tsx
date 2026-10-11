"use client";
import { useEffect, useState } from "react";

type Tab = "home" | "services" | "projects" | "sections" | "contact" | "enquiries" | "settings";

const inputCls = "input-field";
const labelCls = "mb-1 block text-xs font-bold uppercase tracking-wide text-white/50";
const cardCls = "rounded-2xl border border-white/10 bg-[#0c0d12] p-5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

export default function AdminPage() {
  const [me, setMe] = useState<{ authenticated: boolean; email?: string; storage?: string } | null>(null);
  const [login, setLogin] = useState({ email: "admin@sorta.company", password: "" });
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("home");
  const [site, setSite] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });

  async function refreshMe() {
    const r = await fetch("/api/auth/me");
    setMe(await r.json());
  }
  async function loadAll() {
    const [s, p] = await Promise.all([
      fetch("/api/content?file=site.json").then((r) => r.json()),
      fetch("/api/content?file=projects.json").then((r) => r.json()),
    ]);
    setSite(s);
    setProjects(p);
  }
  async function loadEnquiries() {
    const r = await fetch("/api/enquiries");
    if (r.ok) setEnquiries(await r.json());
  }

  useEffect(() => {
    refreshMe();
  }, []);
  useEffect(() => {
    if (me?.authenticated) {
      loadAll();
      loadEnquiries();
    }
  }, [me?.authenticated]);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login),
    });
    if (!r.ok) {
      setErr("Invalid email or password");
      return;
    }
    setLogin({ ...login, password: "" });
    refreshMe();
  }

  async function readResult(r: Response, okText: string) {
    const j = await r.json().catch(() => ({}));
    if (r.ok) setMsg(j.warning ? `${okText} — note: ${j.warning}` : okText);
    else setMsg(`Save failed: ${j.error || `HTTP ${r.status}`}`);
  }

  async function saveSite() {
    setSaving(true);
    setMsg("");
    try {
      const r = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: "site.json", data: site }),
      });
      await readResult(r, "Saved ✓ — view the live site to confirm");
    } catch {
      setMsg("Save failed: network error — is the server running?");
    }
    setSaving(false);
  }

  async function saveProjects(next = projects) {
    setSaving(true);
    setMsg("");
    try {
      const r = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: "projects.json", data: next }),
      });
      await readResult(r, "Projects saved ✓");
    } catch {
      setMsg("Save failed: network error — is the server running?");
    }
    setSaving(false);
  }

  async function uploadImage(f: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setMsg(`Upload failed: ${j.error || `HTTP ${r.status}`}`);
      return null;
    }
    return j.url as string;
  }

  if (!me) return <main className="min-h-screen bg-[#050509] p-10 text-[#f8f5ee]">Loading…</main>;

  if (!me.authenticated) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-[#050509] px-5 text-[#f8f5ee]">
        <p className="eyebrow text-volt">Sorta Company / private</p>
        <h1 className="display-type mt-3 text-6xl">STUDIO<br />DESK<span className="text-hot">.</span></h1>
        <p className="mt-3 text-sm text-white/55">The place behind the projects and conversations.</p>
        <form onSubmit={doLogin} className="mt-6 grid gap-4 rounded-3xl border border-white/10 bg-[#0c0d12] p-6 sm:p-8">
          <Field label="Email">
            <input className={inputCls} value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
          </Field>
          <Field label="Password">
            <input className={inputCls} type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
          </Field>
          {err && <p className="text-sm font-bold text-hot">{err}</p>}
          <button className="rounded-full bg-volt py-3 text-sm font-bold text-black transition hover:brightness-110">Sign in</button>
          <a href="/" className="text-center text-xs text-white/50 underline hover:text-volt">← Back to site</a>
        </form>
      </main>
    );
  }

  if (!site) return <main className="min-h-screen bg-[#050509] p-10 text-[#f8f5ee]">Loading studio…</main>;

  const tabs: { id: Tab; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "services", label: "Services" },
    { id: "projects", label: "Projects" },
    { id: "sections", label: "Process & Clients" },
    { id: "contact", label: "Contact & SEO" },
    { id: "enquiries", label: `Enquiries (${enquiries.length})` },
    { id: "settings", label: "Settings" },
  ];

  const set = (path: string, value: any) => {
    const next = structuredClone(site);
    const keys = path.split(".");
    let o = next;
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = value;
    setSite(next);
  };

  return (
    <main className="min-h-screen bg-[#050509] text-[#f8f5ee]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050509]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3">
          <strong className="font-display text-sm tracking-tight"><span className="text-volt">✳</span> SORTA / STUDIO</strong>
          <span className="text-xs text-white/50">{me.email}</span>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${me.storage === "blob" ? "bg-volt text-black" : "bg-white/10 text-white/60"}`} title={me.storage === "blob" ? "Saves persist in Vercel Blob across redeploys" : "Local/ephemeral storage — add BLOB_READ_WRITE_TOKEN for durable hosted saves"}>
            {me.storage === "blob" ? "● durable" : `● ${me.storage || "local"}`}
          </span>
          <div className="ml-auto flex gap-2">
            <a href="/" target="_blank" className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold transition hover:border-volt hover:text-volt">View site ↗</a>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
                location.reload();
              }}
              className="rounded-full bg-volt px-4 py-2 text-xs font-bold text-black transition hover:brightness-110"
            >
              Log out
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id === "enquiries") loadEnquiries(); }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${tab === t.id ? "bg-volt text-black" : "border border-white/15 text-white/65 hover:border-volt/60 hover:text-[#f8f5ee]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-6">
        {msg && <p className="mb-4 rounded-xl bg-volt px-4 py-2 text-sm font-bold text-black">{msg}</p>}

        {tab === "home" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className={cardCls}>
              <h2 className="font-display text-base uppercase tracking-tight"><span className="mr-2 text-volt">✳</span>Hero</h2>
              <div className="mt-3 grid gap-3">
                <Field label="Eyebrow"><input className={inputCls} value={site.hero?.eyebrow || ""} onChange={(e) => set("hero.eyebrow", e.target.value)} /></Field>
                <Field label="Title line 1"><input className={inputCls} value={site.hero?.titleA || ""} onChange={(e) => set("hero.titleA", e.target.value)} /></Field>
                <Field label="Title line 2"><input className={inputCls} value={site.hero?.titleB || ""} onChange={(e) => set("hero.titleB", e.target.value)} /></Field>
                <Field label="Sub"><textarea className={inputCls} value={site.hero?.sub || ""} onChange={(e) => set("hero.sub", e.target.value)} /></Field>
                <Field label="Hero image URL">
                  <div className="flex gap-2">
                    <input className={inputCls} value={site.hero?.image || ""} onChange={(e) => set("hero.image", e.target.value)} />
                    <label className="cursor-pointer whitespace-nowrap rounded-xl bg-volt px-3 py-2 text-xs font-bold text-black transition hover:brightness-110">
                      Upload
                      <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const url = await uploadImage(f);
                        if (url) set("hero.image", url);
                      }} />
                    </label>
                  </div>
                </Field>
              </div>
            </div>
            <div className={cardCls}>
              <h2 className="font-display text-base uppercase tracking-tight"><span className="mr-2 text-volt">✳</span>Statement + About</h2>
              <div className="mt-3 grid gap-3">
                <Field label="Statement line 1"><input className={inputCls} value={site.statement?.line1 || ""} onChange={(e) => set("statement.line1", e.target.value)} /></Field>
                <Field label="Statement line 2"><input className={inputCls} value={site.statement?.line2 || ""} onChange={(e) => set("statement.line2", e.target.value)} /></Field>
                <Field label="About title"><textarea className={inputCls} value={site.about?.title || ""} onChange={(e) => set("about.title", e.target.value)} /></Field>
                {(site.about?.paragraphs || []).map((p: string, i: number) => (
                  <Field key={i} label={`About paragraph ${i + 1}`}>
                    <textarea className={inputCls} value={p} onChange={(e) => {
                      const next = structuredClone(site);
                      next.about.paragraphs[i] = e.target.value;
                      setSite(next);
                    }} />
                  </Field>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <button onClick={saveSite} disabled={saving} className="rounded-full bg-volt px-8 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50">
                {saving ? "Saving…" : "Save home"}
              </button>
            </div>
          </div>
        )}

        {tab === "services" && (
          <div className="grid gap-4">
            {(site.services?.items || []).map((s: any, i: number) => (
              <div key={s.id || i} className={cardCls + " grid gap-3 md:grid-cols-[80px_1fr_2fr_auto]"}>
                <Field label="No."><input className={inputCls} value={s.n || ""} onChange={(e) => {
                  const next = structuredClone(site); next.services.items[i].n = e.target.value; setSite(next);
                }} /></Field>
                <Field label="Title"><input className={inputCls} value={s.title || ""} onChange={(e) => {
                  const next = structuredClone(site); next.services.items[i].title = e.target.value; setSite(next);
                }} /></Field>
                <Field label="Description"><input className={inputCls} value={s.desc || ""} onChange={(e) => {
                  const next = structuredClone(site); next.services.items[i].desc = e.target.value; setSite(next);
                }} /></Field>
                <button
                  onClick={() => {
                    const next = structuredClone(site);
                    next.services.items.splice(i, 1);
                    setSite(next);
                  }}
                  className="self-end rounded-full border border-hot/50 px-4 py-2 text-xs font-bold text-hot transition hover:bg-hot hover:text-black"
                >
                  Delete
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={() => {
                const next = structuredClone(site);
                next.services.items.push({ id: `s-${Date.now()}`, n: String(next.services.items.length + 1).padStart(2, "0"), title: "New service", desc: "Describe it…" });
                setSite(next);
              }} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:border-volt hover:text-volt">+ Add service</button>
              <button onClick={saveSite} disabled={saving} className="rounded-full bg-volt px-8 py-2.5 text-sm font-bold text-black transition hover:brightness-110">Save services</button>
            </div>
          </div>
        )}

        {tab === "projects" && (
          <div className="grid gap-4">
            {projects.map((p, i) => (
              <div key={p.slug + i} className={cardCls}>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Title"><input className={inputCls} value={p.title} onChange={(e) => {
                    const n = [...projects]; n[i] = { ...n[i], title: e.target.value }; setProjects(n);
                  }} /></Field>
                  <Field label="Slug"><input className={inputCls} value={p.slug} onChange={(e) => {
                    const n = [...projects]; n[i] = { ...n[i], slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") }; setProjects(n);
                  }} /></Field>
                  <Field label="Client"><input className={inputCls} value={p.client} onChange={(e) => {
                    const n = [...projects]; n[i] = { ...n[i], client: e.target.value }; setProjects(n);
                  }} /></Field>
                  <Field label="Category"><input className={inputCls} value={p.category} onChange={(e) => {
                    const n = [...projects]; n[i] = { ...n[i], category: e.target.value }; setProjects(n);
                  }} /></Field>
                  <Field label="Type"><input className={inputCls} value={p.type} onChange={(e) => {
                    const n = [...projects]; n[i] = { ...n[i], type: e.target.value }; setProjects(n);
                  }} /></Field>
                  <Field label="Accent color"><select className={inputCls} value={p.accent || "auto"} onChange={(e) => {
                    const n = [...projects]; n[i] = { ...n[i], accent: e.target.value }; setProjects(n);
                  }}>
                    <option value="auto">Auto (from category)</option>
                    <option value="pop">Pink pop</option>
                    <option value="acid">Acid green</option>
                    <option value="bolt">Electric blue</option>
                    <option value="tang">Tangerine</option>
                  </select></Field>
                  <Field label="Image">
                    <div className="flex gap-2">
                      <input className={inputCls} value={p.image} onChange={(e) => {
                        const n = [...projects]; n[i] = { ...n[i], image: e.target.value }; setProjects(n);
                      }} />
                      <label className="cursor-pointer whitespace-nowrap rounded-xl bg-volt px-3 py-2 text-xs font-bold text-black transition hover:brightness-110">
                        Upload
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const url = await uploadImage(f);
                          if (url) { const n = [...projects]; n[i] = { ...n[i], image: url }; setProjects(n); }
                        }} />
                      </label>
                    </div>
                  </Field>
                </div>
                <Field label="Short description"><textarea className={inputCls} value={p.description} onChange={(e) => {
                  const n = [...projects]; n[i] = { ...n[i], description: e.target.value }; setProjects(n);
                }} /></Field>
                <Field label="Long story"><textarea className={inputCls} value={p.long || ""} onChange={(e) => {
                  const n = [...projects]; n[i] = { ...n[i], long: e.target.value }; setProjects(n);
                }} /></Field>
                <div className="mt-3 flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="size-4 accent-[#bcfb00]" checked={p.featured !== false} onChange={(e) => {
                      const n = [...projects]; n[i] = { ...n[i], featured: e.target.checked }; setProjects(n);
                    }} /> Show on home
                  </label>
                  <button onClick={() => setProjects(projects.filter((_, j) => j !== i))} className="ml-auto rounded-full border border-hot/50 px-4 py-2 text-xs font-bold text-hot transition hover:bg-hot hover:text-black">Delete project</button>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={() => setProjects([...projects, { slug: `new-project-${projects.length + 1}`, title: "New project", client: "Client", category: "Branding", type: "Campaign", description: "Short line…", long: "", image: "/images/sorta-project-neon.jpg", featured: true }])} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:border-volt hover:text-volt">+ Add project</button>
              <button onClick={() => saveProjects()} disabled={saving} className="rounded-full bg-volt px-8 py-2.5 text-sm font-bold text-black transition hover:brightness-110">Save projects</button>
            </div>
          </div>
        )}

        {tab === "sections" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className={cardCls}>
              <h2 className="font-display text-base uppercase tracking-tight"><span className="mr-2 text-volt">✳</span>Process steps</h2>
              {(site.process?.steps || []).map((s: any, i: number) => (
                <div key={i} className="mt-3 grid grid-cols-[60px_1fr] gap-2">
                  <input className={inputCls} value={s.n} onChange={(e) => {
                    const n = structuredClone(site); n.process.steps[i].n = e.target.value; setSite(n);
                  }} />
                  <input className={inputCls} value={s.title} onChange={(e) => {
                    const n = structuredClone(site); n.process.steps[i].title = e.target.value; setSite(n);
                  }} />
                  <textarea className={inputCls + " col-span-2"} value={s.desc} onChange={(e) => {
                    const n = structuredClone(site); n.process.steps[i].desc = e.target.value; setSite(n);
                  }} />
                </div>
              ))}
              <button onClick={() => {
                const n = structuredClone(site);
                n.process.steps.push({ n: String(n.process.steps.length + 1).padStart(2, "0"), title: "New step", desc: "" });
                setSite(n);
              }} className="mt-3 rounded-full border border-white/20 px-4 py-2 text-xs font-bold transition hover:border-volt hover:text-volt">+ Add step</button>
            </div>
            <div className={cardCls}>
              <h2 className="font-display text-base uppercase tracking-tight"><span className="mr-2 text-volt">✳</span>Clients + Testimonial</h2>
              <Field label="Client logos (comma separated)">
                <input className={inputCls} value={(site.clients?.logos || []).join(", ")} onChange={(e) => set("clients.logos", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} />
              </Field>
              <div className="mt-3 grid gap-3">
                <Field label="Quote"><textarea className={inputCls} value={site.clients?.testimonial?.quote || ""} onChange={(e) => set("clients.testimonial.quote", e.target.value)} /></Field>
                <Field label="Name"><input className={inputCls} value={site.clients?.testimonial?.name || ""} onChange={(e) => set("clients.testimonial.name", e.target.value)} /></Field>
                <Field label="Role"><input className={inputCls} value={site.clients?.testimonial?.role || ""} onChange={(e) => set("clients.testimonial.role", e.target.value)} /></Field>
              </div>
              <button onClick={saveSite} disabled={saving} className="mt-4 rounded-full bg-volt px-8 py-2.5 text-sm font-bold text-black transition hover:brightness-110">Save sections</button>
            </div>
            <div className={cardCls + " md:col-span-2"}>
              <h2 className="font-display text-base uppercase tracking-tight"><span className="mr-2 text-volt">✳</span>Client videos — carousel</h2>
              <p className="mt-1 text-xs text-white/50">Paste a YouTube link (watch / shorts / youtu.be) or a direct .mp4 URL. Poster is the cover image.</p>
              <div className="mt-3 grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Section eyebrow"><input className={inputCls} value={site.clientVoices?.index || ""} onChange={(e) => set("clientVoices.index", e.target.value)} /></Field>
                  <Field label="Section sub"><input className={inputCls} value={site.clientVoices?.sub || ""} onChange={(e) => set("clientVoices.sub", e.target.value)} /></Field>
                </div>
                {(site.clientVoices?.items || []).map((v: any, i: number) => (
                  <div key={v.id || i} className="grid gap-3 rounded-2xl border border-white/10 p-4 md:grid-cols-2">
                    <Field label="Name"><input className={inputCls} value={v.name || ""} onChange={(e) => {
                      const n = structuredClone(site); n.clientVoices.items[i].name = e.target.value; setSite(n);
                    }} /></Field>
                    <Field label="Role / company"><input className={inputCls} value={v.role || ""} onChange={(e) => {
                      const n = structuredClone(site); n.clientVoices.items[i].role = e.target.value; setSite(n);
                    }} /></Field>
                    <div className="md:col-span-2">
                      <Field label="Video URL (YouTube or .mp4)"><input className={inputCls} placeholder="https://youtube.com/watch?v=… or https://…/clip.mp4" value={v.videoUrl || ""} onChange={(e) => {
                        const n = structuredClone(site); n.clientVoices.items[i].videoUrl = e.target.value; setSite(n);
                      }} /></Field>
                    </div>
                    <div className="md:col-span-2">
                      <Field label="Poster / cover image">
                        <div className="flex gap-2">
                          <input className={inputCls} value={v.poster || ""} onChange={(e) => {
                            const n = structuredClone(site); n.clientVoices.items[i].poster = e.target.value; setSite(n);
                          }} />
                          <label className="cursor-pointer whitespace-nowrap rounded-xl bg-volt px-3 py-2 text-xs font-bold text-black transition hover:brightness-110">
                            Upload
                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const url = await uploadImage(f);
                              if (url) { const n = structuredClone(site); n.clientVoices.items[i].poster = url; setSite(n); }
                            }} />
                          </label>
                        </div>
                      </Field>
                    </div>
                    <div className="md:col-span-2">
                      <Field label="Quote (short line under video)"><textarea className={inputCls} value={v.quote || ""} onChange={(e) => {
                        const n = structuredClone(site); n.clientVoices.items[i].quote = e.target.value; setSite(n);
                      }} /></Field>
                    </div>
                    <div className="md:col-span-2">
                      <button onClick={() => {
                        const n = structuredClone(site);
                        n.clientVoices.items.splice(i, 1);
                        setSite(n);
                      }} className="rounded-full border border-hot/50 px-4 py-2 text-xs font-bold text-hot transition hover:bg-hot hover:text-black">Delete video</button>
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => {
                    const n = structuredClone(site);
                    if (!n.clientVoices) n.clientVoices = { index: "06 — Straight from them", sub: "", items: [] };
                    if (!Array.isArray(n.clientVoices.items)) n.clientVoices.items = [];
                    n.clientVoices.items.push({ id: `v-${Date.now()}`, name: "New client", role: "Founder", quote: "", videoUrl: "", poster: "/images/sorta-project-neon.jpg" });
                    setSite(n);
                  }} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold transition hover:border-volt hover:text-volt">+ Add video</button>
                  <button onClick={saveSite} disabled={saving} className="rounded-full bg-volt px-8 py-2.5 text-sm font-bold text-black transition hover:brightness-110">Save videos</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "contact" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className={cardCls}>
              <h2 className="font-display text-base uppercase tracking-tight"><span className="mr-2 text-volt">✳</span>Contact</h2>
              <div className="mt-3 grid gap-3">
                <Field label="Title"><input className={inputCls} value={site.contact?.title || ""} onChange={(e) => set("contact.title", e.target.value)} /></Field>
                <Field label="Sub"><textarea className={inputCls} value={site.contact?.sub || ""} onChange={(e) => set("contact.sub", e.target.value)} /></Field>
                <Field label="Email"><input className={inputCls} value={site.contact?.email || ""} onChange={(e) => set("contact.email", e.target.value)} /></Field>
                <Field label="Needs (comma separated)"><input className={inputCls} value={(site.contact?.needs || []).join(", ")} onChange={(e) => set("contact.needs", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} /></Field>
                <Field label="Budgets (comma separated)"><input className={inputCls} value={(site.contact?.budgets || []).join(", ")} onChange={(e) => set("contact.budgets", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} /></Field>
              </div>
            </div>
            <div className={cardCls}>
              <h2 className="font-display text-base uppercase tracking-tight"><span className="mr-2 text-volt">✳</span>SEO + Footer</h2>
              <div className="mt-3 grid gap-3">
                <Field label="SEO title"><input className={inputCls} value={site.seo?.title || ""} onChange={(e) => set("seo.title", e.target.value)} /></Field>
                <Field label="SEO description"><textarea className={inputCls} value={site.seo?.description || ""} onChange={(e) => set("seo.description", e.target.value)} /></Field>
                <Field label="Footer brand"><input className={inputCls} value={site.footer?.brand || ""} onChange={(e) => set("footer.brand", e.target.value)} /></Field>
                <Field label="Footer tagline"><input className={inputCls} value={site.footer?.tagline || ""} onChange={(e) => set("footer.tagline", e.target.value)} /></Field>
              </div>
              <button onClick={saveSite} disabled={saving} className="mt-4 rounded-full bg-volt px-8 py-2.5 text-sm font-bold text-black transition hover:brightness-110">Save contact + SEO</button>
            </div>
          </div>
        )}

        {tab === "enquiries" && (
          <div className="grid gap-3">
            {enquiries.length === 0 && <p className="opacity-60">No enquiries yet. Submit the contact form on the site to test.</p>}
            {enquiries.map((e) => (
              <div key={e.id} className={cardCls}>
                <div className="flex flex-wrap items-center gap-2">
                  <strong>{e.name}</strong>
                  <span className="text-sm opacity-60">{e.email}</span>
                  <span className="ml-auto text-xs opacity-50">{new Date(e.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm">{e.company && <>{e.company} · </>}{e.need && <>{e.need} · </>}{e.budget}</p>
                <p className="mt-2 text-sm opacity-80">{e.message}</p>
                <button onClick={async () => {
                  await fetch(`/api/enquiries?id=${e.id}`, { method: "DELETE" });
                  loadEnquiries();
                }} className="mt-3 rounded-full border border-hot/50 px-4 py-1.5 text-xs font-bold text-hot transition hover:bg-hot hover:text-black">Delete</button>
              </div>
            ))}
          </div>
        )}

        {tab === "settings" && (
          <div className="grid gap-4">
          <div className={cardCls + " max-w-lg"}>
            <h2 className="font-display text-base uppercase tracking-tight"><span className="mr-2 text-volt">✳</span>Change password</h2>
            <div className="mt-3 grid gap-3">
              <Field label="Current password"><input type="password" className={inputCls} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
              <Field label="New password (8+ chars)"><input type="password" className={inputCls} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
              <button onClick={async () => {
                setMsg("");
                const r = await fetch("/api/admin/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pw) });
                const j = await r.json();
                setMsg(r.ok ? "Password changed ✓" : (j.error || "Failed"));
                setPw({ currentPassword: "", newPassword: "" });
              }} className="rounded-full bg-volt px-6 py-2.5 text-sm font-bold text-black transition hover:brightness-110">Update password</button>
            </div>
          </div>
          <div className={cardCls + " max-w-2xl"}>
            <h2 className="font-display text-base uppercase tracking-tight"><span className="mr-2 text-volt">✳</span>Connection</h2>
            <p className="mt-1 text-xs text-white/50">Where saves go and where reads come from on this host.</p>
            <button onClick={async () => {
              setMsg("");
              const r = await fetch("/api/diag");
              const j = await r.json();
              if (!r.ok) { setMsg(`Diagnostics failed: ${j.error || r.status}`); return; }
              setMsg(`instance ${j.instance} · region ${j.region} · storage ${j.storage} · reads: ${j.siteSource} · blob files: ${Array.isArray(j.blobFiles) ? j.blobFiles.map((b: any) => b.pathname).join(", ") || "none yet" : JSON.stringify(j.blobFiles)}`);
            }} className="mt-3 rounded-full border border-white/20 px-5 py-2 text-xs font-bold transition hover:border-volt hover:text-volt">Run diagnostics</button>
          </div>
          </div>
        )}
      </div>
    </main>
  );
}
