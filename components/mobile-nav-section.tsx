"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type MobileNavSectionProps = {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  nested?: boolean;
  icon?: React.ReactNode;
};

export const mobileNavItemClassName =
  "group inline-flex min-h-9 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--hover-state)] hover:text-[var(--text-primary)]";

export const mobileNavItemIconClassName = "h-4 w-4 text-[var(--text-secondary)]";

export function MobileNavSection({
  label,
  children,
  defaultOpen = false,
  nested = false,
  icon,
}: MobileNavSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "overflow-hidden border border-[var(--hairline-border)] bg-[rgba(255,255,255,0.03)]",
          nested ? "rounded-xl" : "rounded-2xl"
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "group flex w-full items-center justify-between gap-3 text-left transition-colors duration-200 hover:bg-[var(--hover-state)]",
              nested ? "px-3 py-2" : "px-3.5 py-3"
            )}
            aria-label={label}
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
              {icon}
              {label}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-[var(--text-muted)] transition-transform duration-200",
                open ? "rotate-180" : ""
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div
            className={cn(
              "border-t border-[var(--hairline-border)]",
              nested ? "space-y-1 p-2" : "space-y-1 p-2.5"
            )}
          >
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
