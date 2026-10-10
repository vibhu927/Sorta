import type { Metadata } from "next";
import { Archivo_Black, DM_Sans } from "next/font/google";
import "./globals.css";
import { readJson } from "@/lib/content";

const archivo = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata(): Promise<Metadata> {
  const site = await readJson<any>("site.json", {});
  return {
    title: site?.seo?.title || "Sorta Company — Ideas with a pulse",
    description:
      site?.seo?.description ||
      "Sorta is an independent creative company building brands, digital experiences and culture.",
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${archivo.variable} ${dmSans.variable}`}>
      <body className="flex min-h-full flex-col bg-[#050509] text-[#f8f5ee] antialiased">{children}</body>
    </html>
  );
}
