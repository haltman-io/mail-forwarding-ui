import Link from "next/link";
import { Home, Terminal } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 50% 14%, rgba(48, 209, 88, 0.10), transparent 28%),
              radial-gradient(circle at 18% 22%, rgba(48, 209, 88, 0.05), transparent 20%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 18%)
            `,
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(48,209,88,0.24)] to-transparent" />
        <div className="absolute left-1/2 top-20 h-52 w-52 -translate-x-1/2 rounded-full bg-[rgba(48,209,88,0.08)] blur-[120px]" />
      </div>

      <div className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 py-16 sm:px-6">

        {/* ── Mobile nav — simple links above the card ── */}
        <div className="mb-6 flex w-full max-w-[400px] flex-col items-center gap-4 sm:hidden">
          <p className="text-center text-[12px] leading-relaxed text-[var(--text-muted)]">
            Don&apos;t need an account?{" "}
            <span className="text-[var(--text-secondary)]">
              Our console works without one.
            </span>
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition-all duration-200 active:scale-[0.97] active:bg-[rgba(255,255,255,0.06)]"
            >
              <Home className="h-3.5 w-3.5" />
              Homepage
            </Link>
            <Link
              href="/console"
              className="inline-flex items-center gap-2 rounded-xl border border-[rgba(48,209,88,0.15)] bg-[rgba(48,209,88,0.06)] px-4 py-2 text-[13px] font-medium text-[var(--neu-green)] transition-all duration-200 active:scale-[0.97] active:bg-[rgba(48,209,88,0.10)]"
            >
              <Terminal className="h-3.5 w-3.5" />
              Console
              <span className="rounded bg-[rgba(48,209,88,0.15)] px-1.5 py-0.5 text-[9px] font-semibold leading-none tracking-wide uppercase">
                Free
              </span>
            </Link>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.10)] to-transparent" />
        </div>

        <LoginForm className="w-full max-w-[400px]" />

        {/* ── Desktop nav — glass cards below the card ── */}
        <div className="mt-6 hidden w-full max-w-[400px] flex-col items-center gap-3 sm:flex">
          <p className="w-full text-center text-[12px] leading-relaxed text-[var(--text-muted)]">
            Don&apos;t need an account?{" "}
            <span className="text-[var(--text-secondary)]">
              Our console works without one.
            </span>
          </p>

          <nav className="grid w-full grid-cols-2 gap-3">
            <Link
              href="/"
              className="ui-focus-ring group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3.5 shadow-[var(--glass-highlight),var(--glass-shadow)] backdrop-blur-[var(--glass-blur)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--glass-highlight),0_8px_24px_-4px_rgba(0,0,0,0.35)] active:scale-[0.98]"
            >
              <svg viewBox="0 0 64 64" fill="none" className="h-9 w-9 shrink-0" aria-hidden>
                <rect x="8" y="24" width="48" height="32" rx="4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                <path d="M8 28L32 12L56 28" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="24" y="38" width="16" height="18" rx="2" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                <circle cx="32" cy="46" r="2" fill="rgba(255,255,255,0.20)" />
              </svg>
              <div className="min-w-0">
                <p className="text-[13px] font-medium leading-tight text-[var(--text-primary)]">Homepage</p>
                <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-muted)]">Back to main site</p>
              </div>
              <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-[rgba(255,255,255,0.03)] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            </Link>

            <Link
              href="/console"
              className="ui-focus-ring group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-[rgba(48,209,88,0.12)] bg-[var(--glass-bg)] px-4 py-3.5 shadow-[var(--glass-highlight),var(--glass-shadow)] backdrop-blur-[var(--glass-blur)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(48,209,88,0.20)] hover:shadow-[var(--glass-highlight),0_8px_24px_-4px_rgba(48,209,88,0.12)] active:scale-[0.98]"
            >
              <svg viewBox="0 0 64 64" fill="none" className="h-9 w-9 shrink-0" aria-hidden>
                <rect x="4" y="10" width="56" height="44" rx="6" stroke="rgba(48,209,88,0.35)" strokeWidth="1.5" />
                <path d="M16 28L26 34L16 40" stroke="rgba(48,209,88,0.60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="32" y1="40" x2="46" y2="40" stroke="rgba(48,209,88,0.30)" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="20" x2="60" y2="20" stroke="rgba(48,209,88,0.15)" strokeWidth="1" />
                <circle cx="10" cy="15" r="1.5" fill="rgba(255,69,58,0.50)" />
                <circle cx="16" cy="15" r="1.5" fill="rgba(255,170,58,0.50)" />
                <circle cx="22" cy="15" r="1.5" fill="rgba(48,209,88,0.50)" />
              </svg>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-medium leading-tight text-[var(--text-primary)]">Console</p>
                  <span className="rounded-md bg-[rgba(48,209,88,0.12)] px-1.5 py-px text-[9px] font-semibold tracking-wide text-[var(--neu-green)] uppercase">Free</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-muted)]">No account required</p>
              </div>
              <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-[rgba(48,209,88,0.04)] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </nav>
        </div>
      </div>
    </main>
  );
}
