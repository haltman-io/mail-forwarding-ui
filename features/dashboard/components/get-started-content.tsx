"use client";

import {
  AtSign,
  Clock,
  KeyRound,
  Mail,
  Rocket,
  Users,
  Zap,
} from "lucide-react";
import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";

const upcomingFeatures = [
  {
    icon: AtSign,
    title: "Email Aliases",
    description:
      "Create and manage email aliases that forward messages to your personal inbox.",
  },
  {
    icon: Mail,
    title: "Handles",
    description:
      "Claim unique handles across your domains and route them however you need.",
  },
  {
    icon: Users,
    title: "Group Aliases",
    description:
      "Set up a single alias that forwards to multiple recipients at once — perfect for teams.",
  },
  {
    icon: KeyRound,
    title: "API Keys",
    description:
      "Generate API keys to integrate mail forwarding into your own apps and automations.",
  },
  {
    icon: Zap,
    title: "Forwarding Rules",
    description:
      "Define conditional rules to filter, redirect, or transform incoming messages.",
  },
];

export function GetStartedContent() {
  return (
    <AdminPageLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={<Rocket className="h-4 w-4" />}
          title="Welcome"
          description="Your dashboard is almost ready."
        />

        {/* Hero card */}
        <AdminDataCard className="relative overflow-hidden p-6 sm:p-8">
          {/* Subtle gradient accent */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(48,209,88,0.06)] blur-3xl" />

          <div className="relative space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--neu-green)]" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--neu-green)]">
                Coming Soon
              </span>
            </div>
            <p className="max-w-xl text-[14px] leading-relaxed text-[var(--text-secondary)]">
              We&apos;re putting the finishing touches on your self-service
              dashboard. Soon you&apos;ll be able to manage aliases, handles,
              forwarding rules, and more — all from right here.
            </p>
          </div>
        </AdminDataCard>

        {/* Feature grid */}
        <div>
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            What&apos;s on the way
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingFeatures.map((feature) => (
              <AdminDataCard key={feature.title} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]">
                    <feature.icon className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">
                      {feature.title}
                    </p>
                    <p className="text-[12px] leading-relaxed text-[var(--text-muted)]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </AdminDataCard>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[12px] text-[var(--text-muted)]">
          We&apos;ll notify you as new features become available.
        </p>
      </div>
    </AdminPageLayout>
  );
}
