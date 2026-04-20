"use client";

import Link from "next/link";
import { Fingerprint, Mail, Terminal } from "lucide-react";

import {
  NavGroupMenu,
  navMenuItemClassName,
  navMenuItemIconClassName,
} from "@/components/nav-group-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type ConsoleMenuProps = {
  triggerClassName?: string;
  triggerIconClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ConsoleMenu({
  triggerClassName,
  triggerIconClassName,
  open,
  onOpenChange,
}: ConsoleMenuProps) {
  return (
    <NavGroupMenu
      label="Console"
      icon={Terminal}
      triggerClassName={triggerClassName}
      triggerIconClassName={triggerIconClassName}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href="/console">
          <Mail className={navMenuItemIconClassName} />
          Alias
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href="/handle">
          <Fingerprint className={navMenuItemIconClassName} />
          Handle
        </Link>
      </DropdownMenuItem>
    </NavGroupMenu>
  );
}
