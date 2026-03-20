"use client";

import { ChevronDown, Chromium, Flame } from "lucide-react";

import {
  CHROME_EXTENSION_URL,
  FIREFOX_EXTENSION_URL,
} from "@/lib/browser-addon-links";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";

type BrowserAddonMenuProps = {
  triggerClassName?: string;
  triggerIconClassName?: string;
};

export function BrowserAddonMenu({ triggerClassName, triggerIconClassName }: BrowserAddonMenuProps = {}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group relative inline-flex h-8 items-center justify-center gap-2 overflow-visible rounded-lg px-2.5 text-sm font-medium",
            triggerClassName ?? "border border-[var(--hairline-border)] bg-[var(--hover-state)] text-[var(--text-primary)] hover:bg-[var(--hover-state)]"
          )}
          aria-label="Browser Extension"
        >
          <Chromium className={cn(`h-4 w-4 ${clickableIconClass}`, triggerIconClassName ?? "text-[var(--text-secondary)]")} />
          Extension
          <ChevronDown className={cn("ml-1 h-3.5 w-3.5", triggerIconClassName ?? "text-[var(--text-secondary)]")} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64"
      >
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-[var(--hover-state)]">
          <a
            href={FIREFOX_EXTENSION_URL}
            target="_blank"
            rel="noreferrer"
          >
            <Flame className={`h-4 w-4 ${clickableIconClass}`} />
            Firefox (Recommended)
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-[var(--hover-state)]">
          <a
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noreferrer"
          >
            <Chromium className={`h-4 w-4 ${clickableIconClass}`} />
            Chrome
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
