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

      <main className="relative mx-auto max-w-[960px] px-4 pt-24 pb-20 sm:px-6 sm:pt-36 sm:pb-24">
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
        </section>
      </main>
    </>
  );
}
