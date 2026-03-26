"use client";

import Link from "next/link";
import {
  BookOpen,
  CircleHelp,
  Github,
  Info,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import {
  NavGroupMenu,
  navMenuItemClassName,
  navMenuItemIconClassName,
} from "@/components/nav-group-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  DOCUMENTATION_URL,
  SOURCE_CODE_URL,
} from "@/lib/site-links";

type DocsMenuProps = {
  onAboutSelect: () => void;
  triggerClassName?: string;
  triggerIconClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function DocsMenu({
  onAboutSelect,
  triggerClassName,
  triggerIconClassName,
  open,
  onOpenChange,
}: DocsMenuProps) {
  return (
    <NavGroupMenu
      label="Docs"
      icon={BookOpen}
      triggerClassName={triggerClassName}
      triggerIconClassName={triggerIconClassName}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href={DOCUMENTATION_URL} target="_blank" rel="noreferrer">
          <BookOpen className={navMenuItemIconClassName} />
          Documentation
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href={SOURCE_CODE_URL} target="_blank" rel="noreferrer">
          <Github className={navMenuItemIconClassName} />
          Source Code
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        className={navMenuItemClassName}
        onSelect={(event) => {
          event.preventDefault();
          onAboutSelect();
        }}
      >
        <Info className={navMenuItemIconClassName} />
        About
      </DropdownMenuItem>
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
