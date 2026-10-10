"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SiteHeader({ site }: { site: any }) {
  const nav = site?.nav || {};
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-7">
      <nav
        className={`glass-nav mx-auto flex h-14 max-w-[1450px] items-center justify-between rounded-full px-4 transition-all sm:px-6 ${
          scrolled ? "" : "bg-transparent"
        }`}
      >
        <Link href="/" className="font-display flex items-center gap-2 text-lg tracking-tight">
          <span className="text-volt">✳</span> {nav.logo || "SORTA."}
        </Link>
        <div className="hidden items-center gap-6 text-sm text-white/60 md:flex">
          {(nav.links || []).map((l: any) => (
            <Link
              key={l.label}
              href={l.href?.startsWith("#") ? `/${l.href}` : l.href}
              className="transition-colors hover:text-[#f8f5ee]"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          href={nav?.cta?.href?.startsWith("#") ? `/${nav.cta.href}` : nav?.cta?.href || "/#contact"}
          className="group flex items-center gap-2 text-sm font-semibold"
        >
          {nav?.cta?.label?.replace(" →", "").replace("→", "") || "Let's talk"}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-volt transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true">
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter({ site }: { site: any }) {
  const f = site?.footer || {};
  return (
    <footer className="section-wrap flex flex-wrap items-center justify-between gap-6 py-7 text-xs text-white/50">
      <span className="font-display flex items-center gap-2 text-[#f8f5ee]">
        <span className="text-volt">✳</span> {f.brand?.replace("✳ ", "") || "SORTA COMPANY © 2026"}
      </span>
      <span>{f.tagline || "Ideas with a pulse. Made with good people."}</span>
      <div className="flex items-center gap-5">
        <a className="transition-colors hover:text-[#f8f5ee]" href={`mailto:${f.email || "hello@sorta.company"}`}>
          Email
        </a>
        <Link className="transition-colors hover:text-[#f8f5ee]" href="/admin">
          {f.adminLabel || "Admin"}
        </Link>
      </div>
    </footer>
  );
}
