"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  MailCheck,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authVerifyEmail, describeAuthError } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const [token, setToken] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [verified, setVerified] = React.useState<{ username: string; email: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;

    setBusy(true);
    setError(null);
    try {
      const result = await authVerifyEmail({ token: trimmed });
      if (result.ok && result.data) {
        setVerified({ username: result.data.user.username, email: result.data.user.email });
      } else {
        setError(describeAuthError(result, "Verification failed."));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

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
        <div className="alias-console-surface neu-accent-bar relative w-full max-w-[400px] rounded-2xl">
          {/* Header */}
          <div className="border-b border-[rgba(255,255,255,0.06)] px-7 pt-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                <MailCheck className="h-3.5 w-3.5 text-[var(--neu-green)]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
                  Verify Email
                </h1>
                <p className="text-[11px] leading-4 text-[var(--text-muted)]">
                  Paste the token from your email
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-5 px-7 py-6">
            {verified ? (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(48,209,88,0.20)] bg-[rgba(48,209,88,0.08)]">
                    <CheckCircle2 className="h-5 w-5 text-[var(--neu-green)]" />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <p className="text-[14px] font-medium text-[var(--text-primary)]">
                      Email verified
                    </p>
                    <p className="text-[12px] leading-[1.6] text-[var(--text-muted)]">
                      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                        {verified.email}
                      </span>{" "}
                      has been verified. You can now sign in.
                    </p>
                  </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent" />

                <Link href="/login">
                  <Button className="alias-primary neu-btn-green group h-11 w-full rounded-xl font-mono text-sm font-semibold tracking-[0.02em]">
                    Go to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-[13px] leading-[1.7] text-[var(--text-secondary)]">
                  Check your email for a verification token. Copy and paste it below to activate your account.
                </p>

                {error && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-[rgba(255,69,58,0.20)] bg-[rgba(255,69,58,0.06)] px-4 py-3">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[rgba(255,69,58,0.70)]" />
                    <p className="text-[13px] leading-5 text-[rgba(255,208,204,0.90)]">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="verify-token"
                    className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
                  >
                    <KeyRound className="h-3 w-3" />
                    Verification Token
                  </label>
                  <Input
                    id="verify-token"
                    type="text"
                    placeholder="Paste your token here"
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={busy}
                    className="neu-inset h-11 rounded-xl px-4 font-mono text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!token.trim() || busy}
                  className="alias-primary neu-btn-green group h-11 w-full rounded-xl font-mono text-sm font-semibold tracking-[0.02em]"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verify Email
                    </>
                  )}
                </Button>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent" />

                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 font-mono text-[11px] tracking-[0.06em] text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text-secondary)]"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Sign In
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
