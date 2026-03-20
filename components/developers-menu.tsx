"use client";

import Link from "next/link";
import { Code2, Zap } from "lucide-react";

import { ApiTokenDialog } from "@/components/api-token-dialog";
import {
  NavGroupMenu,
  navMenuDialogIconClassName,
  navMenuDialogTriggerClassName,
  navMenuItemClassName,
  navMenuItemIconClassName,
} from "@/components/nav-group-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { API_REFERENCE_URL } from "@/lib/site-links";

type ApiStatus = "idle" | "connected" | "error";

type DevelopersMenuProps = {
  onApiStatusChange?: (status: ApiStatus) => void;
  triggerClassName?: string;
  triggerIconClassName?: string;
};

export function DevelopersMenu({
  onApiStatusChange,
  triggerClassName,
  triggerIconClassName,
}: DevelopersMenuProps = {}) {
  return (
    <NavGroupMenu
      label="Developers"
      icon={Code2}
      triggerClassName={triggerClassName}
      triggerIconClassName={triggerIconClassName}
    >
      <ApiTokenDialog
        onApiStatusChange={onApiStatusChange}
        triggerLabel="Create API Token"
        triggerClassName={navMenuDialogTriggerClassName}
        triggerIconClassName={navMenuDialogIconClassName}
      />
      <DropdownMenuItem asChild className={navMenuItemClassName}>
        <Link href={API_REFERENCE_URL} target="_blank" rel="noreferrer">
          <Zap className={navMenuItemIconClassName} />
          API Reference
        </Link>
      </DropdownMenuItem>
    </NavGroupMenu>
  );
}
