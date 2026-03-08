import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminDataCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Surface container for data tables on admin pages.
 * Provides consistent border, radius, and background.
 */
export function AdminDataCard({ children, className }: AdminDataCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[var(--hairline-border)] bg-[var(--surface-base)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
