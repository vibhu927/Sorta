import type { Project } from "./content";

const BG: Record<string, string> = {
  Branding: "bg-pop",
  Marketing: "bg-acid",
  Creators: "bg-bolt",
};
const INK: Record<string, string> = {
  Branding: "text-pop",
  Marketing: "text-tang",
  Creators: "text-bolt",
};
const OVERRIDE: Record<string, { bg: string; ink: string }> = {
  pop: { bg: "bg-pop", ink: "text-pop" },
  acid: { bg: "bg-acid", ink: "text-tang" },
  bolt: { bg: "bg-bolt", ink: "text-bolt" },
  tang: { bg: "bg-tang", ink: "text-tang" },
};

export function acc(p: Project) {
  const a = (p as { accent?: string }).accent;
  if (a && OVERRIDE[a]) return OVERRIDE[a];
  return { bg: BG[p.category] || "bg-pop", ink: INK[p.category] || "text-pop" };
}
