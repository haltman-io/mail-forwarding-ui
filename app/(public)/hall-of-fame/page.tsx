import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import { SiteHeader } from "@/components/site-header";
import { Separator } from "@/components/ui/separator";

const HALL_OF_FAME_SOURCE = "content/hall-of-fame.md";
const hallOfFameFilePath = path.join(process.cwd(), HALL_OF_FAME_SOURCE);

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Hall of Fame | Free Mail Forwarding",
  description:
    "Public recognition for researchers who responsibly reported vulnerabilities in the mail forwarding service.",
};

async function getHallOfFameDocument() {
  const [source, fileStats] = await Promise.all([
    readFile(hallOfFameFilePath, "utf8"),
    stat(hallOfFameFilePath),
  ]);

  const titleMatch = source.match(/^#\s+(.+?)\r?\n/);
  const title = titleMatch?.[1]?.trim() || "Hall of Fame";
  const content = titleMatch ? source.replace(/^#\s+.+?\r?\n+/, "") : source;

  return {
    content,
    title,
    updatedAt: new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(fileStats.mtime),
  };
}

export default async function HallOfFamePage() {
  const document = await getHallOfFameDocument();

  return (
    <>
      <SiteHeader />

      <main className="relative mx-auto max-w-[960px] px-4 pt-24 pb-28 sm:px-6 sm:pt-36 sm:pb-32">
        <article className="mx-auto max-w-[740px]">
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>

          <div className="space-y-8">
            <header className="space-y-4">
              <h1 className="text-balance font-mono text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                {document.title}
              </h1>
              <p className="font-mono text-xs tracking-[0.04em] text-[var(--text-muted)]">
                Last updated: {document.updatedAt}
              </p>
            </header>

            <Separator className="bg-[var(--hover-state)]" />

            <MarkdownContent source={document.content} />
          </div>

          
        </article>
      </main>
    </>
  );
}
