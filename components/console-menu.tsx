"use client";

import Link from "next/link";
import { Fingerprint, Mail, Plus } from "lucide-react";

import {
  NavGroupMenu,
  navMenuItemClassName,
  navMenuItemIconClassName,
} from "@/components/nav-group-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type CreateMenuProps = {
  triggerClassName?: string;
  triggerIconClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CreateMenu({
  triggerClassName,
  triggerIconClassName,
  open,
  onOpenChange,
}: CreateMenuProps = {}) {
  return (
    <NavGroupMenu
      label="Create"
      icon={Plus}
      triggerClassName={triggerClassName}
      triggerIconClassName={triggerIconClassName}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href="/console">
          <Mail className={navMenuItemIconClassName} />
          New Alias
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href="/handle">
          <Fingerprint className={navMenuItemIconClassName} />
          New Handle
        </Link>
      </DropdownMenuItem>
    </NavGroupMenu>
  );
}

export const ConsoleMenu = CreateMenu;

