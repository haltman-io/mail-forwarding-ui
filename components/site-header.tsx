"use client";

import * as React from "react";
import Link from "next/link";
import {
  Github,
  Info,
  ExternalLink,
  BookOpen,
  Menu,
  Zap,
  ShieldCheck,
  HatGlasses,
  Brain,
  CircleCheck,
  Cat,
  Earth,
  Fingerprint,
  Drama,
  Wifi,
  Skull,
  Radar,
  Eye,
  AtSign,
} from "lucide-react";
import { AdminMenu } from "@/components/admin-menu";
import { BrowserAddonMenu } from "@/components/browser-addon-menu";
import { ApiTokenDialog } from "@/components/api-token-dialog";
import { DnsSetupMenu } from "@/components/dns-setup-menu";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_8px_rgba(208,220,238,0.22)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";

const brandIcons = [
  HatGlasses,
  HatGlasses,
  HatGlasses,
  HatGlasses,
  HatGlasses,
  HatGlasses,
  Zap,
  Brain,
  CircleCheck,
  Cat,
  Earth,
  Fingerprint,
  Drama,
  Wifi,
  Skull,
  ShieldCheck,
  Radar,
  Eye,
  AtSign,
] as const;

type ApiStatus = "idle" | "connected" | "error";

type SiteHeaderProps = {
  onApiStatusChange?: (status: ApiStatus) => void;
};

export function SiteHeader({ onApiStatusChange }: SiteHeaderProps = {}) {
  const [host, setHost] = React.useState("");
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [brandIconIndex, setBrandIconIndex] = React.useState(0);
  const [brandIconSwapKey, setBrandIconSwapKey] = React.useState(0);

  React.useEffect(() => {
    setHost(window.location.host);
  }, []);

  React.useEffect(() => {
    if (brandIcons.length < 2) return;

    setBrandIconIndex(Math.floor(Math.random() * brandIcons.length));

    const interval = window.setInterval(() => {
      setBrandIconIndex((current) => {
        let next = current;
        while (next === current) {
          next = Math.floor(Math.random() * brandIcons.length);
        }
        return next;
      });
      setBrandIconSwapKey((current) => current + 1);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const hostLabel = host ? host : "haltman.io";
  const brand = hostLabel;
  const BrandIcon = brandIcons[brandIconIndex] ?? brandIcons[0];
  const headerChipVisualClass =
    "group ui-focus-ring ui-smooth inline-flex items-center justify-center gap-2 rounded-xl border-[0.5px] border-[color:color-mix(in_oklch,var(--hairline-border)_78%,white_22%)] bg-[linear-gradient(180deg,rgba(121,132,151,0.17)_0%,rgba(23,30,44,0.56)_100%)] text-[var(--text-primary)] shadow-[0_12px_24px_-18px_rgba(0,0,0,0.9),0_3px_8px_-6px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(0,0,0,0.36)] hover:border-[color:color-mix(in_oklch,var(--hairline-border)_61%,white_39%)] hover:bg-[linear-gradient(180deg,rgba(137,148,168,0.22)_0%,rgba(30,38,55,0.62)_100%)]";
  const headerActionTriggerClass =
    `${headerChipVisualClass} h-8 px-2.5 text-sm font-medium`;
  const headerActionIconClass = "text-[var(--text-primary)] !opacity-100";

  return (
    <>
      <header className="sticky top-3 z-50 px-4 sm:top-4">
        <div className="relative mx-auto w-full max-w-3xl">
          <div className="pointer-events-none absolute inset-x-10 -top-7 h-20 rounded-full bg-[color:var(--atmospheric-glow)] opacity-45 blur-3xl" />

          <nav
            aria-label="Primary"
            className="alias-console-surface relative flex h-14 items-center justify-between gap-3 rounded-2xl px-3 sm:px-4"
          >
            <div className="flex min-w-0 items-center">
              <Link
                href="/"
                className={`${headerChipVisualClass} px-3 py-1 text-xs`}
                aria-label="Home"
              >
                <span
                  key={brandIconSwapKey}
                  className="inline-flex motion-safe:animate-[spin_620ms_cubic-bezier(0.22,1,0.36,1)_1]"
                >
                  <BrandIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${headerActionIconClass}`} />
                </span>
                <span className="truncate font-mono text-[12px] text-[var(--text-primary)] sm:font-sans sm:text-sm sm:font-medium">
                  {brand}
                </span>
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden sm:block">
                <BrowserAddonMenu
                  triggerClassName={headerActionTriggerClass}
                  triggerIconClassName={headerActionIconClass}
                />
              </div>
              <div>
                <ApiTokenDialog
                  onApiStatusChange={onApiStatusChange}
                  triggerClassName={headerActionTriggerClass}
                  triggerIconClassName={headerActionIconClass}
                />
              </div>
              <div>
                <DnsSetupMenu
                  triggerClassName={headerActionTriggerClass}
                  triggerIconClassName={headerActionIconClass}
                />
              </div>
              <div>
                <AdminMenu />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`${headerChipVisualClass} size-8`}
                    aria-label="Open navigation menu"
                    title="Open navigation menu"
                  >
                    <Menu className={`h-4 w-4 ${headerActionIconClass} ${clickableIconClass}`} />
                    <span className="sr-only">Open navigation menu</span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-44 p-1 text-[var(--text-primary)]"
                >
                  <DropdownMenuItem asChild className="cursor-pointer rounded-md">
                    <Link
                      href="https://dev.haltman.io/mail-forwarding-selfhost/get-started"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <BookOpen className="h-4 w-4 text-[var(--text-secondary)]" />
                      Documentation
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer rounded-md">
                    <Link
                      href="https://dev.haltman.io/api-reference/get-domains"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Zap className="h-4 w-4 text-[var(--text-secondary)]" />
                      API Reference
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer rounded-md">
                    <Link
                      href="https://github.com/haltman-io/mail-forwarding"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Github className="h-4 w-4 text-[var(--text-secondary)]" />
                      Source Code
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-[color:var(--hairline-border)]" />

                  <DropdownMenuItem
                    className="cursor-pointer rounded-md"
                    onSelect={(event) => {
                      event.preventDefault();
                      setAboutOpen(true);
                    }}
                  >
                    <Info className="h-4 w-4 text-[var(--text-secondary)]" />
                    About
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </header>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="w-[min(94vw,460px)] p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle>ABOUT THIS</DialogTitle>
            <DialogDescription>FREE EMAIL FORWARDING SERVICE :)</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-xs text-[var(--text-secondary)]">NO TRACKING. NO BLOAT.</p>

            <Separator className="bg-[color:var(--hairline-border)]" />

            <div className="space-y-1">
              <p className="text-xs text-[var(--text-muted)]">REFERENCE</p>
              <Link
                href="https://www.thc.org/mail/"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] underline underline-offset-4 hover:text-[var(--text-primary)]"
              >
                https://www.thc.org/mail/
                <ExternalLink className={`h-3.5 w-3.5 text-[var(--text-muted)] ${clickableIconClass}`} />
              </Link>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-[var(--text-muted)]">ORIGINAL CONCEPT: Lou-Cipher (2022)</p>
              <Link
                href="https://github.com/Lou-Cipher"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] underline underline-offset-4 hover:text-[var(--text-primary)]"
              >
                https://github.com/Lou-Cipher
                <ExternalLink className={`h-3.5 w-3.5 text-[var(--text-muted)] ${clickableIconClass}`} />
              </Link>
            </div>

            <Separator className="bg-[color:var(--hairline-border)]" />

            <p className="m-0 font-sans text-[11px] leading-[1.6] text-[color:var(--text-muted)]">
              POWERED BY{" "}
              <strong className="font-semibold text-[color:var(--text-secondary)]">HALTMAN.IO</strong> &amp;{" "}
              <strong className="font-semibold text-[color:var(--text-secondary)]">THE HACKER&apos;S CHOICE</strong>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
