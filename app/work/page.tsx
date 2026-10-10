import { readJson, type Project } from "@/lib/content";

export const dynamic = "force-dynamic";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { WorkGrid } from "@/components/WorkGrid";
import { Reveal } from "@/components/motion";

export const metadata = { title: "Selected Work — Sorta Company" };

export default function WorkPage() {
  const site = readJson<any>("site.json", {});
  const projects = readJson<Project[]>("projects.json", []);
  return (
    <>
      <SiteHeader site={site} />
      <main className="section-wrap flex-1 pb-24 pt-32">
        <Reveal>
          <p className="text-sm text-white/55">The sort of work we do</p>
        </Reveal>
        <h1 className="display-type mt-4 text-6xl md:text-8xl">
          GOOD<br />MATTERS<span className="text-hot">.</span>
        </h1>
        <WorkGrid projects={projects} />
      </main>
      <SiteFooter site={site} />
    </>
  );
}
