"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { DASHBOARD_ENABLED } from "@/lib/dashboard-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authResetPassword, describeAuthError } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const [token, setToken] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedToken = token.trim();
    if (!trimmedToken) { setError("Token is required."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }

    setBusy(true);
    setError(null);
    try {
      const result = await authResetPassword({ token: trimmedToken, new_password: newPassword });
      if (result.ok && result.data) {
        setSuccess(true);
      } else {
        setError(describeAuthError(result, "Reset failed."));
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
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--neu-green)]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
                  Reset Password
                </h1>
                <p className="text-[11px] leading-4 text-[var(--text-muted)]">
                  Enter your reset token and new password
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard disabled alert */}
          {!DASHBOARD_ENABLED && (
            <div className="mx-7 mt-5 flex items-center gap-2.5 rounded-xl border border-[rgba(255,69,58,0.30)] bg-[rgba(255,69,58,0.10)] px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#FF453A]" />
              <p className="text-[13px] font-medium leading-5 text-[#FF453A]">
                Dashboard is disabled in this environment.
              </p>
            </div>
          )}

          {/* Body */}
          <div className={cn("space-y-5 px-7 py-6", !DASHBOARD_ENABLED && "pointer-events-none opacity-50")}>
            {success ? (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(48,209,88,0.20)] bg-[rgba(48,209,88,0.08)]">
                    <CheckCircle2 className="h-5 w-5 text-[var(--neu-green)]" />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <p className="text-[14px] font-medium text-[var(--text-primary)]">
                      Password updated
                    </p>
                    <p className="text-[12px] leading-[1.6] text-[var(--text-muted)]">
                      Your password has been reset and all sessions have been revoked. Please sign in with your new password.
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
                  Paste the reset token from your email and choose a new password.
                </p>

                {error && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-[rgba(255,69,58,0.20)] bg-[rgba(255,69,58,0.06)] px-4 py-3">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[rgba(255,69,58,0.70)]" />
                    <p className="text-[13px] leading-5 text-[rgba(255,208,204,0.90)]">{error}</p>
                  </div>
                )}

                {/* Token */}
                <div className="space-y-2">
                  <label
                    htmlFor="reset-token"
                    className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
                  >
                    <KeyRound className="h-3 w-3" />
                    Reset Token
                  </label>
                  <Input
                    id="reset-token"
                    type="text"
                    placeholder="Paste your reset token"
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={busy || !DASHBOARD_ENABLED}
                    className="neu-inset h-11 rounded-xl px-4 font-mono text-sm"
                  />
                </div>

                {/* New password */}
                <div className="space-y-2">
                  <label
                    htmlFor="new-password"
                    className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
                  >
                    <KeyRound className="h-3 w-3" />
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={busy || !DASHBOARD_ENABLED}
                      className="neu-inset h-11 rounded-xl px-4 pr-11 font-mono text-sm"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((v) => !v)}
                      className="ui-focus-ring absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
                  >
                    <KeyRound className="h-3 w-3" />
                    Confirm Password
                  </label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={busy || !DASHBOARD_ENABLED}
                    className="neu-inset h-11 rounded-xl px-4 font-mono text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={busy || !DASHBOARD_ENABLED}
                  className="alias-primary neu-btn-green group h-11 w-full rounded-xl font-mono text-sm font-semibold tracking-[0.02em]"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Reset Password
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
