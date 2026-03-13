"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AuthProvider, useAuth } from "@/features/auth/hooks/use-auth";
import styles from "@/components/auth-form-copy.module.css";

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
  { mode: "login", label: "Sign in" },
  { mode: "register", label: "Create" },
  { mode: "forgot-password", label: "Recover" },
];

function AuthFormCopyInner({ className, ...props }: React.ComponentProps<"div">) {
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

  const [hostLabel, setHostLabel] = React.useState("haltman.io");
  React.useEffect(() => {
    if (window.location.host) setHostLabel(window.location.host);
  }, []);

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
      setFeedback({ type: "success", message: "Account created! Please sign in." });
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
        message:
          "If the account exists, a recovery code was sent to the email address.",
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
        message: "Password updated. Please log in again.",
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
      badge: "Auth session",
      kicker: "Secure operator access",
      title: hostLabel,
      subtitle:
        "Sign in to manage aliases, domains, API tokens, and the admin surface.",
      submitLabel: "Sign in",
      busyLabel: "Signing in...",
      icon: Lock,
    },
    register: {
      badge: "New operator",
      kicker: "Create your account",
      title: "Create account",
      subtitle:
        "Register a new operator profile with the same visual language as the landing page.",
      submitLabel: "Create account",
      busyLabel: "Creating account...",
      icon: UserPlus,
    },
    "forgot-password": {
      badge: "Recovery route",
      kicker: "Request a reset code",
      title: "Forgot password",
      subtitle:
        "Send a recovery code to your inbox and continue the reset flow from here.",
      submitLabel: "Send recovery code",
      busyLabel: "Sending...",
      icon: Mail,
    },
    "reset-password": {
      badge: "Code-based reset",
      kicker: "Finish recovery",
      title: "Reset password",
      subtitle:
        "Enter the recovery code and define a new password inside the same auth shell.",
      submitLabel: "Reset password",
      busyLabel: "Resetting...",
      icon: KeyRound,
    },
  };

  const quickFacts = [
    {
      icon: ShieldCheck,
      label: "Surface",
      value: "Glass",
    },
    {
      icon: Fingerprint,
      label: "Style",
      value: "Neumorphic",
    },
    {
      icon: KeyRound,
      label: "Recovery",
      value: mode === "reset-password" ? "Code active" : "Ready",
    },
  ] as const;

  const currentMode = modeInfo[mode];
  const currentTab = mode === "reset-password" ? "forgot-password" : mode;
  const CurrentIcon = currentMode.icon;

  if (auth.status === "checking") {
    return (
      <div className={cn(styles.snapshotRoot, "w-full", className)} {...props}>
        <div className={cn(styles.panel, styles.accentBar, "relative overflow-hidden rounded-[30px] p-6 sm:p-7")}>
          <div className="relative flex min-h-[440px] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className={`${styles.iconPlate} flex h-14 w-14 items-center justify-center rounded-[20px]`}>
                <Loader2 className="h-6 w-6 animate-spin text-[#30d158]" />
              </div>
              <div className="space-y-1.5">
                <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-[rgba(255,255,255,0.3)]">
                  Checking session
                </p>
                <p className="text-sm text-[rgba(255,255,255,0.5)]">
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
    <div className={cn(styles.snapshotRoot, "w-full", className)} {...props}>
      <div className={cn(styles.panel, styles.accentBar, "relative overflow-hidden rounded-[30px] p-5 sm:p-6")}>
        <div className={`${styles.panelGlow} pointer-events-none absolute inset-x-12 bottom-0 h-24 rounded-full`} />

        <div className="relative flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className={`${styles.badge} inline-flex items-center gap-2 rounded-full px-3 py-1.5`}>
                <CurrentIcon className="h-3.5 w-3.5 text-[#30d158] opacity-85" />
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[rgba(255,255,255,0.5)]">
                  {currentMode.badge}
                </span>
              </div>

              <div className="space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[rgba(255,255,255,0.3)]">
                  {currentMode.kicker}
                </p>
                <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.04em] text-[rgba(255,255,255,0.87)] sm:text-[2.35rem]">
                  {currentMode.title}
                </h1>
                <p className="max-w-[28rem] text-sm leading-6 text-[rgba(255,255,255,0.5)] sm:text-[15px]">
                  {currentMode.subtitle}
                </p>
              </div>
            </div>

            <div className={`${styles.iconPlate} hidden h-14 w-14 shrink-0 items-center justify-center rounded-[20px] sm:flex`}>
              <CurrentIcon className="h-6 w-6 text-[#30d158] opacity-90" />
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
                  className={cn(styles.tab, active ? styles.tabActive : styles.tabIdle)}
                  aria-pressed={active}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex w-full flex-col gap-5">
              {feedback ? (
                <div
                  className={cn(
                    styles.statusBase,
                    feedback.type === "error" ? styles.statusError : styles.statusSuccess,
                  )}
                >
                  {feedback.message}
                </div>
              ) : null}

              {mode !== "reset-password" ? (
                <SnapshotField id="auth-copy-email" label="Email">
                  <input
                    id="auth-copy-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={busy}
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                </SnapshotField>
              ) : null}

              {mode === "login" || mode === "register" ? (
                <SnapshotField id="auth-copy-password" label="Password">
                  <input
                    id="auth-copy-password"
                    type="password"
                    placeholder="........"
                    required
                    disabled={busy}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                  />
                </SnapshotField>
              ) : null}

              {mode === "register" ? (
                <SnapshotField id="auth-copy-confirm-password" label="Confirm password">
                  <input
                    id="auth-copy-confirm-password"
                    type="password"
                    placeholder="........"
                    required
                    disabled={busy}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                  />
                </SnapshotField>
              ) : null}

              {mode === "reset-password" ? (
                <>
                  <SnapshotField id="auth-copy-recovery-code" label="Recovery code">
                    <input
                      id="auth-copy-recovery-code"
                      type="text"
                      placeholder="6-digit code"
                      required
                      disabled={busy}
                      autoComplete="one-time-code"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      className={styles.input}
                    />
                  </SnapshotField>

                  <SnapshotField id="auth-copy-new-password" label="New password">
                    <input
                      id="auth-copy-new-password"
                      type="password"
                      placeholder="new secret"
                      required
                      disabled={busy}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.input}
                    />
                  </SnapshotField>
                </>
              ) : null}

              <div className="flex w-full flex-col gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className={cn(
                    styles.primaryButton,
                    "flex h-12 w-full items-center justify-center gap-2 rounded-[18px] font-mono text-sm font-semibold uppercase tracking-[0.14em]",
                  )}
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {currentMode.busyLabel}
                    </>
                  ) : (
                    currentMode.submitLabel
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {mode === "login" ? (
                  <>
                    <AuthCopyActionButton
                      disabled={busy}
                      onClick={() => switchMode("register")}
                    >
                      Create account
                    </AuthCopyActionButton>
                    <AuthCopyActionButton
                      disabled={busy}
                      onClick={() => switchMode("forgot-password")}
                    >
                      Forgot password
                    </AuthCopyActionButton>
                  </>
                ) : null}

                {mode === "register" ? (
                  <AuthCopyActionButton disabled={busy} onClick={() => switchMode("login")}>
                    Back to sign in
                  </AuthCopyActionButton>
                ) : null}

                {mode === "forgot-password" ? (
                  <>
                    <AuthCopyActionButton
                      disabled={busy}
                      onClick={() => switchMode("reset-password")}
                    >
                      I have a recovery code
                    </AuthCopyActionButton>
                    <AuthCopyActionButton disabled={busy} onClick={() => switchMode("login")}>
                      Back to sign in
                    </AuthCopyActionButton>
                  </>
                ) : null}

                {mode === "reset-password" ? (
                  <>
                    <AuthCopyActionButton disabled={busy} onClick={() => switchMode("login")}>
                      Back to sign in
                    </AuthCopyActionButton>
                    <AuthCopyActionButton
                      disabled={busy}
                      onClick={() => switchMode("forgot-password")}
                    >
                      Request another code
                    </AuthCopyActionButton>
                  </>
                ) : null}
              </div>
            </div>
          </form>

          <div className="grid gap-3 sm:grid-cols-3">
            {quickFacts.map(({ icon: Icon, label, value }) => (
              <div key={label} className={`${styles.factCard} px-4 py-3.5`}>
                <div className="relative space-y-2">
                  <div className={`${styles.miniPlate} flex h-9 w-9 items-center justify-center rounded-2xl`}>
                    <Icon className="h-4 w-4 text-[#30d158] opacity-80" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.3)]">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-[rgba(255,255,255,0.87)]">
                      {value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SnapshotField({
  children,
  id,
  label,
}: {
  children: React.ReactNode;
  id: string;
  label: string;
}) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      {children}
    </div>
  );
}

function AuthCopyActionButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        styles.secondaryButton,
        "inline-flex items-center justify-center rounded-full px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] disabled:pointer-events-none disabled:opacity-40",
      )}
    >
      {children}
    </button>
  );
}

export function AuthFormCopy({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <AuthProvider>
      <AuthFormCopyInner className={className} {...props} />
    </AuthProvider>
  );
}
