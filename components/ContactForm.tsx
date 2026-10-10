"use client";
import { useState } from "react";
import { Magnetic } from "./motion";

export function ContactForm({ site }: { site: any }) {
  const c = site?.contact || {};
  const [form, setForm] = useState({ name: "", email: "", company: "", need: "", budget: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const r = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error("bad");
      setStatus("ok");
      setForm({ name: "", email: "", company: "", need: "", budget: "", message: "" });
    } catch {
      setStatus("err");
    }
  }

  const label = "grid gap-2 text-xs text-white/55";
  return (
    <form onSubmit={submit} className="grid gap-5 rounded-2xl border border-white/10 bg-black/40 p-6 sm:grid-cols-2 sm:p-8">
      <label className={label}>
        Your name
        <input className="input-field" required maxLength={100} autoComplete="name" placeholder="What should we call you?" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label className={label}>
        Your email
        <input className="input-field" type="email" required maxLength={255} autoComplete="email" placeholder="The reply-to place" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      <label className={label}>
        Brand / company
        <input className="input-field" maxLength={160} autoComplete="organization" placeholder="The short version" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </label>
      <label className={label}>
        What do you need?
        <select className="input-field" value={form.need} onChange={(e) => setForm({ ...form, need: e.target.value })}>
          <option value="">Pick a direction</option>
          {(c.needs || []).map((n: string) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
      <label className={`${label} sm:col-span-2`}>
        Tell us a little more
        <textarea className="input-field min-h-32 resize-y" required minLength={8} maxLength={2500} placeholder="The thing you can't stop thinking about…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </label>
      <label className={`${label} sm:col-span-2`}>
        Budget range (optional)
        <select className="input-field" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}>
          <option value="">Select a range</option>
          {(c.budgets || []).map((b: string) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </label>
      <div className="sm:col-span-2">
        <Magnetic>
          <button disabled={status === "sending"} className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-volt px-8 text-sm font-bold text-black shadow transition-all hover:brightness-110 disabled:opacity-50">
            {status === "sending" ? "Sending…" : "Send the good stuff"}
          </button>
        </Magnetic>
        {status === "ok" && <p className="mt-3 text-sm font-bold text-volt">{c.success || "Received! We'll be in touch."}</p>}
        {status === "err" && <p className="mt-3 text-sm font-medium text-hot">Something went wrong. Email us directly instead.</p>}
        <p className="mt-3 text-xs text-white/40">{c.note || "No bots. We read every one."}</p>
      </div>
    </form>
  );
}
