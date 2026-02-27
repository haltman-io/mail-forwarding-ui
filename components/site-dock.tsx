"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { BadgeAlertIcon } from "@/components/ui/badge-alert";
import { BookTextIcon } from "@/components/ui/book-text";
import { GithubIcon } from "@/components/ui/github";
import { HomeIcon } from "@/components/ui/home";
import { Separator } from "@/components/ui/separator";
import { ShieldCheckIcon } from "@/components/ui/shield-check";
import { ZapIcon } from "@/components/ui/zap";

import { Dock, DockIcon } from "@/components/ui/dock";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type DockItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  external?: boolean;
};

const internalItems: DockItem[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/privacy", label: "Privacy Policy", icon: ShieldCheckIcon },
  { href: "/abuse", label: "Abuse Policy", icon: BadgeAlertIcon },
];

const externalItems: DockItem[] = [
  {
    href: "https://dev.haltman.io/mail-forwarding-selfhost/get-started",
    label: "Documentation",
    icon: BookTextIcon,
    external: true,
  },
  {
    href: "https://dev.haltman.io/api-reference/get-domains",
    label: "API Reference",
    icon: ZapIcon,
    external: true,
  },
  {
    href: "https://github.com/haltman-io/mail-forwarding",
    label: "Source Code",
    icon: GithubIcon,
    external: true,
  },
];

function DockItemLink({ item }: { item: DockItem }) {
  return (
    <DockIcon key={item.label} className="aspect-square size-12 rounded-xl">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className="group ui-focus-ring ui-smooth flex size-full items-center justify-center rounded-xl border border-transparent text-[var(--text-secondary)] hover:border-[color:var(--hairline-border)] hover:bg-[color:var(--hover-state)] hover:text-[var(--text-primary)] active:bg-[color:var(--active-state)]"
            aria-label={item.label}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
          >
            <item.icon
              size={20}
              className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(var(--alias-accent-rgb),0.5)]"
            />
            <span className="sr-only">{item.label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    </DockIcon>
  );
}

export function SiteDock() {
  return (
    <div className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 bottom-[max(0.8rem,env(safe-area-inset-bottom))]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-8 -top-8 h-20 rounded-full bg-[color:var(--atmospheric-glow)] opacity-45 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-8 -bottom-8 h-20 rounded-full bg-[color:var(--atmospheric-glow)] opacity-30 blur-3xl" />

        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Dock
            className="alias-console-surface pointer-events-auto mt-0 h-16 gap-2 rounded-2xl px-2 py-2"
            iconSize={40}
            iconMagnification={60}
            iconDistance={120}
          >
            {internalItems.map((item) => (
              <DockItemLink key={item.label} item={item} />
            ))}

            <div className="pointer-events-none flex h-full items-center px-1">
              <Separator
                orientation="vertical"
                className="h-7 bg-[color:color-mix(in_oklch,var(--hairline-border)_70%,white_30%)]"
              />
            </div>

            {externalItems.map((item) => (
              <DockItemLink key={item.label} item={item} />
            ))}
          </Dock>
        </TooltipProvider>
      </div>
    </div>
  );
}
