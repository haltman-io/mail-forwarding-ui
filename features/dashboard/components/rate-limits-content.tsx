"use client";

import * as React from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Gauge,
  Info,
  Layers,
  Loader2,
  RefreshCw,
  Shield,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";
import { AdminMetricCards } from "@/features/dashboard/components/admin-metric-cards";
import { RateLimitResetCard } from "@/features/dashboard/components/rate-limit-reset-card";
import { useRateLimitsController } from "@/features/dashboard/hooks/use-rate-limits-controller";
import { copyText } from "@/features/dashboard/lib/admin-utils";

const RULE_METADATA: Record<
  string,
  {
    label: string;
    description: string;
    color: "sky" | "indigo" | "emerald" | "amber" | "red";
  }
> = {
  auth_login_fail_fast_identifier_ip: {
    label: "Login Fast Failures",
    description: "Combined Identifier + IP limiter (burst window)",
    color: "red",
  },
  auth_login_fail_heavy_identifier_ip: {
    label: "Login Heavy Failures",
    description: "Combined Identifier + IP limiter (sustained window)",
    color: "red",
  },
  auth_login_fail_identifier: {
    label: "Account Login Failures",
    description: "Per-identifier login failure counter",
    color: "amber",
  },
  auth_password_reset_request_email: {
    label: "Password Reset Requests",
    description: "Password reset request limiter per email",
    color: "amber",
  },
  sub_to: {
    label: "Alias Subscriptions (Destination)",
    description: "Subscription requests per destination mailbox",
    color: "indigo",
  },
  sub_alias: {
    label: "Alias Subscriptions (Alias Address)",
    description: "Subscription requests per specific alias address",
    color: "indigo",
  },
  handle_sub_to: {
    label: "Handle Subscriptions (Destination)",
    description: "Handle subscriptions per destination mailbox",
    color: "sky",
  },
  handle_sub_handle: {
    label: "Handle Subscriptions (Handle)",
    description: "Handle subscription requests per handle name",
    color: "sky",
  },
  handle_unsub_handle: {
    label: "Handle Unsubscriptions",
    description: "Unsubscribe requests for handle",
    color: "sky",
  },
  handle_domain_handle: {
    label: "Handle Domain Operations",
    description: "Domain operations rate limit per handle",
    color: "sky",
  },
  unsub_addr: {
    label: "Unsubscribe Requests",
    description: "Unsubscribe requests per email address",
    color: "amber",
  },
  cred_create_email: {
    label: "Credential Management",
    description: "Credential creation / listing requests per email",
    color: "emerald",
  },
  req_ui_target: {
    label: "UI Domain Verification",
    description: "UI-initiated domain verification rate limit",
    color: "sky",
  },
  req_email_target: {
    label: "Email Domain Verification",
    description: "Email-triggered domain verification rate limit",
    color: "sky",
  },
  checkdns_target: {
    label: "DNS Check Rate Limit",
    description: "Background DNS check rate limiter per domain",
    color: "emerald",
  },
};

function formatTtl(ttlMs: number): string {
  if (ttlMs < 0) return "Expired / No TTL";
  const totalSeconds = Math.ceil(ttlMs / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return remMinutes > 0 ? `${hours}h ${remMinutes}m` : `${hours}h`;
}

export function RateLimitsContent() {
  const c = useRateLimitsController();

  const items = c.lastCheckResult?.items;
  const activeKeys = React.useMemo(() => items ?? [], [items]);
  const hasActiveResult = c.lastCheckResult !== null;
  const hasResetResult = c.lastResetResult !== null && c.lastAction === "reset";

  const totalHits = React.useMemo(() => {
    return activeKeys.reduce((acc, curr) => acc + (curr.count ?? 0), 0);
  }, [activeKeys]);

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        <AdminPageHeader
          icon={<Gauge className="h-4 w-4" />}
          title="Rate Limits"
          description="Inspect active Redis rate limit buckets and perform multi-vector resets."
          actions={
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5"
              onClick={() => void c.check()}
              disabled={c.busy || !c.target.trim()}
            >
              {c.checkBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Re-check
            </Button>
          }
        />

        {/* ── Rate limit target search & reset card ── */}
        <RateLimitResetCard controller={c} showHeader={false} />

        {/* ── Status Metrics Cards (when checked or reset) ── */}
        {hasActiveResult && (
          <AdminMetricCards
            columnsClassName="sm:grid-cols-2 lg:grid-cols-4"
            items={[
              {
                key: "redis_status",
                label: "Redis Status",
                value: !c.lastCheckResult?.redis_configured ? (
                  <span className="text-amber-400">Disabled</span>
                ) : !c.lastCheckResult?.redis_available ? (
                  <span className="text-red-400">Unavailable</span>
                ) : (
                  <span className="text-emerald-400">Connected</span>
                ),
                hint: !c.lastCheckResult?.redis_configured
                  ? "In-memory rate limiter active"
                  : !c.lastCheckResult?.redis_available
                    ? "Redis connection offline"
                    : "Live Redis backend",
                icon: (
                  <Database
                    className={`h-4 w-4 ${
                      !c.lastCheckResult?.redis_configured
                        ? "text-amber-400"
                        : !c.lastCheckResult?.redis_available
                          ? "text-red-400"
                          : "text-emerald-400"
                    }`}
                  />
                ),
                iconWrapClassName: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                  !c.lastCheckResult?.redis_configured
                    ? "border-amber-500/20 bg-amber-500/8"
                    : !c.lastCheckResult?.redis_available
                      ? "border-red-500/20 bg-red-500/8"
                      : "border-emerald-500/20 bg-emerald-500/8"
                }`,
              },
              {
                key: "resolved_type",
                label: "Target Resolution",
                value: (
                  <span className="capitalize">
                    {c.lastCheckResult?.resolved_type}
                  </span>
                ),
                hint: `Requested: ${c.lastCheckResult?.type}`,
                icon: <Activity className="h-4 w-4 text-[var(--neu-green)]" />,
              },
              {
                key: "active_keys",
                label: "Active Buckets",
                value: c.lastCheckResult?.active_keys_count ?? 0,
                hint:
                  (c.lastCheckResult?.active_keys_count ?? 0) === 0
                    ? "No throttle active"
                    : "Matched Redis keys",
                valueClassName: `text-2xl font-semibold tracking-tight ${
                  (c.lastCheckResult?.active_keys_count ?? 0) > 0
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`,
                icon: (
                  <Layers
                    className={`h-4 w-4 ${
                      (c.lastCheckResult?.active_keys_count ?? 0) > 0
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  />
                ),
                iconWrapClassName: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                  (c.lastCheckResult?.active_keys_count ?? 0) > 0
                    ? "border-amber-500/20 bg-amber-500/8"
                    : "border-emerald-500/20 bg-emerald-500/8"
                }`,
              },
              {
                key: "total_hits",
                label: "Recorded Hits",
                value: totalHits,
                hint: "Sum across active buckets",
                icon: <Clock className="h-4 w-4 text-sky-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/8",
              },
            ]}
          />
        )}

        {/* ── Redis Offline / Not Configured Notice ── */}
        {hasActiveResult && !c.lastCheckResult?.redis_available && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            <div className="min-w-0">
              <p className="font-medium">
                {!c.lastCheckResult?.redis_configured
                  ? "Redis rate limiting is not configured"
                  : "Redis is currently unavailable"}
              </p>
              <p className="mt-0.5 text-xs text-amber-300/80 leading-relaxed">
                The server is using local in-memory fallback rate limiting.
                Redis rate limit keys are not populated or scanned when Redis is
                offline.
              </p>
            </div>
          </div>
        )}

        {/* ── Reset Success Banner ── */}
        {hasResetResult && c.lastResetResult && (
          <AdminDataCard className="border-emerald-500/30 bg-emerald-500/5 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-emerald-400">
                    Rate limits successfully reset
                  </h4>
                  <span className="font-mono text-xs text-muted-foreground">
                    Target: {c.lastResetResult.target} (
                    {c.lastResetResult.resolved_type})
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Cleared{" "}
                  <strong className="text-[var(--text-primary)]">
                    {c.lastResetResult.deleted_keys_count}
                  </strong>{" "}
                  Redis rate limit key
                  {c.lastResetResult.deleted_keys_count === 1 ? "" : "s"}.
                </p>

                {c.lastResetResult.cleared_rules.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-[var(--text-muted)]">
                      Cleared rules:
                    </span>
                    {c.lastResetResult.cleared_rules.map((rule) => (
                      <Badge
                        key={rule}
                        variant="fancy"
                        color="emerald"
                        className="font-mono text-[11px]"
                      >
                        {rule}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </AdminDataCard>
        )}

        {/* ── Active Rate Limit Keys Table / List ── */}
        {hasActiveResult && c.lastCheckResult?.redis_available && (
          <AdminDataCard>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.06)] p-5">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Active Rate Limit Keys ({activeKeys.length})
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Active Redis keys throttling{" "}
                    <span className="font-mono text-[var(--text-primary)]">
                      {c.lastCheckResult.target}
                    </span>
                  </p>
                </div>

                {activeKeys.length > 0 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={c.openConfirmReset}
                    disabled={c.busy}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Reset All for Target
                  </Button>
                )}
              </div>

              {activeKeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 mb-3">
                    <ShieldCheck className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-medium text-[var(--text-primary)]">
                    No active rate limits found
                  </h4>
                  <p className="mt-1 max-w-sm text-xs text-[var(--text-muted)]">
                    There are currently no active rate limit buckets or blocks
                    for{" "}
                    <span className="font-mono font-medium text-[var(--text-primary)]">
                      {c.lastCheckResult.target}
                    </span>
                    .
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                        <th className="py-3 pl-5 pr-4">Rule</th>
                        <th className="py-3 px-4">Hits / Count</th>
                        <th className="py-3 px-4">Remaining TTL</th>
                        <th className="py-3 px-4">Redis Key</th>
                        <th className="py-3 pr-5 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                      {activeKeys.map((item) => {
                        const meta = RULE_METADATA[item.rule] ?? {
                          label: item.rule,
                          description: "Redis rate limit bucket",
                          color: "sky" as const,
                        };

                        return (
                          <tr
                            key={item.key}
                            className="transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                          >
                            <td className="py-3.5 pl-5 pr-4 align-top">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="fancy"
                                    color={meta.color}
                                    className="text-[11px]"
                                  >
                                    {meta.label}
                                  </Badge>
                                </div>
                                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                                  {item.rule}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              <span className="font-mono font-semibold tabular-nums text-[13px] text-[var(--text-primary)]">
                                {item.count !== null ? item.count : "—"}
                              </span>
                              <span className="ml-1 text-[11px] text-[var(--text-muted)]">
                                hits
                              </span>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400">
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                <span>{formatTtl(item.ttl_ms)}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              <span
                                className="block max-w-[340px] truncate font-mono text-[11px] text-[var(--text-secondary)]"
                                title={item.key}
                              >
                                {item.key}
                              </span>
                            </td>

                            <td className="py-3.5 pr-5 pl-4 align-top text-right">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                onClick={() =>
                                  copyText(item.key, "Redis key copied")
                                }
                                title="Copy Redis key"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </AdminDataCard>
        )}

        {/* ── Multi-Vector Architecture Information Card ── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminDataCard className="p-5">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                <Shield className="h-4 w-4 text-[var(--neu-green)]" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-primary)]">
                  Multi-Vector Reset Architecture
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">
                  Resetting an identifier scans and purges all correlated
                  rate-limiting vectors simultaneously without wildcard
                  collisions.
                </p>
                <ul className="mt-2 space-y-1 text-[11px] text-[var(--text-muted)]">
                  <li>
                    • <strong className="text-[var(--text-secondary)]">Email:</strong>{" "}
                    Clears subscription limits, credential limits, and all dual-vector
                    login failure buckets across any source IP.
                  </li>
                  <li>
                    • <strong className="text-[var(--text-secondary)]">IP:</strong>{" "}
                    Clears direct IP counters, IPv4-mapped IPv6 variants, and all
                    dual-vector login failure buckets linked to the IP.
                  </li>
                  <li>
                    • <strong className="text-[var(--text-secondary)]">Domain & Handle:</strong>{" "}
                    Clears UI/Email DNS verifications, alias registrations, and
                    handle action buckets.
                  </li>
                </ul>
              </div>
            </div>
          </AdminDataCard>

          <AdminDataCard className="p-5">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/8">
                <Info className="h-4 w-4 text-sky-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-primary)]">
                  Security & Audit Notice
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">
                  Reset operations are protected by administrator authentication
                  and CSRF tokens. All deletions are atomic and targeted strictly
                  to exact matches within the Redis prefix namespace.
                </p>
                <div className="mt-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.2)] p-2.5 font-mono text-[11px] text-[var(--text-muted)]">
                  <code>POST /api/admin/rate-limit/reset</code>
                </div>
              </div>
            </div>
          </AdminDataCard>
        </div>
      </div>
    </AdminPageLayout>
  );
}
