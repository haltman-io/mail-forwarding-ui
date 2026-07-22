"use client";

import * as React from "react";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";

export type MetricCardItem = {
  key: string;
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  valueClassName?: string;
  iconWrapClassName?: string;
};

export function AdminMetricCards({
  items,
  columnsClassName = "sm:grid-cols-3",
}: {
  items: MetricCardItem[];
  columnsClassName?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className={`grid gap-4 ${columnsClassName}`}>
      {items.map((item) => (
        <AdminDataCard key={item.key} className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                {item.label}
              </p>
              <p
                className={
                  item.valueClassName ??
                  "text-2xl font-semibold tracking-tight text-[var(--text-primary)]"
                }
              >
                {item.value}
              </p>
              {item.hint ? (
                <p className="text-[11px] text-[var(--text-muted)]">{item.hint}</p>
              ) : null}
            </div>
            {item.icon ? (
              <div
                className={
                  item.iconWrapClassName ??
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]"
                }
              >
                {item.icon}
              </div>
            ) : null}
          </div>
        </AdminDataCard>
      ))}
    </div>
  );
}
