"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Scale, ShieldAlert, ShieldCheck, Skull, Trophy } from "lucide-react";

import {
  NavGroupMenu,
  navMenuItemClassName,
  navMenuItemIconClassName,
} from "@/components/nav-group-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DOCUMENTATION_URL } from "@/lib/site-links";

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
        <Link href={DOCUMENTATION_URL} target="_blank" rel="noreferrer">
          <BookOpen className={navMenuItemIconClassName} />
          Docs
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] opacity-60" />
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
          Anti-Abuse
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href="/security">
          <Skull className={navMenuItemIconClassName} />
          Security
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href="/hall-of-fame">
          <Trophy className={navMenuItemIconClassName} />
          Hall of Fame
        </Link>
      </DropdownMenuItem>
    </NavGroupMenu>
  );
}


