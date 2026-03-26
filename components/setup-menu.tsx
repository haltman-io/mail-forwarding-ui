"use client";

import { Settings } from "lucide-react";

import { BrowserExtensionSubmenu } from "@/components/browser-extension-submenu";
import { DnsSetupMenu } from "@/components/dns-setup-menu";
import {
  NavGroupMenu,
  navMenuDialogIconClassName,
  navMenuDialogTriggerClassName,
} from "@/components/nav-group-menu";

type SetupMenuProps = {
  triggerClassName?: string;
  triggerIconClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function SetupMenu({
  triggerClassName,
  triggerIconClassName,
  open,
  onOpenChange,
}: SetupMenuProps = {}) {
  return (
    <NavGroupMenu
      label="Setup"
      icon={Settings}
      triggerClassName={triggerClassName}
      triggerIconClassName={triggerIconClassName}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DnsSetupMenu
        triggerClassName={navMenuDialogTriggerClassName}
        triggerIconClassName={navMenuDialogIconClassName}
      />
      <BrowserExtensionSubmenu />
    </NavGroupMenu>
  );
}
