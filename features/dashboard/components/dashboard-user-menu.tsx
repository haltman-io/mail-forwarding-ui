"use client";

import * as React from "react";
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Moon,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function DashboardUserMenu() {
  const [open, setOpen] = React.useState(false);
  const { user, signOut } = useAuth();

  const userName = user?.username ?? user?.email?.split("@")[0] ?? "User";
  const userEmail = user?.email ?? "";
  const initials = userName
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "U";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus-ring)]"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(48,209,88,0.10)] text-[10px] font-bold text-[var(--neu-green)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_1px_4px_rgba(0,0,0,0.25)]">
            {initials}
          </div>
          <span className="hidden text-[13px] font-medium text-[var(--text-primary)] sm:block">
            {userName}
          </span>
          <ChevronRight
            className={cn(
              "hidden h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform duration-200 sm:block",
              open && "rotate-90",
            )}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User info header */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(48,209,88,0.10)] text-[11px] font-bold text-[var(--neu-green)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_2px_6px_rgba(0,0,0,0.3)]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">
                {userName}
              </p>
              <p className="truncate text-[11px] text-[var(--text-muted)]">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User />
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Preferences</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Moon />
            Appearance
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Shield />
            Security
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <HelpCircle />
            Help &amp; Support
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={() => void signOut()}>
          <LogOut />
          Sign Out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
