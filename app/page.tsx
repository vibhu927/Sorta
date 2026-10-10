import Link from "next/link";
import { readJson, type Project } from "@/lib/content";

export const dynamic = "force-dynamic";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { ContactForm } from "@/components/ContactForm";
import { ServicesAccordion } from "@/components/ServicesAccordion";
import { Reveal, Magnetic } from "@/components/motion";

const ASTERISK = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
    <path d="M12 6v12" />
    <path d="M17.196 9 6.804 15" />
    <path d="m6.804 9 10.392 6" />
  </svg>
);

const WORDMARK_COLORS = ["text-[#f8f5ee]", "text-hot", "text-cobalt"];

export default async function Home() {
  const site = await readJson<any>("site.json", {});
  const projects = await readJson<Project[]>("projects.json", []);
  const featured = projects.filter((p) => p.featured !== false).slice(0, 3);

  const marquee = [...(site?.marquee || []), ...(site?.marquee || [])];
  const badgeLines = String(site?.statement?.line1 || "Not your usual anything").split(" ");
  const heroWords = `${site?.hero?.titleA || "IDEAS WITH"} ${site?.hero?.titleB || "A PULSE."}`.split(" ");
  const heroL1 = heroWords[0] || "IDEAS";
  const heroL2 = heroWords.slice(1, 3).join(" ") || "WITH A";
  const heroL3 = (heroWords.slice(3).join(" ") || "PULSE.").replace(/\.$/, "");

  return (
    <>
      <SiteHeader site={site} />
      <main id="top" className="flex-1">
        {/* HERO */}
        <section className="relative flex min-h-[760px] items-center overflow-hidden pb-24 pt-32 sm:min-h-[850px] sm:pb-32">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-28 top-36 size-[480px] rounded-full bg-cobalt/15 blur-[110px] sm:right-10 sm:top-24" />
            <div className="absolute -left-48 bottom-0 size-[420px] rounded-full bg-hot/10 blur-[110px]" />
            <div className="absolute left-1/3 top-10 size-[300px] rounded-full bg-volt/10 blur-[100px]" />
          </div>
          <div className="section-wrap grid items-center gap-14 lg:grid-cols-2">
            <div>
              <Reveal>
                <p className="max-w-md text-sm leading-relaxed text-white/60">{site?.hero?.eyebrow}</p>
              </Reveal>
              <h1 className="display-type mt-6 max-w-[980px] text-[clamp(3.5rem,9vw,10.7rem)]">
                <span className="block">{heroL1}</span>
                <span className="ml-[.16em] block text-volt">{heroL2}</span>
                <span className="block">
                  {heroL3}<span className="text-hot">.</span>
                </span>
              </h1>
              <Reveal delay={0.15}>
                <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">{site?.hero?.sub}</p>
              </Reveal>
              <Reveal delay={0.25}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Magnetic>
                    <Link
                      href="#work"
                      aria-label={site?.hero?.scrollHint || "Scroll to selected work"}
                      className="group grid size-14 place-items-center rounded-full bg-volt text-black transition-transform hover:scale-105"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m7 7 10 10" />
                        <path d="M17 7v10" />
                        <path d="M7 17h10" />
                      </svg>
                    </Link>
                  </Magnetic>
                  <Magnetic strength={0.2}>
                    <Link
                      href={site?.hero?.primaryCta?.href || "#contact"}
                      className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#f8f5ee] px-6 text-sm font-semibold text-black shadow transition-colors hover:bg-volt"
                    >
                      {site?.hero?.primaryCta?.label?.replace(" →", "") || "Let's make something"}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1" aria-hidden="true">
                        <path d="M7 7h10v10" />
                        <path d="M7 17 17 7" />
                      </svg>
                    </Link>
                  </Magnetic>
                  <Link
                    href={site?.hero?.secondaryCta?.href || "#work"}
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold transition-colors hover:border-volt/60"
                  >
                    {site?.hero?.secondaryCta?.label || "Get into the work"}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 5v14" />
                      <path d="m19 12-7 7-7-7" />
                    </svg>
                  </Link>
                </div>
              </Reveal>
            </div>
            <div className="relative mt-4 min-h-[360px] sm:min-h-[500px] lg:mt-0">
              <div className="absolute inset-8 -rotate-[7deg] overflow-hidden rounded-sm border border-white/20 bg-cobalt/20 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="size-full object-cover"
                  src={site?.hero?.image || "/images/sorta-project-neon.jpg"}
                  alt={site?.hero?.imageAlt || "Sorta work"}
                  width="1200"
                  height="900"
                />
              </div>
              <div className="hero-float absolute left-0 top-12 z-10 flex size-24 -rotate-12 items-center justify-center rounded-full border border-white/15 bg-black/65 text-center text-[10px] font-bold uppercase leading-tight backdrop-blur-xl sm:left-2 sm:size-28">
                <span>
                  {badgeLines.slice(0, 2).join(" ")}<br />{badgeLines.slice(2).join(" ") || "anything"}
                </span>
              </div>
              <div className="font-display absolute bottom-8 right-0 z-10 rotate-[8deg] border border-black/10 bg-hot px-4 py-3 text-xs text-black shadow-xl sm:right-3 sm:px-5 sm:py-4 sm:text-sm">
                {site?.statement?.line2 || "MORE FEELING. LESS FILLER."}
              </div>
              <div className="absolute -bottom-1 left-12 z-10 h-2 w-24 -rotate-[18deg] rounded-full bg-volt sm:bottom-0" />
              <div className="absolute right-6 top-0 size-12 rounded-full border border-hot/70 sm:right-2 sm:top-4 sm:size-16" />
            </div>
          </div>
          <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-between px-6 text-[10px] font-semibold uppercase tracking-widest text-white/40 sm:px-10">
            <span>Strategy / Identity / Digital / Culture</span>
            <span>SC—001 · 2026</span>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee relative overflow-hidden border-y border-white/10 bg-volt py-4 text-black">
          <div className="marquee-track flex w-max items-center gap-6 whitespace-nowrap font-display text-2xl sm:text-3xl">
            {[0, 1].map((half) => (
              <div key={half} className="flex items-center gap-6" aria-hidden={half === 1}>
                {(site?.marquee || []).map((m: string) => (
                  <span key={`${half}-${m}`} className="flex items-center gap-6">
                    {m}
                    {ASTERISK}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ABOUT */}
        <section id="about" className="section-wrap grid scroll-mt-24 gap-12 py-28 sm:py-36 lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
          <Reveal>
            <div>
              <p className="eyebrow text-volt">{site?.about?.index}</p>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">{site?.about?.kicker}</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <h2 className="max-w-4xl text-pretty text-3xl font-semibold leading-[1.15] sm:text-5xl lg:text-[3.5rem]">
                A creative company for people with <span className="text-volt">outside voices.</span>
              </h2>
              <div className="mt-8 grid gap-8 border-t border-white/10 pt-7 sm:grid-cols-2">
                <p className="text-sm leading-relaxed text-white/65">{site?.about?.paragraphs?.[0]}</p>
                <div className="grid gap-8">
                  {[...(site?.about?.paragraphs || [])].slice(1).map((p: string, i: number) => (
                    <p key={i} className="text-sm leading-relaxed text-white/65">{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* SERVICES */}
        <section id="services" className="scroll-mt-24 border-y border-white/10 bg-card/50 py-24 sm:py-32">
          <div className="section-wrap">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="eyebrow text-volt">{site?.services?.index}</p>
                  <h2 className="display-type mt-5 text-5xl sm:text-7xl">
                    THE<br />WHOLE<br />PICTURE<span className="text-hot">.</span>
                  </h2>
                </div>
                <p className="max-w-xs text-sm leading-relaxed text-white/55">{site?.services?.sub}</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-12">
                <ServicesAccordion items={site?.services?.items || []} />
              </div>
            </Reveal>
            <Reveal>
              <p className="mt-8 text-sm text-white/55">
                <span className="mr-1 text-volt">✳</span> {site?.services?.footer}
              </p>
            </Reveal>
          </div>
        </section>

        {/* WORK */}
        <section id="work" className="section-wrap scroll-mt-24 py-24 sm:py-32">
          <Reveal>
            <p className="eyebrow text-volt">{site?.workPreview?.index}</p>
            <h2 className="display-type mt-5 text-5xl sm:text-7xl">
              SELECTED<br />MATTERS<span className="text-hot">.</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">{site?.workPreview?.sub}</p>
          </Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={0.08 * i}>
                <Link href={`/work/${p.slug}`} className={`work-link group block ${i === 1 ? "md:mt-20" : ""}`}>
                  <div className="relative aspect-[1.28/1] overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="work-image size-full object-cover" src={p.image} alt={p.imageAlt || p.title} loading="lazy" />
                    <span className="absolute left-4 top-4 bg-black/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#f8f5ee] backdrop-blur-md">
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
                      <h3 className="font-display text-xl uppercase sm:text-2xl">{p.title}</h3>
                      <p className="mt-1 text-sm text-white/55">
                        {p.client} <span className="px-1.5 text-volt">/</span> {p.type}
                      </p>
                    </div>
                    <span className="pt-1 text-xs text-white/40">0{i + 1}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <Link href="/work" className="group mt-14 inline-flex items-center gap-3 text-sm font-semibold">
              {site?.workPreview?.allLabel || "All projects"}
              <span className="grid size-9 place-items-center rounded-full border border-white/15 transition-colors group-hover:border-volt group-hover:bg-volt group-hover:text-black">
                →
              </span>
            </Link>
          </Reveal>
        </section>

        {/* PROCESS — inverted cream */}
        <section id="process" className="relative scroll-mt-24 overflow-hidden border-y border-black/10 bg-[#f8f5ee] py-24 text-black sm:py-32">
          <div className="section-wrap">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="eyebrow text-cobalt">{site?.process?.index}</p>
                  <h2 className="display-type mt-5 max-w-3xl text-5xl sm:text-7xl">
                    GOOD IDEAS<br />HAVE A <span className="text-hot">WAY.</span>
                  </h2>
                </div>
                <p className="max-w-xs text-sm leading-relaxed text-black/60">{site?.process?.sub}</p>
              </div>
            </Reveal>
            <div className="mt-16 grid border-t border-black/20 sm:grid-cols-3">
              {(site?.process?.steps || []).map((s: any, i: number) => (
                <Reveal key={s.n + s.title} delay={0.05 * i}>
                  <div className="group flex min-h-28 items-center gap-4 border-b border-black/20 py-5 sm:py-6">
                    <span className="eyebrow text-cobalt">{s.n}</span>
                    <span className="font-display text-2xl uppercase transition-colors group-hover:text-volt sm:text-3xl" style={{ WebkitTextStroke: "0" }}>
                      <span className="transition-colors group-hover:text-[#9db800]">{s.title}</span>
                    </span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto size-4 opacity-30 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#9db800] group-hover:opacity-100" aria-hidden="true">
                      <path d="M7 7h10v10" />
                      <path d="M7 17 17 7" />
                    </svg>
                  </div>
                  {s.desc && <p className="pb-5 text-xs leading-relaxed text-black/50">{s.desc}</p>}
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CLIENTS */}
        <section className="section-wrap grid gap-12 py-24 sm:py-32 lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
          <Reveal>
            <div>
              <p className="eyebrow text-volt">{site?.clients?.index}</p>
              <h2 className="display-type mt-5 text-5xl sm:text-7xl">
                GOOD<br />COMPANY<span className="text-hot">.</span>
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">{site?.clients?.sub}</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-wrap content-start items-center gap-x-8 gap-y-7 border-y border-white/10 py-8 sm:gap-x-12 sm:gap-y-10">
              {(site?.clients?.logos || []).map((l: string, i: number) => (
                <span key={l} className={`font-display text-2xl uppercase sm:text-3xl ${WORDMARK_COLORS[i % WORDMARK_COLORS.length]}`}>
                  {l}
                </span>
              ))}
            </div>
          </Reveal>
        </section>

        {/* TESTIMONIAL */}
        {site?.clients?.testimonial && (
          <div className="section-wrap">
            <Reveal>
              <figure className="border-t border-white/10 pt-9 sm:pt-12">
                <p className="eyebrow text-tang">Kind words</p>
                <blockquote className="mt-7 max-w-5xl text-balance text-3xl font-medium leading-tight sm:text-5xl">
                  “{site.clients.testimonial.quote}”
                </blockquote>
                <figcaption className="mt-7 flex flex-wrap items-center gap-2 text-sm text-white/55">
                  <span className="size-2 rounded-full bg-hot" />
                  {site.clients.testimonial.name} <span className="text-white/30">/</span> {site.clients.testimonial.role}
                </figcaption>
              </figure>
            </Reveal>
          </div>
        )}

        {/* CONTACT */}
        <section id="contact" className="relative scroll-mt-24 overflow-hidden border-t border-white/10 bg-card/50 py-24 sm:py-32">
          <div className="section-wrap grid gap-14 lg:grid-cols-2">
            <div>
              <Reveal>
                <p className="eyebrow text-volt">{site?.contact?.index}</p>
                <h2 className="display-type mt-5 text-[4rem] sm:text-[6.5rem]">
                  YOUR<br />MOVE<span className="text-hot">.</span>
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">{site?.contact?.sub}</p>
                <a href={`mailto:${site?.contact?.email}`} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-volt">
                  {site?.contact?.email}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </a>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <ContactForm site={site} />
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter site={site} />
    </>
  );
}
