"use client";

import { ChevronDown, Chromium, Flame } from "lucide-react";

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
            triggerClassName ?? "border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
          )}
          aria-label="Browser Extension"
        >
          <Chromium className={cn(`h-4 w-4 ${clickableIconClass}`, triggerIconClassName ?? "text-zinc-300")} />
          Extension
          <ChevronDown className={cn("ml-1 h-3.5 w-3.5", triggerIconClassName ?? "text-zinc-400")} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 border-white/10 bg-black/80 text-zinc-200 backdrop-blur"
      >
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
          <a
            href="https://addons.mozilla.org/en-US/firefox/addon/email-alias-manager-free/"
            target="_blank"
            rel="noreferrer"
          >
            <Flame className={`h-4 w-4 ${clickableIconClass}`} />
            Firefox (Recommended)
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5">
          <a
            href="https://github.com/haltman-io/mail-forwarding-addon-google-chrome"
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
