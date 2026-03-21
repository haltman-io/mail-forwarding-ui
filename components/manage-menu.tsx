"use client";

import { Wrench } from "lucide-react";

import { DnsSetupMenu } from "@/components/dns-setup-menu";
import {
  NavGroupMenu,
  navMenuDialogIconClassName,
  navMenuDialogTriggerClassName,
} from "@/components/nav-group-menu";

type ManageMenuProps = {
  triggerClassName?: string;
  triggerIconClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ManageMenu({
  triggerClassName,
  triggerIconClassName,
  open,
  onOpenChange,
}: ManageMenuProps = {}) {
  return (
    <NavGroupMenu
      label="Manage"
      icon={Wrench}
      triggerClassName={triggerClassName}
      triggerIconClassName={triggerIconClassName}
      contentClassName="w-52 p-1.5"
      open={open}
      onOpenChange={onOpenChange}
    >
      <DnsSetupMenu
        triggerClassName={navMenuDialogTriggerClassName}
        triggerIconClassName={navMenuDialogIconClassName}
      />
    </NavGroupMenu>
  );
}
