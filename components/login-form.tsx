"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  UserPlus,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminAuthProvider,
  useAdminAuth,
} from "@/features/dashboard/hooks/use-admin-auth";

/* ────────────────────────────────────────────────────────────
   Mode switcher pill
   ──────────────────────────────────────────────────────────── */
type AuthMode = "signin" | "signup";

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: AuthMode;
  onChange: (m: AuthMode) => void;
}) {
  return (
    <div className="neu-tab-track relative flex h-10 w-full rounded-xl p-1">
      <div
        className={cn(
          "neu-tab-pill absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[10px] transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
          mode === "signin" ? "left-1" : "left-[calc(50%+2px)]",
        )}
      />
      <button
        type="button"
        onClick={() => onChange("signin")}
        className={cn(
          "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-[10px] font-mono text-[12px] tracking-[0.08em] uppercase transition-colors duration-200",
          mode === "signin"
            ? "text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
        )}
      >
        <Lock className="h-3 w-3" />
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onChange("signup")}
        className={cn(
          "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-[10px] font-mono text-[12px] tracking-[0.08em] uppercase transition-colors duration-200",
          mode === "signup"
            ? "text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
        )}
      >
        <UserPlus className="h-3 w-3" />
        Sign Up
      </button>
    </div>
  );
}

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
  const [recoveryEmail, setRecoveryEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

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

      {/* ── Body ── */}
      <div className="space-y-5 px-7 py-6">
        {sent ? (
          /* ── Success state ── */
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(48,209,88,0.20)] bg-[rgba(48,209,88,0.08)]">
                <ShieldCheck className="h-5 w-5 text-[var(--neu-green)]" />
              </div>
              <div className="space-y-1.5 text-center">
                <p className="text-[14px] font-medium text-[var(--text-primary)]">
                  Recovery link sent
                </p>
                <p className="text-[12px] leading-[1.6] text-[var(--text-muted)]">
                  If an account exists for{" "}
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                    {recoveryEmail}
                  </span>
                  , you&apos;ll receive an email with instructions to reset your
                  password.
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
              you a secure link to create a new password.
            </p>

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
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className="neu-inset h-11 rounded-xl px-4 font-mono text-sm"
              />
            </AuthField>

            <Button
              type="button"
              onClick={() => setSent(true)}
              disabled={!recoveryEmail.trim()}
              className="alias-primary neu-btn-green group h-11 w-full rounded-xl font-mono text-sm font-semibold tracking-[0.02em]"
            >
              <Send className="h-3.5 w-3.5" />
              Send Recovery Link
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
  const { status, login } = useAdminAuth();

  const [mode, setMode] = React.useState<AuthMode>("signin");
  const [showRecovery, setShowRecovery] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string | null>>({});
  const [capsLockOn, setCapsLockOn] = React.useState(false);

  const isSignUp = mode === "signup";

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard/domains");
    }
  }, [status, router]);

  function handleModeChange(m: AuthMode) {
    setMode(m);
    setFormError(null);
    setFieldErrors({});
    setShowPassword(false);
    setCapsLockOn(false);
  }

  const syncCapsLockState = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      setCapsLockOn(event.getModifierState("CapsLock"));
    },
    [],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: Record<string, string | null> = {};
    const trimmedUsername = username.trim().toLowerCase();

    if (!trimmedUsername) errors.username = "Username is required.";
    if (isSignUp && !email.trim()) errors.email = "Email is required.";
    if (!password.trim()) errors.password = "Password is required.";
    if (isSignUp && password !== confirmPassword)
      errors.confirm = "Passwords do not match.";

    setUsername(trimmedUsername);
    setFieldErrors(errors);
    setFormError(null);

    if (Object.values(errors).some(Boolean)) return;

    setBusy(true);

    try {
      const result = await login(trimmedUsername, password);

      if (!result.ok) {
        setFormError(result.error ?? "Invalid credentials.");
        return;
      }

      router.replace("/dashboard/domains");
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
        /* ════════════════════════════════════════════════════════
           Recovery — full card takeover
           ════════════════════════════════════════════════════════ */
        <RecoveryView onBack={() => setShowRecovery(false)} />
      ) : (
        /* ════════════════════════════════════════════════════════
           Auth — Sign In / Sign Up
           ════════════════════════════════════════════════════════ */
        <>
          {/* ── Header ── */}
          <div className="border-b border-[rgba(255,255,255,0.06)] px-7 pt-6 pb-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                {isSignUp ? (
                  <UserPlus className="h-3.5 w-3.5 text-[var(--neu-green)]" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-[var(--neu-green)]" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
                  {isSignUp ? "Create Account" : "Welcome back"}
                </h1>
                <p className="text-[11px] leading-4 text-[var(--text-muted)]">
                  {isSignUp
                    ? "Fill in your details to get started"
                    : "Enter your credentials to continue"}
                </p>
              </div>
            </div>

            <ModeSwitch mode={mode} onChange={handleModeChange} />
          </div>

          {/* ── Body ── */}
          <form onSubmit={onSubmit} className="space-y-4 px-7 py-6" noValidate>
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

            {/* Username */}
            <AuthField
              id="username"
              label="Username"
              icon={User}
              error={fieldErrors.username}
              errorId="err-username"
            >
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                required
                disabled={busy}
                autoFocus
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={fieldErrors.username ? "true" : "false"}
                aria-describedby={fieldErrors.username ? "err-username" : undefined}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setFieldErrors((p) => ({ ...p, username: null }));
                  setFormError(null);
                }}
                className="neu-inset h-11 rounded-xl px-4 font-mono text-sm"
              />
            </AuthField>

            {/* Email — sign up only */}
            {isSignUp && (
              <AuthField
                id="email"
                label="Email"
                icon={Mail}
                error={fieldErrors.email}
                errorId="err-email"
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  disabled={busy}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="email"
                  aria-invalid={fieldErrors.email ? "true" : "false"}
                  aria-describedby={fieldErrors.email ? "err-email" : undefined}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((p) => ({ ...p, email: null }));
                    setFormError(null);
                  }}
                  className="neu-inset h-11 rounded-xl px-4 font-mono text-sm"
                />
              </AuthField>
            )}

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
                  placeholder={isSignUp ? "Min. 8 characters" : "Enter your password"}
                  required
                  disabled={busy}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  enterKeyHint={isSignUp ? "next" : "go"}
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
                  disabled={busy}
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

            {/* Confirm password — sign up only */}
            {isSignUp && (
              <AuthField
                id="confirm-password"
                label="Confirm Password"
                icon={KeyRound}
                error={fieldErrors.confirm}
                errorId="err-confirm"
              >
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  required
                  disabled={busy}
                  autoComplete="new-password"
                  enterKeyHint="go"
                  aria-invalid={fieldErrors.confirm ? "true" : "false"}
                  aria-describedby={fieldErrors.confirm ? "err-confirm" : undefined}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFieldErrors((p) => ({ ...p, confirm: null }));
                  }}
                  className="neu-inset h-11 rounded-xl px-4 font-mono text-sm"
                />
              </AuthField>
            )}

            {/* Forgot password — sign in only */}
            {!isSignUp && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowRecovery(true)}
                  className="font-mono text-[11px] tracking-[0.06em] text-[var(--neu-green)] opacity-80 transition-opacity duration-200 hover:opacity-100"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={busy}
              className="alias-primary neu-btn-green group h-11 w-full rounded-xl font-mono text-sm font-semibold tracking-[0.02em]"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </Button>

            {/* Sign-up agreement */}
            {isSignUp && (
              <p className="text-center text-[11px] leading-[1.6] text-[var(--text-muted)]">
                By creating an account you agree to our{" "}
                <a
                  href="/terms"
                  className="text-[var(--text-secondary)] underline decoration-[rgba(255,255,255,0.15)] underline-offset-2 transition-colors duration-200 hover:text-[var(--text-primary)]"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-[var(--text-secondary)] underline decoration-[rgba(255,255,255,0.15)] underline-offset-2 transition-colors duration-200 hover:text-[var(--text-primary)]"
                >
                  Privacy Policy
                </a>
              </p>
            )}
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
    <AdminAuthProvider>
      <LoginFormInner className={className} {...props} />
    </AdminAuthProvider>
  );
}
