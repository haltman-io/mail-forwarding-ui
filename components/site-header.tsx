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
  ShieldAlert,
  ScrollText,
  ChevronDown,
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
  Terminal,
  Settings,
} from "lucide-react";
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
  "opacity-70 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none";

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
  const [isMobileViewport, setIsMobileViewport] = React.useState<boolean | null>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    setHost(window.location.host);
  }, []);

  React.useEffect(() => {
    const syncViewport = () => {
      setIsMobileViewport(window.innerWidth < 640);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  React.useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 8);
          ticking = false;
        });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
  const BrandIcon = brandIcons[brandIconIndex] ?? brandIcons[0];

  const navChipClass =
    "group ui-focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg bg-transparent px-2.5 py-1.5 text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--hover-state)] hover:text-[var(--text-primary)] active:bg-[var(--active-state)]";
  const navTriggerClass = `${navChipClass} h-8 text-sm font-medium`;
  const navIconClass = "text-[var(--text-secondary)] !opacity-100";

  const mobileActionTriggerClass =
    "group relative inline-flex h-8 w-full items-center justify-start gap-2 overflow-visible rounded-lg px-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-state)]";
  const mobileActionIconClass = "text-[var(--text-muted)] !opacity-100";

  const actionBtnClass =
    "alias-primary neu-btn-green group inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-mono text-xs font-medium no-underline";

  const actionBtnSecondaryClass =
    "group inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-1.5 font-mono text-xs font-medium text-[var(--text-secondary)] no-underline transition-colors duration-200 hover:bg-[var(--hover-state)] hover:text-[var(--text-primary)]";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-500 ${
          isScrolled ? "pt-3 sm:pt-4" : "pt-4 sm:pt-6"
        }`}
      >
        <div
          className="pointer-events-auto mx-auto grid w-full max-w-[1120px] grid-cols-[1fr_auto] items-center px-4 sm:grid-cols-[1fr_auto_1fr] sm:px-6"
          role="banner"
        >
          {/* ── LEFT: Host identity ── */}
          <div className="flex min-w-0 items-center justify-self-start">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-[var(--hover-state)]"
              aria-label="Home"
            >
              <span key={brandIconSwapKey} className="relative inline-flex shrink-0">
                <BrandIcon className="h-[18px] w-[18px] sm:h-5 sm:w-5 text-[var(--neu-green)] opacity-80 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="pointer-events-none absolute inset-0 rounded-full opacity-40 blur-[6px] bg-[var(--neu-green)]" />
              </span>
              <span className="truncate font-mono text-[13px] font-semibold tracking-tight text-[var(--text-primary)] sm:text-sm">
                {hostLabel}
              </span>
            </Link>
          </div>

          {/* ── CENTER: Navigation ── */}
          <nav
            aria-label="Primary"
            className="flex items-center justify-self-end sm:justify-self-center"
          >
            <div className="flex items-center gap-0.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-1.5 py-1 backdrop-blur-[24px] backdrop-saturate-[1.3]"
              style={{
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px -4px rgba(0,0,0,0.20)',
              }}
            >
              {isMobileViewport === false ? (
                <>
                  <BrowserAddonMenu
                    triggerClassName={navTriggerClass}
                    triggerIconClassName={navIconClass}
                  />
                  <ApiTokenDialog
                    onApiStatusChange={onApiStatusChange}
                    triggerClassName={navTriggerClass}
                    triggerIconClassName={navIconClass}
                  />
                  <DnsSetupMenu
                    triggerClassName={navTriggerClass}
                    triggerIconClassName={navIconClass}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className={navTriggerClass}>
                        <ScrollText className={`h-4 w-4 ${navIconClass}`} />
                        ToS
                        <ChevronDown className={`ml-0.5 h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180 ${navIconClass}`} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-44 p-1.5">
                      <DropdownMenuItem asChild className="cursor-pointer rounded-md">
                        <Link href="/privacy">
                          <ShieldCheck className="h-4 w-4 text-[var(--text-secondary)]" />
                          Privacy
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer rounded-md">
                        <Link href="/abuse">
                          <ShieldAlert className="h-4 w-4 text-[var(--text-secondary)]" />
                          Abuse
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="group inline-flex size-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--hover-state)] hover:text-[var(--text-primary)]"
                    aria-label="Open navigation menu"
                    title="Open navigation menu"
                  >
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Open navigation menu</span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 p-1.5 sm:w-48"
                >
                  {isMobileViewport === true ? (
                    <>
                      <div className="space-y-1 p-1">
                        <Link href="/console" className={mobileActionTriggerClass}>
                          <Terminal className={`h-4 w-4 ${mobileActionIconClass}`} />
                          Console
                        </Link>
                        <Link href="/dashboard" className={mobileActionTriggerClass}>
                          <Settings className={`h-4 w-4 ${mobileActionIconClass}`} />
                          Admin
                        </Link>
                      </div>

                      <DropdownMenuSeparator className="bg-[color:var(--hairline-border)]" />

                      <div className="space-y-1 p-1">
                        <ApiTokenDialog
                          onApiStatusChange={onApiStatusChange}
                          triggerClassName={mobileActionTriggerClass}
                          triggerIconClassName={mobileActionIconClass}
                        />
                        <DnsSetupMenu
                          triggerClassName={mobileActionTriggerClass}
                          triggerIconClassName={mobileActionIconClass}
                        />
                        <Link href="/privacy" className={mobileActionTriggerClass}>
                          <ShieldCheck className={`h-4 w-4 ${mobileActionIconClass}`} />
                          Privacy
                        </Link>
                        <Link href="/abuse" className={mobileActionTriggerClass}>
                          <ShieldAlert className={`h-4 w-4 ${mobileActionIconClass}`} />
                          Abuse
                        </Link>
                      </div>

                      <DropdownMenuSeparator className="bg-[color:var(--hairline-border)]" />
                    </>
                  ) : null}

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

          {/* ── RIGHT: Actions ── */}
          <div className="hidden min-w-0 items-center justify-self-end gap-2 sm:flex">
            {isMobileViewport === false ? (
              <>
                <Link href="/console" className={actionBtnClass}>
                  <Terminal className="h-3.5 w-3.5 opacity-80" />
                  Console
                </Link>
                <Link href="/dashboard" className={actionBtnSecondaryClass}>
                  <Settings className="h-3.5 w-3.5 opacity-80" />
                  Admin
                </Link>
              </>
            ) : null}
          </div>
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
