"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type ClientVoice = {
  id?: string;
  name?: string;
  role?: string;
  quote?: string;
  videoUrl?: string;
  poster?: string;
};

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return m ? m[1] : null;
}

function isVideoFile(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(url || "");
}

export function ClientVoices({ items }: { items: ClientVoice[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);

  const count = items.length;

  const cardStep = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 320;
    const card = el.querySelector<HTMLElement>("[data-voice-card]");
    if (!card) return el.clientWidth * 0.8;
    const gap = 20;
    return card.offsetWidth + gap;
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el) return;
      const next = (i + count) % count;
      el.scrollTo({ left: next * cardStep(), behavior: "smooth" });
      setActive(next);
    },
    [cardStep, count]
  );

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / cardStep());
    setActive(Math.max(0, Math.min(count - 1, idx)));
  }, [cardStep, count]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!count) return null;

  return (
    <div>
      {/* track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 pt-2 sm:-mx-6 sm:px-6"
      >
        {items.map((v, i) => {
          const yt = getYouTubeId(v.videoUrl || "");
          const file = isVideoFile(v.videoUrl || "");
          const hasVideo = Boolean(yt || file);
          const thumb =
            v.poster ||
            (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : "/images/sorta-project-neon.jpg");
          const isPlayingInline = playing === i && file;
          return (
            <article
              key={v.id || `${v.name}-${i}`}
              data-voice-card
              className="group w-[80vw] max-w-[340px] shrink-0 snap-start overflow-hidden border border-white/10 bg-card sm:w-[44vw] lg:w-[31.5%]"
            >
              {/* video area — vertical like a reel */}
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                {isPlayingInline ? (
                  <video
                    className="size-full object-cover"
                    src={v.videoUrl}
                    poster={thumb}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={v.name ? `${v.name} — client video` : "Client video"}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />
                    {/* top row: client tag + index */}
                    <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                      <span className="bg-black/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#f8f5ee] backdrop-blur-md">
                        Client says
                      </span>
                      <span className="text-[11px] font-bold tracking-widest text-white/60">
                        0{i + 1}
                      </span>
                    </div>
                    {/* center play */}
                    {hasVideo ? (
                      <button
                        onClick={() => {
                          if (yt) setLightbox(i);
                          else setPlaying(i);
                        }}
                        aria-label={`Play video from ${v.name || "client"}`}
                        className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-volt text-black shadow-xl transition-transform hover:scale-105"
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                        </svg>
                      </button>
                    ) : (
                      <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/60 text-white/80 backdrop-blur-md">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M7 7h10v10" />
                          <path d="M7 17 17 7" />
                        </svg>
                      </span>
                    )}
                    {/* bottom caption */}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="font-display text-lg uppercase leading-tight text-[#f8f5ee]">
                        {v.name || "Client name"}
                      </p>
                      {v.role && (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-volt">
                          {v.role}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
              {/* quote */}
              {v.quote && (
                <p className="border-t border-white/10 px-4 py-4 text-sm leading-relaxed text-white/70">
                  “{v.quote}”
                </p>
              )}
            </article>
          );
        })}
      </div>

      {/* controls — same language as work section */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={() => goTo(active - 1)}
          aria-label="Previous videos"
          className="grid size-11 place-items-center rounded-full border border-white/15 text-lg transition-colors hover:border-volt hover:bg-volt hover:text-black"
        >
          ←
        </button>
        <button
          onClick={() => goTo(active + 1)}
          aria-label="Next videos"
          className="grid size-11 place-items-center rounded-full border border-white/15 text-lg transition-colors hover:border-volt hover:bg-volt hover:text-black"
        >
          →
        </button>
        <span className="text-xs font-bold tracking-widest text-white/50">
          0{active + 1} <span className="text-white/25">/ 0{count}</span>
        </span>
        <div className="ml-2 hidden h-px flex-1 bg-white/10 sm:block">
          <div
            className="h-px bg-volt transition-all duration-500"
            style={{ width: `${((active + 1) / count) * 100}%` }}
          />
        </div>
        <div className="ml-auto flex gap-2 sm:ml-0">
          {items.map((v, i) => (
            <button
              key={v.id || i}
              onClick={() => goTo(i)}
              aria-label={`Go to video ${i + 1}`}
              className={`size-2 rounded-full transition-colors ${i === active ? "bg-volt" : "bg-white/20 hover:bg-white/40"}`}
            />
          ))}
        </div>
      </div>

      {/* YouTube lightbox */}
      {lightbox !== null && items[lightbox] && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Client video player"
        >
          <div
            className="w-full max-w-3xl overflow-hidden border border-white/15 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-semibold">
                {items[lightbox].name}
                {items[lightbox].role && (
                  <span className="ml-2 text-xs font-normal text-white/50">{items[lightbox].role}</span>
                )}
              </p>
              <button
                onClick={() => setLightbox(null)}
                aria-label="Close video"
                className="grid size-9 place-items-center rounded-full border border-white/15 transition-colors hover:border-volt hover:bg-volt hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                className="size-full"
                src={`https://www.youtube.com/embed/${getYouTubeId(items[lightbox].videoUrl || "")}?autoplay=1&rel=0`}
                title={items[lightbox].name || "Client video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
