import Link from "next/link";
import { AlertTriangle, ShieldCheck } from "lucide-react";

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

        {/* ── Restricted Area Alert ── */}
        <div className="mb-20 flex w-full max-w-[400px] items-start gap-3 rounded-xl border border-[rgba(255,69,58,0.30)] bg-[rgba(255,69,58,0.10)] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF453A]" />
          <p className="text-[13px] font-medium leading-[1.6] text-[#FF453A]">
            This is a restricted area intended for application administrators.
          </p>
        </div>

        <LoginForm className="w-full max-w-[400px]" />

        {/* ── Hacker Invite Link (Button Style) ── */}
        <style>{`
          @keyframes breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); opacity: 1; }
          }
        `}</style>
        <Link
          href="/security"
          className="group mt-20 flex w-full max-w-[400px] items-center gap-2.5 rounded-xl border border-[rgba(48,209,88,0.25)] bg-[rgba(48,209,88,0.03)] px-4 py-3 shadow-[0_0_15px_rgba(48,209,88,0.05)] outline-none transition-all duration-300 hover:bg-[rgba(48,209,88,0.08)] focus-visible:bg-[rgba(48,209,88,0.1)]"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--neu-green)]" />
          <span className="font-mono text-[11px] font-semibold tracking-[0.05em] text-[var(--neu-green)] uppercase">
            New: Hackers Welcome
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span
              className="inline-block font-mono text-[14px] tracking-wider text-white opacity-90 transition-opacity"
              style={{ animation: 'breathe 0.7s infinite ease-in-out' }}
            >
              CLICK ME
            </span>
          </div>
        </Link>
      </div>
    </main>
  );
}
