"use client";

import * as React from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type NavGroupMenuProps = {
  label: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  triggerClassName?: string;
  triggerIconClassName?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
};

export const navMenuItemClassName = "cursor-pointer rounded-md";
export const navMenuItemIconClassName = "h-4 w-4 text-[var(--text-secondary)]";
export const navMenuDialogTriggerClassName =
  "group relative flex h-auto w-full items-center justify-start gap-3 overflow-visible rounded-[10px] px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all duration-200 ease-out hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--text-primary)]";
export const navMenuDialogIconClassName = "text-[var(--text-secondary)]";

export function NavGroupMenu({
  label,
  children,
  icon: Icon,
  triggerClassName,
  triggerIconClassName,
  contentClassName,
  align = "center",
}: NavGroupMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group relative inline-flex h-8 items-center justify-center gap-2 overflow-visible rounded-lg px-2.5 text-sm font-medium",
            triggerClassName ??
              "border border-[var(--hairline-border)] bg-[var(--hover-state)] text-[var(--text-primary)] hover:bg-[var(--hover-state)]"
          )}
          aria-label={label}
        >
          {Icon ? (
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                triggerIconClassName ?? "text-[var(--text-secondary)]"
              )}
            />
          ) : null}
          {label}
          <ChevronDown
            className={cn(
              "ml-0.5 h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180",
              triggerIconClassName ?? "text-[var(--text-secondary)]"
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn("w-56 p-1.5", contentClassName)}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
