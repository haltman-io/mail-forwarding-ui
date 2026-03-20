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
};

export function ManageMenu({
  triggerClassName,
  triggerIconClassName,
}: ManageMenuProps = {}) {
  return (
    <NavGroupMenu
      label="Manage"
      icon={Wrench}
      triggerClassName={triggerClassName}
      triggerIconClassName={triggerIconClassName}
      contentClassName="w-52 p-1.5"
    >
      <DnsSetupMenu
        triggerClassName={navMenuDialogTriggerClassName}
        triggerIconClassName={navMenuDialogIconClassName}
      />
    </NavGroupMenu>
  );
}
