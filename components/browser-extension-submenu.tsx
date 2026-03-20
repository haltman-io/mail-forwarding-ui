"use client";

import { Chromium, Flame } from "lucide-react";

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
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={navMenuItemClassName}>
            <a href={CHROME_EXTENSION_URL} target="_blank" rel="noreferrer">
              <Chromium className={navMenuItemIconClassName} />
              Chrome Extension
            </a>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
