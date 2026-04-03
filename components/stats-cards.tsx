"use client";

import { Globe, AtSign } from "lucide-react";
import type { Stats } from "@/hooks/use-stats";
import { Skeleton } from "@/components/ui/skeleton";

function AnimatedNumber({ value }: { value: number }) {
  return (
    <span className="tabular-nums tracking-tight">{value.toLocaleString()}</span>
  );
}

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="hidden md:grid grid-cols-2 gap-4">
      {/* Domains card */}
      <div className="stats-card group relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-4 backdrop-blur-[var(--glass-blur)] backdrop-saturate-[1.3] transition-all duration-300 ease-[var(--motion-ease-standard)] hover:scale-[1.01]">
        {/* Subtle gradient accent */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.035] transition-opacity duration-500 group-hover:opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse 80% 60% at 20% 40%, rgb(var(--alias-accent-rgb) / 1), transparent)" }}
        />
        {/* Top accent line */}
        <div className="pointer-events-none absolute top-0 left-[15%] right-[15%] h-px rounded-b bg-gradient-to-r from-transparent via-[rgb(var(--alias-accent-rgb)_/_0.30)] to-transparent opacity-60" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--alias-accent-rgb)_/_0.12)] bg-[rgb(var(--alias-accent-rgb)_/_0.08)] shadow-[0_0_12px_rgb(var(--alias-accent-rgb)_/_0.06)]">
            <Globe className="h-[18px] w-[18px] text-[var(--alias-accent)] opacity-80" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Available Domains
            </p>
            <p className="mt-0.5 text-2xl font-bold leading-none text-[var(--text-primary)]">
              <AnimatedNumber value={stats.domains} />
            </p>
          </div>
        </div>
      </div>

      {/* Aliases card */}
      <div className="stats-card group relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-4 backdrop-blur-[var(--glass-blur)] backdrop-saturate-[1.3] transition-all duration-300 ease-[var(--motion-ease-standard)] hover:scale-[1.01]">
        {/* Subtle gradient accent */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.04] transition-opacity duration-500 group-hover:opacity-[0.08]"
          style={{ background: "radial-gradient(ellipse 80% 60% at 20% 40%, rgb(var(--alias-accent-rgb) / 1), transparent)" }}
        />
        {/* Top accent line */}
        <div className="pointer-events-none absolute top-0 left-[15%] right-[15%] h-px rounded-b bg-gradient-to-r from-transparent via-[rgb(var(--alias-accent-rgb)_/_0.30)] to-transparent opacity-60" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--alias-accent-rgb)_/_0.12)] bg-[var(--neu-green-soft)] shadow-[0_0_12px_var(--neu-green-glow)]">
            <AtSign className="h-[18px] w-[18px] text-[var(--neu-green)] opacity-80" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Active Aliases
            </p>
            <p className="mt-0.5 text-2xl font-bold leading-none text-[var(--text-primary)]">
              <AnimatedNumber value={stats.aliases} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className="hidden md:grid grid-cols-2 gap-4">
      <div className="stats-card group relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-4 backdrop-blur-[var(--glass-blur)] backdrop-saturate-[1.3]">
        <div className="relative flex items-center gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-[var(--surface-pressed)]/80" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-3 w-28 rounded-sm bg-[var(--surface-pressed)]/80" />
            <Skeleton className="h-8 w-16 bg-[var(--surface-pressed)]/80" />
          </div>
        </div>
      </div>

      <div className="stats-card group relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-4 backdrop-blur-[var(--glass-blur)] backdrop-saturate-[1.3]">
        <div className="relative flex items-center gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-[var(--surface-pressed)]/80" />
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-3 w-24 rounded-sm bg-[var(--surface-pressed)]/80" />
            <Skeleton className="h-8 w-16 bg-[var(--surface-pressed)]/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
