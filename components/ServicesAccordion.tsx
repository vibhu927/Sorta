"use client";
import { useState } from "react";

export function ServicesAccordion({ items }: { items: any[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="border-t border-white/10">
      {items.map((s: any, i: number) => {
        const active = open === i;
        return (
          <button
            key={s.id || s.title}
            type="button"
            onClick={() => setOpen(i)}
            className="service-row grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b border-white/10 py-5 text-left sm:grid-cols-[3.5rem_1fr_2rem] sm:py-6"
          >
            <span className={`eyebrow ${active ? "text-volt" : "text-white/40"}`}>{s.n}</span>
            <span>
              <span
                className={`font-display block text-xl uppercase transition-colors sm:text-3xl ${
                  active ? "text-[#f8f5ee]" : "text-white/40"
                }`}
              >
                {s.title}
              </span>
              <span
                className={`mt-2 block max-w-xl text-sm leading-relaxed text-white/55 transition-all ${
                  active ? "max-h-14 opacity-100" : "max-h-0 overflow-hidden opacity-0"
                }`}
              >
                {s.desc}
              </span>
            </span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`size-5 transition-transform ${active ? "rotate-45 text-volt" : "text-white/40"}`} aria-hidden="true">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
