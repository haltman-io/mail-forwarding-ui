"use client";

import Link from "next/link";
import { ArrowUpRight, Code2, Zap } from "lucide-react";

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

type ApiMenuProps = {
  onApiStatusChange?: (status: ApiStatus) => void;
  triggerClassName?: string;
  triggerIconClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ApiMenu({
  onApiStatusChange,
  triggerClassName,
  triggerIconClassName,
  open,
  onOpenChange,
}: ApiMenuProps = {}) {
  return (
    <NavGroupMenu
      label="API"
      icon={Code2}
      triggerClassName={triggerClassName}
      triggerIconClassName={triggerIconClassName}
      open={open}
      onOpenChange={onOpenChange}
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
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] opacity-60" />
        </Link>
      </DropdownMenuItem>
    </NavGroupMenu>
  );
}
