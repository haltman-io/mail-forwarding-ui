"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  claimSmtpSetup,
  describeError,
  getSmtpSetupInfo,
} from "@/features/dashboard/services/smtp-credentials.service";
import type {
  SmtpConnectionParams,
  SmtpSetupInfoResponse,
} from "@/features/dashboard/types/admin.types";

export default function SmtpSetupPage() {
  const [tokenInput, setTokenInput] = React.useState("");
  const [activeToken, setActiveToken] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [setupInfo, setSetupInfo] = React.useState<SmtpSetupInfoResponse | null>(null);
  const [tokenError, setTokenError] = React.useState<string | null>(null);

  // Form state
  const [alias, setAlias] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Result state
  const [claimedSmtp, setClaimedSmtp] = React.useState<SmtpConnectionParams | null>(null);

  // Read token from URL query or hash on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const qToken = params.get("token") || params.get("t");
    if (qToken && qToken.trim()) {
      const clean = qToken.trim();
      setTokenInput(clean);
      setActiveToken(clean);
      return;
    }

    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const hToken = hashParams.get("token") || hash;
      if (hToken && hToken.trim()) {
        const clean = hToken.trim();
        setTokenInput(clean);
        setActiveToken(clean);
      }
    }
  }, []);

  // Validate activeToken whenever it changes
  React.useEffect(() => {
    if (!activeToken) {
      setSetupInfo(null);
      setTokenError(null);
      setLoading(false);
      return;
    }

    let active = true;

    async function validate() {
      setLoading(true);
      setTokenError(null);
      setSubmitError(null);

      try {
        const result = await getSmtpSetupInfo(activeToken!);
        if (!active) return;

        if (!result.ok || !result.data) {
          const err = describeError(
            result,
            "This setup link is invalid or has already been used.",
          );
          setTokenError(err.message);
          return;
        }

        setSetupInfo(result.data);
        if (result.data.allowed_sender_constraint) {
          setAlias(result.data.allowed_sender_constraint);
          const localPart = result.data.allowed_sender_constraint.split("@")[0];
          setUsername(localPart);
        }
      } catch (err) {
        if (!active) return;
        setTokenError(
          err instanceof Error
            ? err.message
            : "Network error. Please try again.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    void validate();

    return () => {
      active = false;
    };
  }, [activeToken]);

  function handleTokenSubmit(e: React.FormEvent) {
    e.preventDefault();
    let raw = tokenInput.trim();
    if (!raw) return;

    const urlMatch = raw.match(/[?&]token=([^&#]+)/);
    if (urlMatch) {
      raw = decodeURIComponent(urlMatch[1]);
    } else {
      const pathMatch = raw.match(/\/smtp-setup\/([^/?#]+)/);
      if (pathMatch) {
        raw = decodeURIComponent(pathMatch[1]);
      } else {
        const apiMatch = raw.match(/\/api\/smtp-setup\/([^/?#]+)/);
        if (apiMatch) {
          raw = decodeURIComponent(apiMatch[1]);
        }
      }
    }

    setTokenInput(raw);
    setActiveToken(raw);
  }

  function copyValue(val: string, label: string) {
    void navigator.clipboard.writeText(val).then(
      () => toast.success(`${label} copied to clipboard`),
      () => toast.error("Could not copy to clipboard"),
    );
  }

  function generateStrongPassword() {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    const array = new Uint8Array(20);
    crypto.getRandomValues(array);
    for (let i = 0; i < 20; i++) {
      pwd += chars[array[i] % chars.length];
    }
    setPassword(pwd);
    setConfirmPassword(pwd);
    setShowPassword(true);
  }

  const checks = React.useMemo(
    () => [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Contains a number", met: /\d/.test(password) },
      {
        label: "Contains uppercase & lowercase",
        met: /[a-z]/.test(password) && /[A-Z]/.test(password),
      },
      {
        label: "Passwords match",
        met: password.length > 0 && password === confirmPassword,
      },
    ],
    [password, confirmPassword],
  );

  const allChecksMet = checks.every((c) => c.met);
  const hasPasswordInput = password.length > 0 || confirmPassword.length > 0;

  async function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeToken) return;

    const activeAlias = alias.trim().toLowerCase();
    const activeUsername = username.trim().toLowerCase();

    if (!activeAlias) {
      setSubmitError("Alias email address is required.");
      return;
    }
    if (!activeUsername) {
      setSubmitError("Username is required.");
      return;
    }
    if (password.length < 8) {
      setSubmitError("Password must have at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await claimSmtpSetup(activeToken, {
        alias: activeAlias,
        username: activeUsername,
        password,
      });

      if (!result.ok || !result.data) {
        const err = describeError(result, "Setup activation failed.");
        setSubmitError(err.message);
        return;
      }

      setClaimedSmtp(result.data.smtp);
      toast.success("SMTP Setup Complete!", {
        description: "Your submission credentials are now active.",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Network error. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 50% 14%, rgb(var(--alias-accent-rgb) / 0.12), transparent 28%),
              radial-gradient(circle at 18% 22%, rgb(var(--alias-accent-rgb) / 0.05), transparent 20%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 18%)
            `,
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--alias-accent-rgb)_/_0.24)] to-transparent" />
        <div className="absolute left-1/2 top-20 h-52 w-52 -translate-x-1/2 rounded-full bg-[rgb(var(--alias-accent-rgb)_/_0.08)] blur-[120px]" />
      </div>

      <div className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="alias-console-surface neu-accent-bar relative w-full max-w-[540px] rounded-2xl">
          {/* Card Header */}
          <div className="border-b border-[rgba(255,255,255,0.06)] px-7 pt-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[rgb(var(--alias-accent-rgb)_/_0.18)] bg-[rgb(var(--alias-accent-rgb)_/_0.08)]">
                <Send className="h-4 w-4 text-[var(--neu-green)]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">
                  SMTP Submission Setup
                </h1>
                <p className="text-[12px] leading-4 text-[var(--text-muted)]">
                  Configure port 587 authentication for mail forwarding
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-7">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--neu-green)]" />
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Validating setup invite…
                </p>
              </div>
            ) : claimedSmtp ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-400">
                      SMTP Credentials Ready
                    </p>
                    <p className="text-xs text-emerald-300/80">
                      Your client authentication has been registered. Save these
                      connection settings.
                    </p>
                  </div>
                </div>

                {/* Connection Parameters Box */}
                <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.3)] p-4 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">SMTP Host:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {claimedSmtp.host}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => copyValue(claimedSmtp.host, "SMTP Host")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-2.5">
                    <span className="text-[var(--text-muted)]">
                      Port & Encryption:
                    </span>
                    <span className="text-[var(--text-primary)]">
                      {claimedSmtp.port} (
                      {claimedSmtp.secure ? "SSL/TLS" : "STARTTLS"})
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-2.5">
                    <span className="text-[var(--text-muted)]">
                      Username / Login:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {claimedSmtp.username}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() =>
                          copyValue(claimedSmtp.username, "Username")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-2.5">
                    <span className="text-[var(--text-muted)]">Password:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-400">
                        {claimedSmtp.password}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() =>
                          copyValue(claimedSmtp.password, "Password")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-2.5">
                    <span className="text-[var(--text-muted)]">
                      From / Sender Address:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--neu-green)]">
                        {claimedSmtp.sender}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() =>
                          copyValue(claimedSmtp.sender, "Sender Address")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    className="alias-primary neu-btn-green w-full h-11 font-mono text-xs font-semibold"
                    onClick={() => {
                      const full = `Host: ${claimedSmtp.host}\nPort: ${claimedSmtp.port}\nSecurity: ${claimedSmtp.secure ? "SSL/TLS" : "STARTTLS"}\nUsername: ${claimedSmtp.username}\nPassword: ${claimedSmtp.password}\nFrom Address: ${claimedSmtp.sender}`;
                      copyValue(full, "Full SMTP configuration");
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All Settings
                  </Button>

                  <Link href="/" className="block">
                    <Button
                      variant="ghost"
                      className="w-full text-xs text-[var(--text-muted)]"
                    >
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            ) : tokenError ? (
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Invalid or Expired Invite
                  </h2>
                  <p className="text-xs leading-relaxed text-[var(--text-muted)] max-w-sm mx-auto">
                    {tokenError}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Setup links are single-use and expire after the configured
                    TTL.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => {
                      setActiveToken(null);
                      setTokenInput("");
                    }}
                  >
                    Enter Another Token
                  </Button>
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="h-9 gap-1.5">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Home
                    </Button>
                  </Link>
                </div>
              </div>
            ) : setupInfo && activeToken ? (
              /* Claim Setup Form */
              <form onSubmit={handleClaimSubmit} className="space-y-5">
                {submitError && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Alias Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="setup-alias" className="text-xs font-medium">
                    Sender Address (Alias)
                  </Label>
                  <Input
                    id="setup-alias"
                    type="email"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value.toLowerCase())}
                    placeholder="myalias@domain.com"
                    disabled={
                      submitting ||
                      Boolean(setupInfo?.allowed_sender_constraint)
                    }
                    required
                    className="font-mono text-xs"
                  />
                  {setupInfo?.allowed_sender_constraint ? (
                    <p className="text-[11px] text-[var(--neu-green)]">
                      🔒 Locked to {setupInfo.allowed_sender_constraint} by
                      invite.
                    </p>
                  ) : (
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Must be an active alias hosted on this forwarding service.
                    </p>
                  )}
                </div>

                {/* Username Input */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="setup-username"
                    className="text-xs font-medium"
                  >
                    Desired Username / Login
                  </Label>
                  <Input
                    id="setup-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="e.g. my-app or user"
                    disabled={submitting}
                    required
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Used to authenticate against port 587. Min 3 characters.
                  </p>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="setup-password"
                      className="text-xs font-medium"
                    >
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="text-[11px] font-medium text-[var(--neu-green)] hover:underline"
                    >
                      Generate Strong
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="setup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      disabled={submitting}
                      required
                      autoComplete="new-password"
                      className="pr-10 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="setup-confirm-password"
                    className="text-xs font-medium"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="setup-confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    disabled={submitting}
                    required
                    autoComplete="new-password"
                    className="font-mono text-xs"
                  />
                </div>

                {/* Requirements Checklist */}
                {hasPasswordInput && (
                  <div className="space-y-1.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.2)] px-4 py-3">
                    {checks.map((c) => (
                      <div key={c.label} className="flex items-center gap-2">
                        {c.met ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        )}
                        <span
                          className={`text-[11px] ${
                            c.met
                              ? "text-emerald-400"
                              : "text-[var(--text-muted)]"
                          }`}
                        >
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    !alias.trim() ||
                    !username.trim() ||
                    !allChecksMet
                  }
                  className="alias-primary neu-btn-green w-full h-11 font-mono text-xs font-semibold tracking-[0.02em]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Activating Credentials…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Activate SMTP Credentials
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* No token active: Token Input Form */
              <form onSubmit={handleTokenSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="token-input" className="text-xs font-medium">
                    Invite Token or Setup Link
                  </Label>
                  <Input
                    id="token-input"
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste token or https://.../smtp-setup?token=..."
                    required
                    autoFocus
                    autoComplete="off"
                    className="font-mono text-xs h-11"
                  />
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Single-use invite tokens are generated by your
                    administrator.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={!tokenInput.trim()}
                  className="alias-primary neu-btn-green w-full h-11 font-mono text-xs font-semibold tracking-[0.02em]"
                >
                  Continue to Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Home
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
