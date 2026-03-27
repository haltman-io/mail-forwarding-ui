"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Mail,
  User,
  KeyRound,
  AlertTriangle,
  Send,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { DASHBOARD_ENABLED } from "@/lib/dashboard-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AuthProvider,
  useAuth,
} from "@/features/auth/hooks/use-auth";
import { describeAuthError, isRateLimited } from "@/lib/auth-client";

/* ────────────────────────────────────────────────────────────
   Reusable input row
   ──────────────────────────────────────────────────────────── */
function AuthField({
  id,
  label,
  icon: Icon,
  error,
  errorId,
  children,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  error?: string | null;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
      >
        <Icon className="h-3 w-3" />
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="text-[13px] leading-5 text-[var(--destructive)]">
          {error}
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Password Recovery — full card takeover
   ──────────────────────────────────────────────────────────── */
function RecoveryView({ onBack }: { onBack: () => void }) {
  const { forgotPassword } = useAuth();
  const [recoveryEmail, setRecoveryEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSend() {
    const email = recoveryEmail.trim().toLowerCase();
    if (!email) return;
    setBusy(true);
    setError(null);
    try {
      const result = await forgotPassword(email);
      if (result.ok) {
        setSent(true);
      } else {
        setError(describeAuthError(result, "Failed to send recovery email."));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-7 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="ui-focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)] transition-all duration-200 hover:border-[rgba(255,255,255,0.10)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
              Password Recovery
            </h1>
            <p className="text-[11px] leading-4 text-[var(--text-muted)]">
              Reset your password via email
            </p>
          </div>
        </div>
      </div>

      {/* ── Dashboard disabled alert ── */}
      {!DASHBOARD_ENABLED && (
        <div className="mx-7 mt-5 flex items-center gap-2.5 rounded-xl border border-[rgba(255,69,58,0.30)] bg-[rgba(255,69,58,0.10)] px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#FF453A]" />
          <p className="text-[13px] font-medium leading-5 text-[#FF453A]">
            Dashboard is disabled in this environment.
          </p>
        </div>
      )}

      {/* ── Body ── */}
      <div className={cn("space-y-5 px-7 py-6", !DASHBOARD_ENABLED && "pointer-events-none opacity-50")}>
        {sent ? (
          /* ── Success state ── */
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(48,209,88,0.20)] bg-[rgba(48,209,88,0.08)]">
                <ShieldCheck className="h-5 w-5 text-[var(--neu-green)]" />
              </div>
              <div className="space-y-1.5 text-center">
                <p className="text-[14px] font-medium text-[var(--text-primary)]">
                  Recovery instructions sent
                </p>
                <p className="text-[12px] leading-[1.6] text-[var(--text-muted)]">
                  If an account exists for{" "}
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                    {recoveryEmail}
                  </span>
                  , you&apos;ll receive an email with a reset token. Paste it on the{" "}
                  <a href="/reset-password" className="text-[var(--neu-green)] underline underline-offset-2">
                    reset password
                  </a>{" "}
                  page.
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent" />

            <Button
              type="button"
              onClick={onBack}
              className="alias-primary neu-btn-green group h-11 w-full rounded-xl font-mono text-sm font-semibold tracking-[0.02em]"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Back to Sign In
            </Button>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="space-y-5">
            <p className="text-[13px] leading-[1.7] text-[var(--text-secondary)]">
              Enter the email address linked to your account. We&apos;ll send
              you a token to create a new password.
            </p>

            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-[rgba(255,69,58,0.20)] bg-[rgba(255,69,58,0.06)] px-4 py-3">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF453A] shadow-[0_0_6px_rgba(255,69,58,0.5)]" />
                <p className="text-[13px] leading-5 text-[rgba(255,208,204,0.90)]">{error}</p>
              </div>
            )}

            <AuthField id="recovery-email" label="Email Address" icon={Mail}>
              <Input
                id="recovery-email"
                type="email"
                placeholder="you@example.com"
                autoFocus
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
                disabled={!DASHBOARD_ENABLED}
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="neu-inset h-11 rounded-xl px-4 font-mono text-sm"
              />
            </AuthField>

            <Button
              type="button"
              onClick={handleSend}
              disabled={!recoveryEmail.trim() || busy || !DASHBOARD_ENABLED}
              className="alias-primary neu-btn-green group h-11 w-full rounded-xl font-mono text-sm font-semibold tracking-[0.02em]"
            >
              {busy ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send Recovery Token
                </>
              )}
            </Button>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.06)] to-transparent" />

            <button
              type="button"
              onClick={onBack}
              className="flex w-full items-center justify-center gap-2 font-mono text-[11px] tracking-[0.06em] text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text-secondary)]"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Sign In
            </button>
          </div>
        )}

        {/* ── Disclaimer — always visible ── */}
        <div className="rounded-xl border border-[rgba(255,170,58,0.12)] bg-[rgba(255,170,58,0.04)] px-4 py-3.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-[rgba(255,170,58,0.70)]" />
            <div className="space-y-1">
              <p className="text-[11px] font-medium leading-4 text-[rgba(255,255,255,0.55)]">
                Deleted accounts cannot be recovered
              </p>
              <p className="text-[11px] leading-[1.6] text-[rgba(255,255,255,0.38)]">
                Once an account is deleted, all associated data is permanently
                erased from our systems. We do not retain backups or copies of
                deleted accounts and cannot restore them under any
                circumstances.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-[rgba(255,255,255,0.06)] px-7 py-4">
        <div className="flex items-center justify-center gap-4">
          <a
            href="/privacy"
            className="font-mono text-[10px] tracking-[0.08em] text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text-secondary)]"
          >
            Privacy Policy
          </a>
          <div className="h-3 w-px bg-[rgba(255,255,255,0.08)]" />
          <a
            href="/support"
            className="font-mono text-[10px] tracking-[0.08em] text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text-secondary)]"
          >
            Contact Support
          </a>
        </div>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Main form
   ──────────────────────────────────────────────────────────── */
function LoginFormInner({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { status, signIn } = useAuth();

  const [showRecovery, setShowRecovery] = React.useState(false);
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string | null>>({});
  const [capsLockOn, setCapsLockOn] = React.useState(false);

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard/admin/domains");
    }
  }, [status, router]);

  const syncCapsLockState = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      setCapsLockOn(event.getModifierState("CapsLock"));
    },
    [],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: Record<string, string | null> = {};

    const trimmedIdentifier = identifier.trim().toLowerCase();
    if (!trimmedIdentifier) errors.identifier = "Email or username is required.";
    if (!password) errors.password = "Password is required.";

    setIdentifier(trimmedIdentifier);
    setFieldErrors(errors);
    setFormError(null);
    if (Object.values(errors).some(Boolean)) return;

    setBusy(true);
    try {
      const result = await signIn(trimmedIdentifier, password);
      if (result.ok) {
        router.replace("/dashboard/admin/domains");
      } else {
        if (isRateLimited(result)) {
          setFormError(describeAuthError(result, "Sign in failed."));
        } else {
          setFormError(describeAuthError(result, "Invalid credentials."));
        }
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  /* ── Loading ── */
  if (status === "checking") {
    return (
      <div
        className={cn(
          "alias-console-surface neu-accent-bar relative rounded-2xl p-8",
          className,
        )}
        {...props}
      >
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--neu-green)]" />
          </div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)] uppercase">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "alias-console-surface neu-accent-bar relative rounded-2xl",
        className,
      )}
      {...props}
    >
      {showRecovery ? (
        <RecoveryView onBack={() => setShowRecovery(false)} />
      ) : (
        <>
          {/* ── Header ── */}
          <div className="border-b border-[rgba(255,255,255,0.06)] px-7 pt-6 pb-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                <Lock className="h-3.5 w-3.5 text-[var(--neu-green)]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
                  Welcome back
                </h1>
                <p className="text-[11px] leading-4 text-[var(--text-muted)]">
                  Enter your credentials to continue
                </p>
              </div>
            </div>
          </div>

          {/* ── Dashboard disabled alert ── */}
          {!DASHBOARD_ENABLED && (
            <div className="mx-7 mt-5 flex items-center gap-2.5 rounded-xl border border-[rgba(255,69,58,0.30)] bg-[rgba(255,69,58,0.10)] px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#FF453A]" />
              <p className="text-[13px] font-medium leading-5 text-[#FF453A]">
                Dashboard is disabled in this environment.
              </p>
            </div>
          )}

          {/* ── Body ── */}
          <form onSubmit={onSubmit} className={cn("space-y-4 px-7 py-6", !DASHBOARD_ENABLED && "pointer-events-none opacity-50")} noValidate>
            {formError && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-center gap-2.5 rounded-xl border border-[rgba(255,69,58,0.20)] bg-[rgba(255,69,58,0.06)] px-4 py-3"
              >
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF453A] shadow-[0_0_6px_rgba(255,69,58,0.5)]" />
                <p className="text-[13px] leading-5 text-[rgba(255,208,204,0.90)]">
                  {formError}
                </p>
              </div>
            )}

            {/* Identifier (sign-in) */}
            <AuthField
              id="identifier"
              label="Email or Username"
              icon={User}
              error={fieldErrors.identifier}
              errorId="err-identifier"
            >
              <Input
                id="identifier"
                type="text"
                placeholder="you@example.com"
                required
                disabled={busy || !DASHBOARD_ENABLED}
                autoFocus
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={fieldErrors.identifier ? "true" : "false"}
                aria-describedby={fieldErrors.identifier ? "err-identifier" : undefined}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setFieldErrors((p) => ({ ...p, identifier: null }));
                  setFormError(null);
                }}
                className="neu-inset h-11 rounded-xl px-4 font-mono text-sm"
              />
            </AuthField>

            {/* Password */}
            <AuthField
              id="password"
              label="Password"
              icon={KeyRound}
              error={fieldErrors.password}
              errorId="err-password"
            >
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  disabled={busy || !DASHBOARD_ENABLED}
                  autoComplete="current-password"
                  enterKeyHint="go"
                  aria-invalid={fieldErrors.password ? "true" : "false"}
                  aria-describedby={fieldErrors.password ? "err-password" : undefined}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((p) => ({ ...p, password: null }));
                    setFormError(null);
                  }}
                  onKeyDown={syncCapsLockState}
                  onKeyUp={syncCapsLockState}
                  onBlur={() => setCapsLockOn(false)}
                  className="neu-inset h-11 rounded-xl px-4 pr-11 font-mono text-sm"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  disabled={busy || !DASHBOARD_ENABLED}
                  onClick={() => setShowPassword((v) => !v)}
                  className="ui-focus-ring absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-40"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {capsLockOn && !fieldErrors.password && (
                <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
                  Caps Lock is on
                </p>
              )}
            </AuthField>



            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                className="font-mono text-[11px] tracking-[0.06em] text-[var(--neu-green)] opacity-80 transition-opacity duration-200 hover:opacity-100"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={busy || !DASHBOARD_ENABLED}
              className="alias-primary neu-btn-green group h-11 w-full rounded-xl font-mono text-sm font-semibold tracking-[0.02em]"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </Button>

          </form>

          {/* ── Footer ── */}
          <div className="border-t border-[rgba(255,255,255,0.06)] px-7 py-4">
            <div className="flex items-center justify-between">
              <a
                href="/privacy"
                className="font-mono text-[10px] tracking-[0.08em] text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text-secondary)]"
              >
                Privacy Policy
              </a>
              <div className="h-3 w-px bg-[rgba(255,255,255,0.08)]" />
              <a
                href="/terms"
                className="font-mono text-[10px] tracking-[0.08em] text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text-secondary)]"
              >
                Terms of Service
              </a>
              <div className="h-3 w-px bg-[rgba(255,255,255,0.08)]" />
              <a
                href="/support"
                className="font-mono text-[10px] tracking-[0.08em] text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text-secondary)]"
              >
                Need help?
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <AuthProvider>
      <LoginFormInner className={className} {...props} />
    </AuthProvider>
  );
}
