import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminToolbar({ children, className }: AdminToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      style={{
        background: "var(--neu-surface-lo)",
        border: "1px solid rgba(255, 255, 255, 0.03)",
        boxShadow: "var(--neu-shadow-in)",
      }}
    >
      {children}
    </div>
  );
}

export function AdminToolbarLeft({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>{children}</div>
  );
}

export function AdminToolbarRight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>{children}</div>
  );
}
