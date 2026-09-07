"use client";

import * as React from "react";
import {
  AlertTriangle,
  Gauge,
  Loader2,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRateLimitsController } from "@/features/dashboard/hooks/use-rate-limits-controller";
import type { RateLimitTargetType } from "@/features/dashboard/types/admin.types";

const TARGET_TYPE_LABELS: Record<RateLimitTargetType, string> = {
  auto: "Auto-detect",
  ip: "IP Address",
  email: "Destination Email",
  handle: "Handle (Local-part)",
  domain: "Domain Target",
};

export function RateLimitResetCard({
  controller,
  showHeader = true,
}: {
  controller?: ReturnType<typeof useRateLimitsController>;
  showHeader?: boolean;
}) {
  const defaultController = useRateLimitsController();
  const c = controller ?? defaultController;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void c.check();
  };

  return (
    <>
      <AdminDataCard className="p-6">
        {showHeader && (
          <div className="mb-5 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                <Gauge className="h-4 w-4 text-[var(--neu-green)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Rate Limit Inspector & Multi-Vector Reset
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Inspect active Redis limit buckets and clear throttled states
                  for any vector.
                </p>
              </div>
            </div>
            {c.lastCheckResult && (
              <Badge
                variant="fancy"
                color={
                  !c.lastCheckResult.redis_configured
                    ? "amber"
                    : !c.lastCheckResult.redis_available
                      ? "red"
                      : "emerald"
                }
              >
                {!c.lastCheckResult.redis_configured
                  ? "Redis disabled"
                  : !c.lastCheckResult.redis_available
                    ? "Redis offline"
                    : "Redis online"}
              </Badge>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Label htmlFor="rate-limit-target" className="text-xs font-medium">
                Target Identifier
              </Label>
              <div className="relative">
                <Input
                  id="rate-limit-target"
                  type="text"
                  placeholder="e.g. 192.168.1.1, user@example.com, myhandle, domain.com"
                  value={c.target}
                  onChange={(e) => c.setTarget(e.target.value)}
                  disabled={c.busy}
                  className="pr-8 font-mono text-xs"
                  autoComplete="off"
                  required
                />
                {c.target && (
                  <button
                    type="button"
                    onClick={() => c.setTarget("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    aria-label="Clear target"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Supports IPv4/IPv6, mailbox addresses, handles, or domain names.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rate-limit-type" className="text-xs font-medium">
                Target Type
              </Label>
              <Select
                value={c.type}
                onValueChange={(v) => c.setType(v as RateLimitTargetType)}
                disabled={c.busy}
              >
                <SelectTrigger id="rate-limit-type" className="h-9 text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect (Recommended)</SelectItem>
                  <SelectItem value="ip">IP Address</SelectItem>
                  <SelectItem value="email">Destination Email</SelectItem>
                  <SelectItem value="handle">Handle</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-[var(--text-muted)]">
                {c.type === "auto"
                  ? "Infers type from format"
                  : `Forced to ${TARGET_TYPE_LABELS[c.type]}`}
              </p>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[var(--text-muted)]">
            <span className="font-mono uppercase tracking-wider text-[10px]">
              Examples:
            </span>
            <button
              type="button"
              onClick={() => c.setTarget("127.0.0.1")}
              className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--neu-green)] hover:text-[var(--text-primary)]"
            >
              127.0.0.1
            </button>
            <button
              type="button"
              onClick={() => c.setTarget("user@example.com")}
              className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--neu-green)] hover:text-[var(--text-primary)]"
            >
              user@example.com
            </button>
            <button
              type="button"
              onClick={() => c.setTarget("example.com")}
              className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)] transition-colors hover:border-[var(--neu-green)] hover:text-[var(--text-primary)]"
            >
              example.com
            </button>
          </div>

          {c.errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{c.errorMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.06)] pt-4">
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={c.busy || !c.target.trim()}
                className="gap-1.5"
              >
                {c.checkBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
                Check Status
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={c.openConfirmReset}
                disabled={c.busy || !c.target.trim()}
                className="gap-1.5"
              >
                {c.resetBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Reset Rate Limits
              </Button>
            </div>

            {(c.target || c.lastCheckResult || c.lastResetResult) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={c.clear}
                disabled={c.busy}
                className="h-8 text-xs text-[var(--text-muted)]"
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </AdminDataCard>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={c.confirmResetOpen}
        onOpenChange={c.setConfirmResetOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              Reset Rate Limits?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to clear all rate limit counters for{" "}
                <span className="font-mono font-medium text-[var(--text-primary)]">
                  {c.target}
                </span>{" "}
                (type:{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {c.type}
                </span>
                )?
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                This will immediately delete all matching Redis rate limit keys
                across single and multi-vector rules (e.g. combined login
                failure buckets).
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={c.resetBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={c.confirmReset}
              disabled={c.resetBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {c.resetBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
