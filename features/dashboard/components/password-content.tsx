"use client";

import * as React from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Info,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";
import { changeMyPassword, isUnauthorized, describeError } from "@/features/dashboard/services/users.service";
import { useAuth } from "@/features/auth/hooks/use-auth";

function ok(t: string, d?: string) { toast.success(t, { description: d, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> }); }
function fail(t: string, d?: string) { toast.error(t, { description: d, icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> }); }

type Req = { label: string; met: boolean };

function usePasswordChecks(newPassword: string, confirmPassword: string) {
  return React.useMemo<Req[]>(() => [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "Contains a number", met: /\d/.test(newPassword) },
    { label: "Contains uppercase & lowercase", met: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
    { label: "Passwords match", met: newPassword.length > 0 && newPassword === confirmPassword },
  ], [newPassword, confirmPassword]);
}

export function PasswordContent() {
  const { signOut } = useAuth();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const checks = usePasswordChecks(newPassword, confirmPassword);
  const allMet = checks.every((c) => c.met);
  const hasInput = newPassword.length > 0 || confirmPassword.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) { fail("Validation", "New password must have at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { fail("Validation", "Passwords do not match."); return; }

    setBusy(true);
    try {
      const r = await changeMyPassword({ current_password: currentPassword, new_password: newPassword });
      if (isUnauthorized(r)) { fail("Unauthorized"); return; }
      if (!r.ok) {
        const err = describeError(r, "Password change failed.");
        fail(err.isRateLimited ? "Rate limited" : "Error", err.message);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (r.data?.reauth_required) {
        ok("Password changed", "Please sign in again.");
        await signOut();
      } else {
        ok("Password changed", "Your password has been updated.");
      }
    } catch (e) {
      fail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={<LockKeyhole className="h-4 w-4" />}
          title="My Password"
          description="Change the password for your administrator account."
        />

        {/* ── info cards ── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminDataCard className="p-5">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                <ShieldCheck className="h-4 w-4 text-[var(--neu-green)]" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-primary)]">Security</p>
                <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                  After changing your password, all other sessions will be revoked and you&apos;ll need to sign in again.
                </p>
              </div>
            </div>
          </AdminDataCard>

          <AdminDataCard className="p-5">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/8">
                <Info className="h-4 w-4 text-sky-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-primary)]">Requirements</p>
                <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                  Use a strong password with at least 8 characters, mixed case, and numbers.
                </p>
              </div>
            </div>
          </AdminDataCard>
        </div>

        {/* ── form ── */}
        <AdminDataCard>
          <form onSubmit={handleSubmit} className="max-w-md space-y-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={busy}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                disabled={busy}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={busy}
                required
                autoComplete="new-password"
              />
            </div>

            {/* ── requirements checklist ── */}
            {hasInput && (
              <div className="space-y-1.5 rounded-xl border border-[rgba(255,255,255,0.04)] px-4 py-3">
                {checks.map((c) => (
                  <div key={c.label} className="flex items-center gap-2">
                    {c.met ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    )}
                    <span
                      className={`text-[12px] ${c.met ? "text-emerald-400" : "text-[var(--text-muted)]"}`}
                    >
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" disabled={busy || (hasInput && !allMet)} className="w-full">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </form>
        </AdminDataCard>
      </div>
    </AdminPageLayout>
  );
}
