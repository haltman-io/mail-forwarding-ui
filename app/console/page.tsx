"use client";

import * as React from "react";
import { SiteHeader } from "@/components/site-header";
import { StatsCards, StatsCardsSkeleton } from "@/components/stats-cards";
import { SubscribeCard } from "@/components/subscribe-card";
import { useStats } from "@/hooks/use-stats";

type ApiStatus = "idle" | "connected" | "error";

export default function ConsolePage() {
  const [apiStatus, setApiStatus] = React.useState<ApiStatus>("idle");
  const stats = useStats();

  return (
    <>
      <SiteHeader onApiStatusChange={setApiStatus} />

      <main className="relative mx-auto max-w-[960px] px-4 pt-24 pb-28 sm:px-6 sm:pt-36 sm:pb-32">
        <section className="mx-auto max-w-[840px] space-y-6 sm:space-y-8">
          {stats ? <StatsCards stats={stats} /> : <StatsCardsSkeleton />}
          <SubscribeCard apiStatus={apiStatus} onApiStatusChange={setApiStatus} />

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
