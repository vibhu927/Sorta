"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import type { Project } from "@/lib/content";
import { Reveal } from "./motion";

export function WorkGrid({ projects }: { projects: Project[] }) {
  const cats = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
  const [active, setActive] = useState("All");
  const list = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              active === c ? "text-black" : "border border-white/15 text-white/70 hover:border-volt/60 hover:text-[#f8f5ee]"
            }`}
          >
            {active === c && (
              <motion.span
                layoutId="work-pill"
                className="absolute inset-0 rounded-full bg-volt"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>
      <p className="mt-6 text-xs font-bold uppercase tracking-widest text-white/40">
        <span className="mr-1 text-volt">✳</span> {list.length} project{list.length === 1 ? "" : "s"}
      </p>
      <motion.div layout className="mt-8 grid gap-10 md:grid-cols-2 md:gap-8">
        {list.map((p, i) => (
          <motion.div
            layout
            key={p.slug}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className={i % 2 === 1 ? "md:mt-20" : ""}
          >
            <Link href={`/work/${p.slug}`} className="work-link group block">
              <div className="relative aspect-[1.28/1] overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="work-image size-full object-cover" src={p.image} alt={p.imageAlt || p.title} loading="lazy" />
                <span className="absolute left-4 top-4 bg-black/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md">
                  {p.category}
                </span>
                <span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-volt text-black transition-transform group-hover:rotate-45">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M13 5H19V11" />
                    <path d="M19 5 5 19" />
                  </svg>
                </span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl uppercase sm:text-2xl">{p.title}</h2>
                  <p className="mt-1 text-sm text-white/55">{p.client} <span className="px-1.5 text-volt">/</span> {p.type}</p>
                  <p className="mt-2 text-sm text-white/45">{p.description}</p>
                </div>
                <span className="pt-1 text-xs text-white/40">0{i + 1}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

export function WorkReveal({ children }: { children: React.ReactNode }) {
  return <Reveal>{children}</Reveal>;
}
