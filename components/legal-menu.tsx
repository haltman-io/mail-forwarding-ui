"use client";

import Link from "next/link";
import { CircleHelp, Scale, ShieldAlert, ShieldCheck } from "lucide-react";

import {
  NavGroupMenu,
  navMenuItemClassName,
  navMenuItemIconClassName,
} from "@/components/nav-group-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type LegalMenuProps = {
  triggerClassName?: string;
  triggerIconClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function LegalMenu({
  triggerClassName,
  triggerIconClassName,
  open,
  onOpenChange,
}: LegalMenuProps = {}) {
  return (
    <NavGroupMenu
      label="Legal"
      icon={Scale}
      triggerClassName={triggerClassName}
      triggerIconClassName={triggerIconClassName}
      contentClassName="w-44 p-1.5"
      open={open}
      onOpenChange={onOpenChange}
    >
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href="/faq">
          <CircleHelp className={navMenuItemIconClassName} />
          FAQ
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href="/privacy">
          <ShieldCheck className={navMenuItemIconClassName} />
          Privacy
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href="/abuse">
          <ShieldAlert className={navMenuItemIconClassName} />
          Abuse
        </Link>
      </DropdownMenuItem>
    </NavGroupMenu>
  );
}
