"use client";

import Link from "next/link";
import { BookOpen, Github, Info } from "lucide-react";

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

type LearnMenuProps = {
  onAboutSelect: () => void;
  triggerClassName?: string;
  triggerIconClassName?: string;
};

export function LearnMenu({
  onAboutSelect,
  triggerClassName,
  triggerIconClassName,
}: LearnMenuProps) {
  return (
    <NavGroupMenu
      label="Learn"
      icon={BookOpen}
      triggerClassName={triggerClassName}
      triggerIconClassName={triggerIconClassName}
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
    </NavGroupMenu>
  );
}
