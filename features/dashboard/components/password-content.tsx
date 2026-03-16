"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";
import { changeMyPassword, isUnauthorized, describeError } from "@/features/dashboard/services/users.service";
import { useAdminAuth } from "@/features/dashboard/hooks/use-admin-auth";

function ok(t: string, d?: string) { toast.success(t, { description: d, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> }); }
function fail(t: string, d?: string) { toast.error(t, { description: d, icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> }); }

export function PasswordContent({ token }: { token: string | null }) {
  const { logout } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { fail("No token", "You must be authenticated."); return; }
    if (newPassword.length < 6) { fail("Validation", "New password must have at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { fail("Validation", "Passwords do not match."); return; }

    setBusy(true);
    try {
      const r = await changeMyPassword(token, { current_password: currentPassword, new_password: newPassword });
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
        ok("Password changed", "Please login again.");
        logout("Password updated. Please login again.");
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

        <AdminDataCard>
          <form onSubmit={handleSubmit} className="max-w-md space-y-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={busy} required autoComplete="current-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" disabled={busy} required autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={busy} required autoComplete="new-password" />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </form>
        </AdminDataCard>
      </div>
    </AdminPageLayout>
  );
}
