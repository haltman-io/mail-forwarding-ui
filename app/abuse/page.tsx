"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Separator } from "@/components/ui/separator";

export default function AbusePage() {
  return (
    <>
      <SiteHeader />

      <main className="relative mx-auto max-w-[960px] px-4 pt-24 pb-28 sm:px-6 sm:pt-36 sm:pb-32">
        <article className="mx-auto max-w-[740px]">
          {/* Back link */}
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </Link>

          {/* Page header */}
          <header className="space-y-4">
            <h1 className="font-mono text-lg font-semibold uppercase tracking-[0.06em] text-[var(--text-primary)] sm:text-xl">
              Anti-Abuse Policy
            </h1>
            <p className="font-mono text-sm uppercase tracking-[0.04em] text-[var(--neu-green)]">
              This System Is Not a Crime Platform.
            </p>
          </header>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Scope */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Scope
            </h2>
            <div className="space-y-3 font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              <p>Tools provided here are for research and educational use.</p>
              <p>If you turn them into weapons, you are on your own.</p>
              <p>We do not protect them.</p>
            </div>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Prohibited */}
          <section className="space-y-5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Prohibited
            </h2>
            <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
              <ul className="space-y-3 font-mono text-sm leading-[1.6] text-[var(--text-primary)]">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                  No ransomware.
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                  No botnets.
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                  No DDoS.
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                  No fraud.
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                  No &quot;revenge&quot;.
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                  No excuses.
                </li>
              </ul>
            </div>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Enforcement */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Enforcement
            </h2>
            <div className="space-y-3 font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              <p>We do not host criminal operations.</p>
              <p>Valid abuse reports will be reviewed.</p>
              <p>Confirmed abuse will be terminated.</p>
            </div>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Report Channels */}
          <section className="space-y-5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Report Channels
            </h2>
            <div className="select-text space-y-3 font-mono text-sm leading-[1.6]">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[var(--text-muted)]">Report:</span>
                <a href="mailto:members@proton.thc.org" className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)]">members@proton.thc.org</a>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[var(--text-muted)]">Alt:</span>
                <a href="mailto:root@haltman.io" className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)]">root@haltman.io</a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 flex justify-center pb-8 sm:mt-16 sm:pb-12">
            <a
              href="https://haltman.io"
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex items-center gap-3 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_16px_-4px_rgba(0,0,0,0.30)] backdrop-blur-[24px] backdrop-saturate-[1.3] transition-all duration-300 ease-[var(--motion-ease-standard)] hover:scale-[1.02] hover:bg-[var(--hover-state)]"
            >
              <div className="absolute inset-0 pointer-events-none rounded-full" />
              <div className="relative flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neu-green)] opacity-30"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--neu-green)] opacity-70 shadow-[0_0_6px_rgba(var(--neu-green-rgb)/0.5)]"></span>
                </span>
                <p className="m-0 font-sans text-[11px] font-medium tracking-wider text-[var(--text-secondary)] uppercase">
                  Powered by{" "}
                  <strong className="font-bold text-[color:var(--text-primary)] transition-colors group-hover:text-[var(--neu-green)]">Haltman.io</strong>
                  <span className="mx-1.5 text-[color:var(--text-muted)]">&amp;</span>
                  <strong className="font-bold text-[color:var(--text-primary)] transition-colors group-hover:text-[var(--neu-green)]">The Hacker&apos;s Choice</strong>
                </p>
              </div>
            </a>
          </footer>
        </article>
      </main>
    </>
  );
}
