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

        {/* ── Desktop nav — simple links above the card (matches mobile style) ── */}
        <div className="mb-6 hidden w-full max-w-[400px] flex-col items-center gap-4 sm:flex">
          <p className="text-center text-[12px] leading-relaxed text-[var(--text-muted)]">
            Don&apos;t need an account?{" "}
            <span className="text-[var(--text-secondary)]">
              Our console works without one.
            </span>
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition-all duration-200 hover:border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.97]"
            >
              <Home className="h-3.5 w-3.5" />
              Homepage
            </Link>
            <Link
              href="/console"
              className="inline-flex items-center gap-2 rounded-xl border border-[rgba(48,209,88,0.15)] bg-[rgba(48,209,88,0.06)] px-4 py-2 text-[13px] font-medium text-[var(--neu-green)] transition-all duration-200 hover:border-[rgba(48,209,88,0.25)] hover:bg-[rgba(48,209,88,0.10)] active:scale-[0.97]"
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
      </div>
    </main>
  );
}
