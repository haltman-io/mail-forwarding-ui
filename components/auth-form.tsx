"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  KeyRound,
  Loader2,
  Lock,
  Mail,
  UserPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthProvider, useAuth } from "@/features/auth/hooks/use-auth";

type AuthMode = "login" | "register" | "forgot-password" | "reset-password";

type AuthModeInfo = {
  badge: string;
  kicker: string;
  title: string;
  subtitle: string;
  submitLabel: string;
  busyLabel: string;
  icon: LucideIcon;
};

const MODE_TABS: Array<{
  mode: Exclude<AuthMode, "reset-password">;
  label: string;
}> = [
  { mode: "login", label: "Sign In" },
  { mode: "register", label: "Sign Up" },
  { mode: "forgot-password", label: "Forgot Pass" },
];

function AuthFormInner({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();

  const [mode, setMode] = React.useState<AuthMode>("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [recoveryCode, setRecoveryCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  React.useEffect(() => {
    const prefill = searchParams.get("email");
    if (prefill) setEmail(prefill);
  }, [searchParams]);

  React.useEffect(() => {
    if (auth.status === "authenticated" && auth.user) {
      router.replace("/dashboard");
    }
  }, [auth.status, auth.user, router]);

  function switchMode(next: AuthMode) {
    setMode(next);
    setFeedback(null);
    setPassword("");
    setConfirmPassword("");
    setRecoveryCode("");
    setNewPassword("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setFeedback({ type: "error", message: "Email is required." });
      return;
    }
    if (!password.trim()) {
      setFeedback({ type: "error", message: "Password is required." });
      return;
    }

    setFeedback(null);
    setBusy(true);
    try {
      const result = await auth.login(trimmed, password);
      if (!result.ok) {
        setFeedback({
          type: "error",
          message: result.error ?? "Authentication failed.",
        });
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setFeedback({ type: "error", message: "Email is required." });
      return;
    }
    if (!password.trim()) {
      setFeedback({ type: "error", message: "Password is required." });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    setFeedback(null);
    setBusy(true);
    try {
      const result = await auth.register(trimmed, password);
      if (!result.ok) {
        setFeedback({
          type: "error",
          message: result.error ?? "Registration failed.",
        });
        return;
      }

      switchMode("login");
      setEmail(trimmed);
      setFeedback({ type: "success", message: "Account created. Sign in to continue." });
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setFeedback({ type: "error", message: "Email is required." });
      return;
    }

    setFeedback(null);
    setBusy(true);
    try {
      const result = await auth.forgotPassword(trimmed);
      if (!result.ok) {
        setFeedback({ type: "error", message: result.error ?? "Request failed." });
        return;
      }

      setFeedback({
        type: "success",
        message: "If the email exists, a recovery code has been sent.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!recoveryCode.trim()) {
      setFeedback({ type: "error", message: "Recovery code is required." });
      return;
    }
    if (!newPassword.trim()) {
      setFeedback({ type: "error", message: "New password is required." });
      return;
    }

    setFeedback(null);
    setBusy(true);
    try {
      const result = await auth.resetPassword(recoveryCode.trim(), newPassword);
      if (!result.ok) {
        setFeedback({
          type: "error",
          message: result.error ?? "Password reset failed.",
        });
        return;
      }

      switchMode("login");
      setFeedback({
        type: "success",
        message: "Password updated. Sign in again.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (mode === "login") return handleLogin(e);
    if (mode === "register") return handleRegister(e);
    if (mode === "forgot-password") return handleForgotPassword(e);
    return handleResetPassword(e);
  }

  const modeInfo: Record<AuthMode, AuthModeInfo> = {
    login: {
      badge: "Login",
      kicker: "Welcome back",
      title: "Sign in",
      subtitle: "Enter your email and password to continue.",
      submitLabel: "Sign in",
      busyLabel: "Signing in...",
      icon: Lock,
    },
    register: {
      badge: "Create account",
      kicker: "New account",
      title: "Create account",
      subtitle: "Enter your email and password to create your account.",
      submitLabel: "Create account",
      busyLabel: "Creating account...",
      icon: UserPlus,
    },
    "forgot-password": {
      badge: "Reset password",
      kicker: "Need help?",
      title: "Forgot password",
      subtitle: "Enter your email to get a recovery code.",
      submitLabel: "Send code",
      busyLabel: "Sending...",
      icon: Mail,
    },
    "reset-password": {
      badge: "Reset password",
      kicker: "Almost done",
      title: "Set a new password",
      subtitle: "Enter your code and your new password.",
      submitLabel: "Update password",
      busyLabel: "Updating...",
      icon: KeyRound,
    },
  };

  const currentMode = modeInfo[mode];
  const currentTab = mode === "reset-password" ? "forgot-password" : mode;
  const CurrentIcon = currentMode.icon;

  if (auth.status === "checking") {
    return (
      <div className={cn("w-full", className)} {...props}>
        <div className="ui-glass-panel neu-accent-bar relative overflow-hidden rounded-[30px] border border-[var(--glass-border)] p-6 shadow-[var(--glass-highlight),0_18px_44px_-14px_rgba(0,0,0,0.55)] sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(48,209,88,0.14),transparent_58%)] opacity-70" />
          <div className="relative flex min-h-[440px] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-[rgba(48,209,88,0.14)] bg-[rgba(48,209,88,0.10)] shadow-[0_0_28px_rgba(48,209,88,0.10)]">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--neu-green)]" />
              </div>
              <div className="space-y-1.5">
                <p className="font-mono text-[11px] tracking-[0.24em] text-[var(--text-muted)] uppercase">
                  Checking session
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Preparing the authentication surface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="ui-glass-panel neu-accent-bar relative overflow-hidden rounded-[30px] border border-[var(--glass-border)] p-5 shadow-[var(--glass-highlight),0_18px_44px_-14px_rgba(0,0,0,0.55)] sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(48,209,88,0.16),transparent_60%)] opacity-70" />
        <div className="pointer-events-none absolute inset-x-12 bottom-0 h-24 rounded-full bg-[rgba(48,209,88,0.05)] blur-3xl" />

        <div className="relative flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[18px]">
                <CurrentIcon className="h-3.5 w-3.5 text-[var(--neu-green)] opacity-85" />
                <span className="font-mono text-[11px] font-medium tracking-[0.24em] text-[var(--text-secondary)] uppercase">
                  {currentMode.badge}
                </span>
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[11px] tracking-[0.26em] text-[var(--text-muted)] uppercase">
                  {currentMode.kicker}
                </p>
                <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.35rem]">
                  {currentMode.title}
                </h1>
                <FieldDescription className="max-w-[28rem] text-sm leading-6 text-[var(--text-secondary)] sm:text-[15px]">
                  {currentMode.subtitle}
                </FieldDescription>
              </div>
            </div>

            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-[rgba(48,209,88,0.14)] bg-[rgba(48,209,88,0.10)] shadow-[0_0_28px_rgba(48,209,88,0.10)] sm:flex">
              <CurrentIcon className="h-6 w-6 text-[var(--neu-green)] opacity-90" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {MODE_TABS.map((tab) => {
              const active = currentTab === tab.mode;
              return (
                <button
                  key={tab.mode}
                  type="button"
                  disabled={busy}
                  onClick={() => switchMode(tab.mode)}
                  className={cn(
                    "rounded-[18px] border px-3 py-3 text-center font-mono text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-300",
                    active
                      ? "border-[rgba(48,209,88,0.22)] bg-[rgba(48,209,88,0.12)] text-[var(--neu-green)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(48,209,88,0.05)]"
                      : "border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.16)] text-[var(--text-secondary)] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.22)] hover:border-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)]",
                  )}
                  aria-pressed={active}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              {feedback ? (
                <div
                  className={cn(
                    "rounded-[22px] border px-4 py-3 text-sm leading-6 backdrop-blur-[18px]",
                    feedback.type === "error"
                      ? "border-[rgba(255,69,58,0.24)] bg-[rgba(255,69,58,0.12)] text-[rgba(255,188,183,0.96)]"
                      : "border-[rgba(48,209,88,0.24)] bg-[rgba(48,209,88,0.12)] text-[rgba(205,255,217,0.96)]",
                  )}
                >
                  {feedback.message}
                </div>
              ) : null}

              {mode !== "reset-password" ? (
                <Field className="gap-2.5">
                  <FieldLabel
                    htmlFor="auth-email"
                    className="font-mono text-[11px] tracking-[0.24em] text-[var(--text-muted)] uppercase"
                  >
                    Email
                  </FieldLabel>
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={busy}
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="neu-inset h-12 rounded-[18px] border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.24)] px-4 text-sm"
                  />
                </Field>
              ) : null}

              {mode === "login" || mode === "register" ? (
                <Field className="gap-2.5">
                  <FieldLabel
                    htmlFor="auth-password"
                    className="font-mono text-[11px] tracking-[0.24em] text-[var(--text-muted)] uppercase"
                  >
                    Password
                  </FieldLabel>
                  <Input
                    id="auth-password"
                    type="password"
                    placeholder="........"
                    required
                    disabled={busy}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="neu-inset h-12 rounded-[18px] border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.24)] px-4 text-sm"
                  />
                </Field>
              ) : null}

              {mode === "register" ? (
                <Field className="gap-2.5">
                  <FieldLabel
                    htmlFor="auth-confirm-password"
                    className="font-mono text-[11px] tracking-[0.24em] text-[var(--text-muted)] uppercase"
                  >
                    Confirm password
                  </FieldLabel>
                  <Input
                    id="auth-confirm-password"
                    type="password"
                    placeholder="........"
                    required
                    disabled={busy}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="neu-inset h-12 rounded-[18px] border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.24)] px-4 text-sm"
                  />
                </Field>
              ) : null}

              {mode === "reset-password" ? (
                <>
                  <Field className="gap-2.5">
                    <FieldLabel
                      htmlFor="auth-recovery-code"
                      className="font-mono text-[11px] tracking-[0.24em] text-[var(--text-muted)] uppercase"
                    >
                      Recovery code
                    </FieldLabel>
                    <Input
                      id="auth-recovery-code"
                      type="text"
                      placeholder="6-digit code"
                      required
                      disabled={busy}
                      autoComplete="one-time-code"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      className="neu-inset h-12 rounded-[18px] border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.24)] px-4 text-sm"
                    />
                  </Field>

                  <Field className="gap-2.5">
                    <FieldLabel
                      htmlFor="auth-new-password"
                      className="font-mono text-[11px] tracking-[0.24em] text-[var(--text-muted)] uppercase"
                    >
                      New password
                    </FieldLabel>
                    <Input
                      id="auth-new-password"
                      type="password"
                      placeholder="new secret"
                      required
                      disabled={busy}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="neu-inset h-12 rounded-[18px] border-[rgba(255,255,255,0.04)] bg-[rgba(0,0,0,0.24)] px-4 text-sm"
                    />
                  </Field>
                </>
              ) : null}

              <Field className="gap-3">
                <Button
                  type="submit"
                  disabled={busy}
                  className="alias-primary neu-btn-green h-12 w-full rounded-[18px] font-mono text-sm font-semibold tracking-[0.14em] uppercase"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {currentMode.busyLabel}
                    </>
                  ) : (
                    currentMode.submitLabel
                  )}
                </Button>
              </Field>

            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AuthForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <AuthProvider>
      <AuthFormInner className={className} {...props} />
    </AuthProvider>
  );
}
