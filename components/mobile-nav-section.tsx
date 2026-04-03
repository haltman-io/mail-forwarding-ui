"use client";

import * as React from "react";
import { ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";

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

/* ── shared row base ── */
const mobileNavRowBase =
  "group flex w-full items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors duration-200 hover:bg-[var(--hover-state)] hover:text-[var(--text-primary)]";

/* ── L1: top-level direct links (Console, Admin) ── */
export const mobileNavItemClassName =
  `${mobileNavRowBase} min-h-10 px-3 text-[var(--text-primary)]`;

export const mobileNavItemIconClassName =
  "h-4 w-4 shrink-0 text-[var(--text-secondary)]";

/* ── L2: children of a section (Add Domain, API Reference, Documentation…) ── */
export const mobileNavL2ClassName =
  `${mobileNavRowBase} min-h-9 pl-7 pr-3 text-[var(--text-secondary)]`;

export const mobileNavL2IconClassName =
  "h-4 w-4 shrink-0 text-[var(--text-secondary)]";

/* ── L3: deeply nested items (Firefox Extension, Chrome Extension) ── */
export const mobileNavL3ClassName =
  `${mobileNavRowBase} min-h-9 pl-11 pr-3 text-[var(--text-secondary)] opacity-85`;

export const mobileNavL3IconClassName =
  "h-4 w-4 shrink-0 text-[var(--text-muted)]";

/* ── chevron indicator for link rows ── */
const indicatorClassName = "ml-auto h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] opacity-60";

export function MobileNavLinkIndicator() {
  return <ChevronRight className={indicatorClassName} />;
}

export function MobileNavExternalIndicator() {
  return <ArrowUpRight className={indicatorClassName} />;
}

/* ── separator ── */
export function MobileNavSeparator() {
  return <div className="my-1 mx-3 h-px bg-[var(--hairline-border)] opacity-40" />;
}

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
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            mobileNavRowBase,
            "justify-between",
            nested
              ? "min-h-9 pl-7 pr-3 text-[var(--text-secondary)]"
              : "min-h-10 px-3 text-[var(--text-primary)]"
          )}
          aria-label={label}
        >
          <span className="inline-flex items-center gap-3">
            {icon}
            {label}
          </span>
          <ChevronDown
            className={cn(
              indicatorClassName,
              "transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-0.5">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
