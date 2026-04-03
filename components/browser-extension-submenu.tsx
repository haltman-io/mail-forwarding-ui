"use client";

import { ArrowUpRight, Chromium, Flame } from "lucide-react";

import {
  CHROME_EXTENSION_URL,
  FIREFOX_EXTENSION_URL,
} from "@/lib/browser-addon-links";
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  navMenuItemClassName,
  navMenuItemIconClassName,
} from "@/components/nav-group-menu";

type BrowserExtensionSubmenuProps = {
  triggerClassName?: string;
  contentClassName?: string;
};

export function BrowserExtensionSubmenu({
  triggerClassName = navMenuItemClassName,
  contentClassName = "w-56 p-1.5",
}: BrowserExtensionSubmenuProps = {}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className={triggerClassName}>
        <Chromium className={navMenuItemIconClassName} />
        Browser Extension
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className={contentClassName}>
          <DropdownMenuItem asChild className={navMenuItemClassName}>
            <a href={FIREFOX_EXTENSION_URL} target="_blank" rel="noreferrer">
              <Flame className={navMenuItemIconClassName} />
              Firefox Extension
              <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] opacity-60" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={navMenuItemClassName}>
            <a href={CHROME_EXTENSION_URL} target="_blank" rel="noreferrer">
              <Chromium className={navMenuItemIconClassName} />
              Chrome Extension
              <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] opacity-60" />
            </a>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
