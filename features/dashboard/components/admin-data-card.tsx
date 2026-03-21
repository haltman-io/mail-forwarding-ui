import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminDataCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminDataCard({ children, className }: AdminDataCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl",
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
