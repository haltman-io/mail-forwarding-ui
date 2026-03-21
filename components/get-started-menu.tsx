"use client";

import Link from "next/link";
import { Rocket, Terminal } from "lucide-react";

import { BrowserExtensionSubmenu } from "@/components/browser-extension-submenu";
import {
  NavGroupMenu,
  navMenuItemClassName,
  navMenuItemIconClassName,
} from "@/components/nav-group-menu";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type GetStartedMenuProps = {
  triggerClassName?: string;
  triggerIconClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function GetStartedMenu({
  triggerClassName,
  triggerIconClassName,
  open,
  onOpenChange,
}: GetStartedMenuProps = {}) {
  return (
    <NavGroupMenu
      label="Get Started"
      icon={Rocket}
      triggerClassName={triggerClassName}
      triggerIconClassName={triggerIconClassName}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href="/console">
          <Terminal className={navMenuItemIconClassName} />
          Console
        </Link>
      </DropdownMenuItem>
      <BrowserExtensionSubmenu />
    </NavGroupMenu>
  );
}
