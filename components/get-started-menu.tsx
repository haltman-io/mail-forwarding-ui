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
};

export function GetStartedMenu({
  triggerClassName,
  triggerIconClassName,
}: GetStartedMenuProps = {}) {
  return (
    <NavGroupMenu
      label="Get Started"
      icon={Rocket}
      triggerClassName={triggerClassName}
      triggerIconClassName={triggerIconClassName}
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
