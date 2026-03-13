import { Suspense } from "react";

import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-10 md:px-10">
      <div className="relative w-full max-w-[460px]">
        <div className="pointer-events-none absolute inset-x-8 top-4 h-24 rounded-full bg-[rgba(48,209,88,0.12)] blur-3xl" />
        <Suspense fallback={<LoginFormFallback />}>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
}

function LoginFormFallback() {
  return (
    <div className="ui-glass-panel neu-accent-bar relative overflow-hidden rounded-[30px] border border-[var(--glass-border)] p-6 shadow-[var(--glass-highlight),0_18px_44px_-14px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(48,209,88,0.14),transparent_58%)] opacity-70" />
      <div className="relative space-y-5">
        <div className="h-6 w-28 rounded-full bg-[rgba(255,255,255,0.07)]" />
        <div className="space-y-3">
          <div className="h-10 w-48 rounded-2xl bg-[rgba(255,255,255,0.06)]" />
          <div className="h-5 w-full max-w-[18rem] rounded-lg bg-[rgba(255,255,255,0.04)]" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-11 rounded-2xl bg-[rgba(255,255,255,0.04)]" />
          <div className="h-11 rounded-2xl bg-[rgba(255,255,255,0.04)]" />
          <div className="h-11 rounded-2xl bg-[rgba(255,255,255,0.04)]" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-[rgba(255,255,255,0.06)]" />
            <div className="h-12 rounded-[18px] bg-[rgba(0,0,0,0.24)]" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-[rgba(255,255,255,0.06)]" />
            <div className="h-12 rounded-[18px] bg-[rgba(0,0,0,0.24)]" />
          </div>
          <div className="h-12 rounded-[18px] bg-[rgba(48,209,88,0.18)]" />
        </div>
      </div>
    </div>
  );
}
