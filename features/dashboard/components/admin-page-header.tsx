import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  icon,
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)] text-[var(--neu-green)]">
            {icon}
          </div>
        )}
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          {description && (
            <p className="text-[13px] text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 pt-2 sm:pt-0">{actions}</div>
      )}
    </div>
  );
}
