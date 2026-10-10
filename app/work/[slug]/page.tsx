import Link from "next/link";
import { notFound } from "next/navigation";
import { readJson, type Project } from "@/lib/content";

export const dynamic = "force-dynamic";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Reveal, Magnetic } from "@/components/motion";

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = readJson<any>("site.json", {});
  const projects = readJson<Project[]>("projects.json", []);
  const p = projects.find((x) => x.slug === slug);
  if (!p) return notFound();
  const others = projects.filter((x) => x.slug !== slug).slice(0, 2);
  return (
    <>
      <SiteHeader site={site} />
      <main className="section-wrap flex-1 pb-24 pt-32">
        <Link href="/work" className="text-sm font-semibold text-white/60 transition-colors hover:text-volt">
          ← Back to work
        </Link>
        <Reveal>
          <p className="eyebrow mt-8 text-volt">{p.category} · {p.client}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="display-type mt-4 text-5xl md:text-7xl">{p.title}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65">{p.description}</p>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="relative mt-10 aspect-[1.6/1] overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt={p.imageAlt || p.title} className="size-full object-cover" />
            <span className="absolute left-4 top-4 bg-black/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md">
              {p.category}
            </span>
          </div>
        </Reveal>
        {p.long && (
          <Reveal>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/75">{p.long}</p>
          </Reveal>
        )}
        <Reveal>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-[#f8f5ee] px-4 py-2 font-bold text-black">{p.client}</span>
            <span className="rounded-full border border-white/15 px-4 py-2 text-white/70">{p.type}</span>
            <span className="rounded-full bg-volt px-4 py-2 font-bold text-black">{p.category}</span>
          </div>
        </Reveal>
        <Reveal>
          <div className="mt-10">
            <Magnetic>
              <Link href="/#contact" className="inline-flex h-12 items-center rounded-full bg-[#f8f5ee] px-6 text-sm font-semibold text-black transition-colors hover:bg-volt">
                Start a project like this →
              </Link>
            </Magnetic>
          </div>
        </Reveal>
        {others.length > 0 && (
          <div className="mt-20">
            <Reveal>
              <h2 className="font-display text-xl uppercase">More work <span className="text-volt">✳</span></h2>
            </Reveal>
            <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-8">
              {others.map((o) => (
                <Reveal key={o.slug}>
                  <Link href={`/work/${o.slug}`} className="work-link group block">
                    <div className="relative aspect-[1.6/1] overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={o.image} alt={o.title} className="work-image size-full object-cover" loading="lazy" />
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">{o.category}</p>
                      <p className="font-display mt-1 text-lg uppercase transition-colors group-hover:text-volt">{o.title}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter site={site} />
    </>
  );
}
