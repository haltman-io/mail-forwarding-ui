import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminToolbarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Horizontal toolbar strip that sits between the page header and the data surface.
 * Left side → search / filters. Right side → secondary actions (refresh, etc).
 */
export function AdminToolbar({ children, className }: AdminToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
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
