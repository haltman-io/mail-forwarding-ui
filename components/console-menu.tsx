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

const newBadge = (
  <span className="ml-auto rounded bg-[rgb(var(--alias-accent-rgb)_/_0.15)] px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-wide text-[var(--neu-green)] uppercase">
    New
  </span>
);

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
      badge={newBadge}
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
          {newBadge}
        </Link>
      </DropdownMenuItem>
    </NavGroupMenu>
  );
}
