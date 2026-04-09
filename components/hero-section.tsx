"use client";

import Link from "next/link";
import {
  Shield,
  Eye,
  Globe,
  AtSign,
  Terminal,
  Lock,
  Code2,
  Infinity,
  ArrowRight
} from "lucide-react";
import type { Stats } from "@/hooks/use-stats";
import TextType from "@/components/TextType";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Trust signal items ── */
const TRUST_SIGNALS = [
  { icon: Code2, label: "Open source" },
  { icon: Eye, label: "Auditable" },
  { icon: Shield, label: "No tracking" },
  { icon: Lock, label: "No analytics" },
] as const;

type HeroSectionProps = {
  stats: Stats | null;
};

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="hero-section relative space-y-8 sm:space-y-10">
      {/* ── Headline ── */}
      <div className="space-y-4 text-center">
        <TextType
          as="h1"
          className="hero-headline mx-auto block min-h-[3.45em] w-full max-w-[18ch] font-mono text-3xl font-bold leading-[1.15] tracking-tight text-[var(--text-primary)] sm:min-h-[2.35em] sm:max-w-[22ch] sm:text-4xl md:text-5xl"
          text={[
            "Your *identity* is not their *product*.",
            "Your *email* is not their *telemetry*.",
            "Built for *curiosity*. Not for *compliance*.",
            "Because *privacy* should not need approval.",
          ]}
          highlightClassName="text-type__highlight"
          typingSpeed={75}
          pauseDuration={1500}
          deletingSpeed={50}
          cursorCharacter="█"
          cursorBlinkDuration={0.5}
          showCursor={true}
          variableSpeed={{ min: 60, max: 120 }}
          loop={true}
        />

        <p className="mx-auto max-w-[540px] text-[15px] leading-relaxed text-[var(--text-secondary)] sm:text-base">
          A free email forwarding server.&nbsp;
          <br className="hidden sm:block" />
          No corporate bullshit. No VC money. No data harvesting.
          <br className="hidden sm:block" />
          <span className="hidden sm:inline">Just aliases.</span>
        </p>

      </div>

      {/* ── Trust signals ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="hero-trust-chip inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 backdrop-blur-[var(--glass-blur)]"
          >
            <Icon className="h-3 w-3 text-[var(--neu-green)] opacity-70" />
            <span className="text-[11px] font-medium tracking-wide text-[var(--text-muted)] uppercase">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Stats row ── */}
      {stats && (
        <div className="mx-auto grid max-w-[520px] grid-cols-3 gap-3 sm:gap-4">
          <div className="hero-stat-card group relative overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3.5 text-center backdrop-blur-[var(--glass-blur)] backdrop-saturate-[1.3]">
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.06]" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgb(var(--alias-accent-rgb) / 1), transparent)" }} />
            <div className="relative">
              <div className="mb-1 flex items-center justify-center">
                <Globe className="hero-stat-icon h-4 w-4 text-[var(--alias-accent)] opacity-60" />
              </div>
              <p className="font-mono text-xl font-bold leading-none tracking-tight text-[var(--text-primary)] sm:text-2xl">
                {stats.domains}
              </p>
              <p className="mt-1 text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                Domains
              </p>
            </div>
          </div>

          <div className="hero-stat-card group relative overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3.5 text-center backdrop-blur-[var(--glass-blur)] backdrop-saturate-[1.3]">
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.04] transition-opacity duration-500 group-hover:opacity-[0.07]" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgb(var(--alias-accent-rgb) / 1), transparent)" }} />
            <div className="relative">
              <div className="mb-1 flex items-center justify-center">
                <Infinity className="hero-stat-icon h-4 w-4 text-[var(--neu-green)] opacity-60" />
              </div>
              <p className="font-mono text-xl font-bold leading-none tracking-tight text-[var(--text-primary)] sm:text-2xl">
                &infin;
              </p>
              <p className="mt-1 text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                Aliases
              </p>
            </div>
          </div>

          <div className="hero-stat-card group relative overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3.5 text-center backdrop-blur-[var(--glass-blur)] backdrop-saturate-[1.3]">
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.06]" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgb(var(--alias-accent-rgb) / 1), transparent)" }} />
            <div className="relative">
              <div className="mb-1 flex items-center justify-center">
                <AtSign className="hero-stat-icon h-4 w-4 text-[var(--alias-accent)] opacity-60" />
              </div>
              <p className="font-mono text-xl font-bold leading-none tracking-tight text-[var(--text-primary)] sm:text-2xl">
                $0
              </p>
              <p className="mt-1 text-[10px] font-medium tracking-wider text-[var(--text-muted)] uppercase">
                Forever
              </p>
            </div>
          </div>
        </div>
      )}
      {!stats && (
        <div className="mx-auto grid max-w-[520px] grid-cols-3 gap-3 sm:gap-4">
          <div className="hero-stat-card relative overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3.5 backdrop-blur-[var(--glass-blur)] backdrop-saturate-[1.3]">
            <div className="relative flex flex-col items-center">
              <Skeleton className="mb-1 h-4 w-4 rounded-sm bg-[var(--surface-pressed)]/80" />
              <Skeleton className="h-7 w-12 bg-[var(--surface-pressed)]/80" />
              <Skeleton className="mt-1 h-2.5 w-12 rounded-sm bg-[var(--surface-pressed)]/80" />
            </div>
          </div>
          <div className="hero-stat-card relative overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3.5 backdrop-blur-[var(--glass-blur)] backdrop-saturate-[1.3]">
            <div className="relative flex flex-col items-center">
              <Skeleton className="mb-1 h-4 w-4 rounded-sm bg-[var(--surface-pressed)]/80" />
              <Skeleton className="h-7 w-12 bg-[var(--surface-pressed)]/80" />
              <Skeleton className="mt-1 h-2.5 w-12 rounded-sm bg-[var(--surface-pressed)]/80" />
            </div>
          </div>
          <div className="hero-stat-card relative overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3.5 backdrop-blur-[var(--glass-blur)] backdrop-saturate-[1.3]">
            <div className="relative flex flex-col items-center">
              <Skeleton className="mb-1 h-4 w-4 rounded-sm bg-[var(--surface-pressed)]/80" />
              <Skeleton className="h-7 w-12 bg-[var(--surface-pressed)]/80" />
              <Skeleton className="mt-1 h-2.5 w-12 rounded-sm bg-[var(--surface-pressed)]/80" />
            </div>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="flex flex-col items-center gap-4 pt-2">
        <Link
          href="/console"
          className="hero-cta group inline-flex items-center gap-2.5 rounded-full border border-[rgb(var(--alias-accent-rgb)_/_0.20)] bg-[rgb(var(--alias-accent-rgb)_/_0.10)] px-8 py-3 font-mono text-sm font-semibold text-[var(--neu-green)] sm:px-10 sm:py-3.5 sm:text-base"
        >
          <Terminal className="h-4 w-4 opacity-70 sm:h-[18px] sm:w-[18px]" />
          Create an alias
          <ArrowRight className="h-4 w-4 opacity-50 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        <span className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
          no account required
        </span>
      </div>
    </section>
  );
}
