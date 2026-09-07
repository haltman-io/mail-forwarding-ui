"use client";

import * as React from "react";
import Link from "next/link";
import {
  AtSign,
  Ban,
  Gauge,
  Globe2,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Mail,
  Radar,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import { AdminMetricCards, type MetricCardItem } from "@/features/dashboard/components/admin-metric-cards";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";
import { fetchDomains } from "@/features/dashboard/services/domains.service";
import { fetchAliases } from "@/features/dashboard/services/aliases.service";
import { fetchHandles } from "@/features/dashboard/services/handles.service";
import { fetchUsers } from "@/features/dashboard/services/users.service";
import { fetchBans } from "@/features/dashboard/services/bans.service";
import { fetchApiTokens } from "@/features/dashboard/services/api-tokens.service";
import { fetchDnsRequests } from "@/features/dashboard/services/dns-requests.service";
import { fetchSmtpCredentials } from "@/features/dashboard/services/smtp-credentials.service";

type MetricKey =
  | "domains"
  | "aliases"
  | "handles"
  | "smtp"
  | "users"
  | "bans"
  | "tokens"
  | "dns";

type MetricState = {
  total: number | null;
  error: string | null;
};

type TotalsState = Record<MetricKey, MetricState>;

const EMPTY_METRIC: MetricState = { total: null, error: null };

const INITIAL_TOTALS: TotalsState = {
  domains: { ...EMPTY_METRIC },
  aliases: { ...EMPTY_METRIC },
  handles: { ...EMPTY_METRIC },
  smtp: { ...EMPTY_METRIC },
  users: { ...EMPTY_METRIC },
  bans: { ...EMPTY_METRIC },
  tokens: { ...EMPTY_METRIC },
  dns: { ...EMPTY_METRIC },
};

const METRIC_DEFS: {
  key: MetricKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "domains",
    label: "Domains",
    href: "/dashboard/admin/domains",
    icon: Globe2,
  },
  {
    key: "aliases",
    label: "Aliases",
    href: "/dashboard/admin/aliases",
    icon: AtSign,
  },
  {
    key: "handles",
    label: "Handles",
    href: "/dashboard/admin/handles",
    icon: Mail,
  },
  {
    key: "smtp",
    label: "SMTP Submission",
    href: "/dashboard/admin/smtp-credentials",
    icon: Send,
  },
  {
    key: "users",
    label: "Users",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    key: "bans",
    label: "Bans",
    href: "/dashboard/admin/bans",
    icon: Ban,
  },
  {
    key: "tokens",
    label: "API Tokens",
    href: "/dashboard/admin/api-tokens",
    icon: KeyRound,
  },
  {
    key: "dns",
    label: "DNS Requests",
    href: "/dashboard/admin/dns-requests",
    icon: Radar,
  },
];

function extractTotal(result: {
  ok: boolean;
  data: { items?: unknown[]; pagination?: { total?: number } } | null;
}): MetricState {
  if (!result.ok || !result.data) {
    return { total: null, error: "Failed to load" };
  }
  const total = result.data.pagination?.total;
  if (typeof total === "number" && Number.isFinite(total)) {
    return { total, error: null };
  }
  const items = result.data.items;
  if (Array.isArray(items)) {
    return { total: items.length, error: null };
  }
  return { total: null, error: "No total" };
}

function formatValue(metric: MetricState, loading: boolean): React.ReactNode {
  if (loading && metric.total === null) {
    return <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />;
  }
  if (metric.error && metric.total === null) {
    return "—";
  }
  return metric.total ?? "—";
}

export function OverviewContent() {
  const [totals, setTotals] = React.useState<TotalsState>(INITIAL_TOTALS);
  const [loading, setLoading] = React.useState(true);
  const [loadedAt, setLoadedAt] = React.useState<number | null>(null);

  const loadTotals = React.useCallback(async () => {
    setLoading(true);
    try {
      const [domains, aliases, handles, smtp, users, bans, tokens, dns] =
        await Promise.all([
          fetchDomains({ limit: 1, offset: 0 }),
          fetchAliases({ limit: 1, offset: 0 }),
          fetchHandles({ limit: 1, offset: 0 }),
          fetchSmtpCredentials({ limit: 1, offset: 0 }),
          fetchUsers({ limit: 1, offset: 0 }),
          fetchBans({ limit: 1, offset: 0 }),
          fetchApiTokens({ limit: 1, offset: 0 }),
          fetchDnsRequests({ limit: 1, offset: 0 }),
        ]);

      setTotals({
        domains: extractTotal(domains),
        aliases: extractTotal(aliases),
        handles: extractTotal(handles),
        smtp: extractTotal(smtp),
        users: extractTotal(users),
        bans: extractTotal(bans),
        tokens: extractTotal(tokens),
        dns: extractTotal(dns),
      });
      setLoadedAt(Date.now());
    } catch {
      setTotals({
        domains: { total: null, error: "Failed to load" },
        aliases: { total: null, error: "Failed to load" },
        handles: { total: null, error: "Failed to load" },
        smtp: { total: null, error: "Failed to load" },
        users: { total: null, error: "Failed to load" },
        bans: { total: null, error: "Failed to load" },
        tokens: { total: null, error: "Failed to load" },
        dns: { total: null, error: "Failed to load" },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadTotals();
  }, [loadTotals]);

  const metricItems: MetricCardItem[] = METRIC_DEFS.map((def) => {
    const metric = totals[def.key];
    const Icon = def.icon;
    return {
      key: def.key,
      label: def.label,
      value: formatValue(metric, loading),
      hint: metric.error ?? "Total records",
      icon: <Icon className="h-4 w-4 text-[var(--neu-green)]" />,
    };
  });

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        <AdminPageHeader
          icon={<LayoutDashboard className="h-4 w-4" />}
          title="Overview"
          description="System totals and quick links to administration pages."
          actions={
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5"
              onClick={() => void loadTotals()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Refresh
            </Button>
          }
        />

        <AdminMetricCards
          items={metricItems}
          columnsClassName="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />

        <div>
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Quick links
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {METRIC_DEFS.map((def) => {
              const Icon = def.icon;
              const metric = totals[def.key];
              return (
                <Link key={def.key} href={def.href} className="group block">
                  <AdminDataCard className="p-4 transition-colors group-hover:border-[rgba(48,209,88,0.2)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                        <Icon className="h-4 w-4 text-[var(--neu-green)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--neu-green)]">
                          {def.label}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {metric.total !== null
                            ? `${metric.total.toLocaleString()} total`
                            : loading
                              ? "Loading…"
                              : "Open page"}
                        </p>
                      </div>
                    </div>
                  </AdminDataCard>
                </Link>
              );
            })}

            <Link href="/dashboard/admin/rate-limits" className="group block">
              <AdminDataCard className="p-4 transition-colors group-hover:border-[rgba(48,209,88,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                    <Gauge className="h-4 w-4 text-[var(--neu-green)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--neu-green)]">
                      Rate Limits
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Multi-vector reset & inspection
                    </p>
                  </div>
                </div>
              </AdminDataCard>
            </Link>
          </div>
        </div>

        {loadedAt ? (
          <p className="text-[11px] text-[var(--text-muted)]">
            Last updated{" "}
            {new Date(loadedAt).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        ) : null}
      </div>
    </AdminPageLayout>
  );
}
