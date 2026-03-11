"use client";

import * as React from "react";
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
  ArrowRight,
  ChevronLeft,
  ChevronRight,
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
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-1.5 backdrop-blur-[var(--glass-blur)]">
          <Terminal className="h-3.5 w-3.5 text-[var(--neu-green)] opacity-80" />
          <span className="font-mono text-[11px] font-medium tracking-wider text-[var(--text-secondary)] uppercase">
            Built by hackers. Run by hackers.
          </span>
        </div>

        <TextType
          as="h1"
          className="hero-headline block font-mono text-3xl font-bold leading-[1.15] tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl"
          text={[
            "Your *identity* is not their *product*.",
            "Email aliases for *hackers* who read *Phrack*.",
            "Unlike *Proton*, we don't send your data to *FBI*.",
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
          Your free email alias forwarding.&nbsp;
          <br className="hidden sm:block" />
          No corporate bullshit. No VC money. No data harvesting.
          <span className="hidden sm:inline"> Just aliases.</span>
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
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.06]" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(48,209,88,1), transparent)" }} />
            <div className="relative">
              <div className="mb-1 flex items-center justify-center">
                <Globe className="h-4 w-4 text-[var(--alias-accent)] opacity-60" />
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
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.04] transition-opacity duration-500 group-hover:opacity-[0.07]" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(48,209,88,1), transparent)" }} />
            <div className="relative">
              <div className="mb-1 flex items-center justify-center">
                <Infinity className="h-4 w-4 text-[var(--neu-green)] opacity-60" />
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
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.06]" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(48,209,88,1), transparent)" }} />
            <div className="relative">
              <div className="mb-1 flex items-center justify-center">
                <AtSign className="h-4 w-4 text-[var(--alias-accent)] opacity-60" />
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
      <div className="flex flex-col items-center gap-3 pt-2">
        <Link
          href="/console"
          className="group inline-flex items-center gap-2 rounded-full border border-[rgba(48,209,88,0.15)] bg-[rgba(48,209,88,0.08)] px-6 py-2.5 font-mono text-sm font-medium text-[var(--neu-green)] transition-all duration-300 hover:scale-[1.02] hover:border-[rgba(48,209,88,0.25)] hover:bg-[rgba(48,209,88,0.12)] hover:shadow-[0_0_20px_rgba(48,209,88,0.10)]"
        >
          <Terminal className="h-4 w-4 opacity-70" />
          Create an alias
          <ArrowRight className="h-3.5 w-3.5 opacity-50 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
        <span className="font-mono text-[10px] tracking-wider text-[var(--text-muted)] uppercase">
          no account required
        </span>
      </div>

      {/* ── Manifesto carousel ── */}
      <ManifestoCarousel stats={stats} />
    </section>
  );
}

/* ── Manifesto Carousel ── */

const SLIDE_INTERVAL = 6000;

function ManifestoCarousel({ stats }: { stats: Stats | null }) {
  const [active, setActive] = React.useState(0);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = React.useMemo(
    () => [
      {
        title: "Why this exists",
        accent: "rgba(48,209,88,0.20)",
        content: (
          <>
            <p>
              Source is open. Infrastructure is auditable.
              <br />
              No trust required. Verify it yourself.
            </p>
            <p>
              We don&apos;t sell access to your aliases addresses.
              <br />
              We don&apos;t hand metadata to federal agencies.
              <br />
              We don&apos;t pretend encryption means privacy
              <br />
              while cooperating with law enforcement.
            </p>
            <p className="border-t border-[var(--glass-border)] pt-3 font-mono text-[11px] tracking-wide text-[var(--text-muted)]">
              no compliance theater. no privacy branding. just routing.
            </p>
          </>
        ),
      },
      {
        title: "What you get",
        accent: "rgba(48,209,88,0.20)",
        content: (
          <>
            <p>
              <span className="font-semibold text-[var(--text-primary)]">{stats?.domains ?? 29} domains</span>.
              Unlimited aliases. Unlimited destinations.
            </p>
            <p>
              Pick a handle. Point it at your real inbox.
              <br />
              Mail goes in, gets forwarded, done.
            </p>
            <p>
              No accounts required for basic use.
              <br />
              No payment. No trial period. No upsell.
            </p>
            <p className="border-t border-[var(--glass-border)] pt-3 font-mono text-[11px] tracking-wide text-[var(--text-muted)]">
              free until the infrastructure dies or we get raided.
            </p>
          </>
        ),
      },
      {
        title: "No brand. No theater.",
        accent: "rgba(48,209,88,0.20)",
        content: (
          <>
            <p>
              The domains are real.{" "}
              <span className="font-mono text-[var(--neu-green)]">reads.phrack.org</span>,{" "}
              <span className="font-mono text-[var(--neu-green)]">free.team-teso.net</span>,{" "}
              <span className="font-mono text-[var(--neu-green)]">smokes.thc.org</span>,{" "}
              <span className="font-mono text-[var(--neu-green)]">segfault.net</span>,{" "}
              <span className="font-mono text-[var(--neu-green)]">lockbit.io</span>,{" "}
              <span className="font-mono text-[var(--neu-green)]">metasploit.io</span>,{" "}
              <span className="font-mono text-[var(--neu-green)]">lulz.antisec.net</span>,{" "}
              <span className="font-mono text-[var(--neu-green)]">ghetto.eurocompton.net</span>{" "}
              <span className="text-[var(--text-muted)]">+21 domains</span>.
              <br />
              Not disposable garbage from a bulk registrar.
            </p>
            <p>
              No VC money. No advisory board. No growth metrics.
              <br />
              Built by people who actually run mail infrastructure.
            </p>
            <p className="border-t border-[var(--glass-border)] pt-3 font-mono text-[11px] tracking-wide text-[var(--text-muted)]">
              owned by operators. not committees.
            </p>
          </>
        ),
      },
    ],
    [stats],
  );

  const count = slides.length;

  const resetTimer = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActive((prev) => (prev + 1) % count);
    }, SLIDE_INTERVAL);
  }, [count]);

  React.useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const goTo = (index: number) => {
    setDirection(index > active ? 1 : -1);
    setActive(index);
    resetTimer();
  };

  const goPrev = () => {
    setDirection(-1);
    setActive((prev) => (prev - 1 + count) % count);
    resetTimer();
  };

  const goNext = () => {
    setDirection(1);
    setActive((prev) => (prev + 1) % count);
    resetTimer();
  };

  return (
    <div className="mx-auto max-w-[540px]">
      <div className="relative overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]">
        {/* Accent line */}
        <div
          className="pointer-events-none absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent to-transparent opacity-60 transition-all duration-500"
          style={{ ["--tw-gradient-via" as string]: slides[active].accent }}
        />

        {/* Slide area */}
        <div className="relative min-h-[180px] p-5 sm:p-6">
          {slides.map((slide, i) => (
            <div
              key={slide.title}
              className="transition-all duration-500 ease-[var(--motion-ease-standard)]"
              style={{
                position: i === active ? "relative" : "absolute",
                top: i === active ? undefined : 0,
                left: i === active ? undefined : 0,
                right: i === active ? undefined : 0,
                opacity: i === active ? 1 : 0,
                transform:
                  i === active
                    ? "translateX(0)"
                    : `translateX(${direction * (i < active ? -100 : 100)}%)`,
                pointerEvents: i === active ? "auto" : "none",
              }}
            >
              <h2 className="mb-3 font-mono text-[13px] font-bold tracking-wider text-[var(--text-primary)] uppercase sm:text-sm">
                {slide.title}
              </h2>
              <div className="space-y-3 text-[13px] leading-relaxed text-[var(--text-secondary)] sm:text-sm">
                {slide.content}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation bar */}
        <div className="flex items-center justify-between border-t border-[var(--glass-border)] px-3 py-2">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--hover-state)] hover:text-[var(--text-secondary)]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-5 bg-[var(--neu-green)] opacity-80"
                    : "w-1.5 bg-[var(--text-muted)] opacity-30 hover:opacity-50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--hover-state)] hover:text-[var(--text-secondary)]"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
