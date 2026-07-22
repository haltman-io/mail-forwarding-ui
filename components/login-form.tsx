"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ArrowRight,
  User,
  KeyRound,
  AlertTriangle,
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
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]"
      >
        <Icon className="size-3.5" />
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
   Main form
   ──────────────────────────────────────────────────────────── */
function LoginFormInner({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { status, signIn } = useAuth();

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
          "alias-console-surface neu-accent-bar relative overflow-hidden rounded-2xl p-8",
          className,
        )}
        {...props}
      >
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">
          <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-[rgb(var(--alias-accent-rgb)_/_0.18)] bg-[rgb(var(--alias-accent-rgb)_/_0.08)]">
            <Loader2 className="size-4 animate-spin text-[var(--neu-green)]" />
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
        "alias-console-surface neu-accent-bar relative overflow-hidden rounded-2xl",
        className,
      )}
      {...props}
    >
      <section className="min-w-0">
        {/* ── Header ── */}
        <div className="flex flex-col gap-7 px-6 pt-6 sm:px-8 sm:pt-8">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-[rgb(var(--alias-accent-rgb)_/_0.18)] bg-[rgb(var(--alias-accent-rgb)_/_0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Lock className="size-[18px] text-[var(--neu-green)]" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[rgba(255,255,255,0.025)] px-3 py-1.5">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-[var(--neu-green)] shadow-[0_0_8px_rgba(48,209,88,0.65)]"
              />
              <span className="font-mono text-[10px] font-medium tracking-[0.14em] text-[var(--text-secondary)] uppercase">
                Admin access
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              Welcome back
            </h1>
            <p className="text-[14px] leading-6 text-[var(--text-secondary)]">
              Enter your credentials to continue
            </p>
          </div>
        </div>

        {/* ── Dashboard disabled alert ── */}
        {!DASHBOARD_ENABLED && (
          <div className="mx-6 mt-5 flex items-center gap-2.5 rounded-xl border border-[rgba(255,69,58,0.30)] bg-[rgba(255,69,58,0.10)] px-4 py-3 sm:mx-8">
            <AlertTriangle className="size-4 shrink-0 text-[#FF453A]" />
            <p className="text-[13px] font-medium leading-5 text-[#FF453A]">
              Dashboard is disabled in this environment.
            </p>
          </div>
        )}

        {/* ── Body ── */}
        <form
          onSubmit={onSubmit}
          className={cn(
            "flex flex-col gap-5 px-6 py-7 sm:px-8 sm:pb-8",
            !DASHBOARD_ENABLED && "pointer-events-none opacity-50",
          )}
          noValidate
        >
          {formError && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2.5 rounded-xl border border-[rgba(255,69,58,0.20)] bg-[rgba(255,69,58,0.06)] px-4 py-3"
            >
              <div className="size-1.5 shrink-0 rounded-full bg-[#FF453A] shadow-[0_0_6px_rgba(255,69,58,0.5)]" />
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
              className="neu-inset h-12 rounded-xl px-4 text-[15px]"
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
                className="neu-inset h-12 rounded-xl px-4 pr-12 text-[15px]"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                disabled={busy || !DASHBOARD_ENABLED}
                onClick={() => setShowPassword((v) => !v)}
                className="ui-focus-ring absolute top-1/2 right-1.5 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-40"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {capsLockOn && !fieldErrors.password && (
              <p className="text-[12px] leading-5 text-[var(--text-secondary)]">
                Caps Lock is on
              </p>
            )}
          </AuthField>

          {/* Submit */}
          <Button
            type="submit"
            disabled={busy || !DASHBOARD_ENABLED}
            className="alias-primary neu-btn-green group h-12 w-full rounded-xl text-[14px] font-semibold"
          >
            {busy ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight
                  data-icon="inline-end"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </>
            )}
          </Button>
        </form>
      </section>
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
