import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import { SiteHeader } from "@/components/site-header";
import styles from "./page.module.css";

const HALL_OF_FAME_SOURCE = "content/hall-of-fame.md";
const hallOfFameFilePath = path.join(process.cwd(), HALL_OF_FAME_SOURCE);

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Hall of Fame | Free Mail Forwarding",
  description:
    "Public recognition for researchers who responsibly reported vulnerabilities in the mail forwarding service.",
};

function getLatestEntry(content: string) {
  const heading = /^###[\t ]+(.+)\r?$/m.exec(content);

  if (!heading) return null;

  const entryStart = heading.index + heading[0].length;
  const remaining = content.slice(entryStart);
  const nextHeading = /^#{1,3}[\t ]+/m.exec(remaining);
  const entryEnd = nextHeading ? entryStart + nextHeading.index : content.length;

  return {
    date: heading[1].trim(),
    beforeEntry: content.slice(0, heading.index).trim(),
    source: content
      .slice(entryStart, entryEnd)
      .replace(/^\s*---[\t ]*\r?\n/, "")
      .trim(),
    archive: content.slice(entryEnd).trim(),
  };
}

async function getHallOfFameDocument() {
  const [source, fileStats] = await Promise.all([
    readFile(hallOfFameFilePath, "utf8"),
    stat(hallOfFameFilePath),
  ]);

  const titleMatch = source.match(/^#\s+(.+?)\r?\n/);
  const title = titleMatch?.[1]?.trim() || "Hall of Fame";
  const content = titleMatch ? source.replace(/^#\s+.+?\r?\n+/, "") : source;
  const firstSectionIndex = content.search(/^#{1,6}[\t ]+/m);
  const introduction = (
    firstSectionIndex === -1 ? content : content.slice(0, firstSectionIndex)
  ).trim();
  const entries = firstSectionIndex === -1 ? "" : content.slice(firstSectionIndex);

  return {
    content: entries,
    introduction,
    latestEntry: getLatestEntry(entries),
    title,
    updatedAt: new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(fileStats.mtime),
  };
}

function LatestReport({
  date,
  source,
}: {
  date: string;
  source: string;
}) {
  return (
    <section
      aria-labelledby="latest-report-terminal"
      className={`${styles.latestReport} relative min-w-0 space-y-5 overflow-hidden rounded-lg border border-[var(--glass-border)] bg-[var(--surface-pressed)] p-5 pl-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] [overflow-wrap:anywhere] sm:p-6 sm:pl-7 dark:bg-[rgba(0,0,0,0.3)]`}
    >
      <span
        aria-hidden="true"
        className={`${styles.accent} absolute inset-y-0 left-0 w-1 rounded-r bg-[var(--neu-green)] opacity-60`}
      />

      <header className="flex flex-wrap items-center gap-3">
        <h3
          id="latest-report-terminal"
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--neu-green)]"
        >
          {date}
        </h3>
        <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[10px] font-medium tracking-[0.08em] text-[var(--neu-green)]">
          [ LATEST ]
        </span>
      </header>

      <MarkdownContent
        source={source}
        className="[&_p]:font-mono [&_p]:text-xs [&_p]:leading-6 [&_ul]:font-mono [&_ul]:text-xs [&_ul]:leading-6"
      />
    </section>
  );
}

export default async function HallOfFamePage() {
  const document = await getHallOfFameDocument();
  const latestEntry = document.latestEntry;

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
            <header className="space-y-3">
              <h1 className="text-balance font-mono text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                {document.title}
              </h1>
              {document.introduction && (
                <MarkdownContent source={document.introduction} className="[&_p]:leading-6" />
              )}
              <p className="font-mono text-xs tracking-[0.04em] text-[var(--text-muted)]">
                Last updated: {document.updatedAt}
              </p>
            </header>

            {latestEntry ? (
              <>
                {latestEntry.beforeEntry && (
                  <MarkdownContent source={latestEntry.beforeEntry} />
                )}

                <LatestReport date={latestEntry.date} source={latestEntry.source} />

                {latestEntry.archive && (
                  <MarkdownContent source={latestEntry.archive} />
                )}
              </>
            ) : (
              document.content && <MarkdownContent source={document.content} />
            )}
          </div>
        </article>
      </main>
    </>
  );
}
