"use client";

import * as React from "react";
import { Fingerprint } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { HandleCard } from "@/components/handle-card";

type ApiStatus = "idle" | "connected" | "error";

export default function HandlePage() {
  const [apiStatus, setApiStatus] = React.useState<ApiStatus>("idle");

  return (
    <>
      <SiteHeader onApiStatusChange={setApiStatus} />

      <main className="relative mx-auto max-w-[960px] px-4 pt-24 pb-28 sm:px-6 sm:pt-36 sm:pb-32">
        <section className="mx-auto max-w-[840px] space-y-6 sm:space-y-8">
          {/* ── Handle feature announcement ── */}
          <div className="stats-card group relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-4 backdrop-blur-[var(--glass-blur)] backdrop-saturate-[1.3] transition-all duration-300 ease-[var(--motion-ease-standard)] hover:scale-[1.01]">
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.035] transition-opacity duration-500 group-hover:opacity-[0.07]"
              style={{ background: "radial-gradient(ellipse 80% 60% at 20% 40%, rgb(var(--alias-accent-rgb) / 1), transparent)" }}
            />
            <div className="pointer-events-none absolute top-0 left-[15%] right-[15%] h-px rounded-b bg-gradient-to-r from-transparent via-[rgb(var(--alias-accent-rgb)_/_0.30)] to-transparent opacity-60" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--alias-accent-rgb)_/_0.12)] bg-[rgb(var(--alias-accent-rgb)_/_0.08)] shadow-[0_0_12px_rgb(var(--alias-accent-rgb)_/_0.06)]">
                <Fingerprint className="h-[18px] w-[18px] text-[var(--alias-accent)] opacity-80" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="flex items-center gap-2 text-[13px] font-semibold tracking-tight text-[var(--text-primary)]">
                  Handles are live
                  <span className="rounded bg-[rgb(var(--alias-accent-rgb)_/_0.15)] px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-wide text-[var(--neu-green)] uppercase">
                    New
                  </span>
                </p>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  Claim a unique username and receive emails at <span className="font-mono text-[var(--text-primary)]">you@*</span> across
                  every domain. Block specific domains, keep the rest &mdash; your handle, your rules.
                </p>
              </div>
            </div>
          </div>

          <HandleCard apiStatus={apiStatus} onApiStatusChange={setApiStatus} />

          <footer className="mt-12 flex justify-center pb-8 sm:mt-16 sm:pb-12">
            <div
              className="relative inline-flex items-center gap-3 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_16px_-4px_rgba(0,0,0,0.30)] backdrop-blur-[24px] backdrop-saturate-[1.3]"
            >
              <div className="absolute inset-0 pointer-events-none rounded-full" />
              <div className="relative flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neu-green)] opacity-30"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--neu-green)] opacity-70 shadow-[0_0_6px_rgba(var(--neu-green-rgb)/0.5)]"></span>
                </span>
                <p className="m-0 font-sans text-[11px] font-medium tracking-wider text-[var(--text-secondary)] uppercase">
                  Powered by{" "}
                  <a href="https://haltman.io" target="_blank" rel="noreferrer" className="font-bold text-[color:var(--text-primary)] transition-colors hover:text-[var(--neu-green)]">Haltman.io</a>
                  <span className="mx-1.5 text-[color:var(--text-muted)]">&amp;</span>
                  <a href="https://www.thc.org" target="_blank" rel="noreferrer" className="font-bold text-[color:var(--text-primary)] transition-colors hover:text-[var(--neu-green)]">The Hacker&apos;s Choice</a>
                </p>
              </div>
            </div>
          </footer>
        </section>
      </main>
    </>
  );
}
