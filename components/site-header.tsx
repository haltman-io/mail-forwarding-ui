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
  Trophy,
  Chromium,
  Flame,
  HatGlasses,
  CircleHelp,
  Fingerprint,
  Skull,
  Terminal,
  Settings,
  User
} from "lucide-react";
import { ConsoleMenu } from "@/components/console-menu";
import { SetupMenu } from "@/components/setup-menu";
import { ApiMenu } from "@/components/api-menu";
import { DocsMenu } from "@/components/docs-menu";
import { ApiTokenDialog } from "@/components/api-token-dialog";
import { DnsSetupMenu } from "@/components/dns-setup-menu";
import {
  MobileNavSection,
  MobileNavExternalIndicator,
  MobileNavLinkIndicator,
  MobileNavSeparator,
  mobileNavItemClassName,
  mobileNavItemIconClassName,
  mobileNavL2ClassName,
  mobileNavL2IconClassName,
  mobileNavL3ClassName,
  mobileNavL3IconClassName,
} from "@/components/mobile-nav-section";


import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CHROME_EXTENSION_URL,
  FIREFOX_EXTENSION_URL,
} from "@/lib/browser-addon-links";
import {
  API_REFERENCE_URL,
  DOCUMENTATION_URL,
  SOURCE_CODE_URL,
} from "@/lib/site-links";

const clickableIconClass =
  "opacity-70 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none";
const newBadgeClassName =
  "ml-0.5 rounded bg-[rgb(var(--alias-accent-rgb)_/_0.15)] px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-wide text-[var(--neu-green)] uppercase";

type ApiStatus = "idle" | "connected" | "error";

type SiteHeaderProps = {
  onApiStatusChange?: (status: ApiStatus) => void;
};

export function SiteHeader({ onApiStatusChange }: SiteHeaderProps = {}) {
  const [host, setHost] = React.useState("");
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [isMobileViewport, setIsMobileViewport] = React.useState<boolean | null>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = React.useState<string | null>(null);

  React.useEffect(() => {
    setHost(window.location.host);
  }, []);

  React.useEffect(() => {
    const syncViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
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
    if (isMobileViewport !== false) {
      setOpenDesktopMenu(null);
    }
  }, [isMobileViewport]);

  const hostLabel = host ? host : "haltman.io";

  const isAllowedHost = React.useMemo(() => {
    return host === "mail.thc.org" || host === "forward.haltman.io" || host.startsWith("localhost");
  }, [host]);

  const navItemClass =
    "group ui-focus-ring inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-transparent px-2.5 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--hover-state)] hover:text-[var(--text-primary)] active:bg-[var(--active-state)]";
  const navIconClass = "text-[var(--text-secondary)] !opacity-100";

  const actionBtnClass =
    "alias-primary neu-btn-green group inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-mono text-xs font-medium no-underline";

  const closeMobileMenu = React.useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleDesktopMenuOpenChange = React.useCallback(
    (menuId: string) => (open: boolean) => {
      setOpenDesktopMenu((currentOpenMenu) => {
        if (open) {
          return menuId;
        }

        return currentOpenMenu === menuId ? null : currentOpenMenu;
      });
    },
    []
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-500 ${isScrolled ? "pt-3 md:pt-4" : "pt-4 md:pt-6"
          }`}
      >
        <div
          className={`pointer-events-auto mx-auto grid w-full max-w-[1120px] grid-cols-[1fr_auto] items-center px-4 md:grid-cols-[1fr_auto_1fr] md:px-6 rounded-2xl transition-all duration-500 ${isScrolled
              ? "bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-[24px] backdrop-saturate-[1.3] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] py-2"
              : "bg-transparent border border-transparent py-0"
            }`}
          role="banner"
        >
          {/* ── LEFT: Host identity ── */}
          <div className="flex min-w-0 max-w-[200px] items-center justify-self-start">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-[var(--hover-state)]"
              aria-label="Home"
            >
              <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center"
              >
                <HatGlasses className="h-[18px] w-[18px] text-[var(--neu-green)] opacity-80 transition-opacity duration-200 group-hover:opacity-100 md:h-5 md:w-5" />
              </span>
              <span className="truncate font-mono text-[13px] font-semibold tracking-tight text-[var(--text-primary)] md:text-sm">
                {hostLabel}
              </span>
            </Link>
          </div>

          {/* ── CENTER: Navigation ── */}
          <nav
            aria-label="Primary"
            className="flex shrink-0 items-center justify-self-end md:justify-self-center"
          >
            <div className="flex items-center gap-0.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-1.5 py-1 backdrop-blur-[24px] backdrop-saturate-[1.3]"
              style={{
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px -4px rgba(0,0,0,0.20)',
              }}
            >
              {isMobileViewport === false ? (
                <>
                  <ConsoleMenu
                    triggerClassName={navItemClass}
                    triggerIconClassName={navIconClass}
                    open={openDesktopMenu === "console"}
                    onOpenChange={handleDesktopMenuOpenChange("console")}
                  />
                  <SetupMenu
                    triggerClassName={navItemClass}
                    triggerIconClassName={navIconClass}
                    open={openDesktopMenu === "setup"}
                    onOpenChange={handleDesktopMenuOpenChange("setup")}
                  />
                  <ApiMenu
                    onApiStatusChange={onApiStatusChange}
                    triggerClassName={navItemClass}
                    triggerIconClassName={navIconClass}
                    open={openDesktopMenu === "api"}
                    onOpenChange={handleDesktopMenuOpenChange("api")}
                  />
                  <DocsMenu
                    onAboutSelect={() => {
                      setOpenDesktopMenu(null);
                      setAboutOpen(true);
                    }}
                    triggerClassName={navItemClass}
                    triggerIconClassName={navIconClass}
                    open={openDesktopMenu === "docs"}
                    onOpenChange={handleDesktopMenuOpenChange("docs")}
                  />
                  <Link href="/security" className={navItemClass}>
                    <ShieldCheck className="h-4 w-4 text-[var(--text-secondary)]" />
                    VDP
                  </Link>
                  <Link href="/hall-of-fame" className={navItemClass}>
                    <Trophy className="h-4 w-4 text-[var(--text-secondary)]" />
                    HoF
                    <span className={newBadgeClassName}>
                      New
                    </span>
                  </Link>
                </>
              ) : null}

              <div className="md:hidden">
                <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
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
                    className="max-h-[80vh] w-[min(92vw,320px)] overflow-y-auto p-2"
                  >
                    <div className="space-y-0.5">
                      {/* ── L1: Console (expandable) ── */}
                      <MobileNavSection label="Console">
                        <Link href="/console" className={mobileNavL2ClassName} onClick={closeMobileMenu}>
                          <Terminal className={mobileNavL2IconClassName} />
                          Alias
                          <MobileNavLinkIndicator />
                        </Link>
                        <Link href="/handle" className={mobileNavL2ClassName} onClick={closeMobileMenu}>
                          <Fingerprint className={mobileNavL2IconClassName} />
                          Handle
                          <MobileNavLinkIndicator />
                        </Link>
                      </MobileNavSection>

                      <MobileNavSeparator />

                      {/* ── L1: Setup (expandable) ── */}
                      <MobileNavSection label="Setup">
                        <DnsSetupMenu
                          triggerClassName={mobileNavL2ClassName}
                          triggerIconClassName={mobileNavL2IconClassName}
                        />
                        <MobileNavSection
                          label="Browser Extension"
                          nested
                          icon={<Chromium className={mobileNavL2IconClassName} />}
                        >
                          <Link
                            href={FIREFOX_EXTENSION_URL}
                            target="_blank"
                            rel="noreferrer"
                            className={mobileNavL3ClassName}
                            onClick={closeMobileMenu}
                          >
                            <Flame className={mobileNavL3IconClassName} />
                            Firefox Extension
                            <MobileNavExternalIndicator />
                          </Link>
                          <Link
                            href={CHROME_EXTENSION_URL}
                            target="_blank"
                            rel="noreferrer"
                            className={mobileNavL3ClassName}
                            onClick={closeMobileMenu}
                          >
                            <Chromium className={mobileNavL3IconClassName} />
                            Chrome Extension
                            <MobileNavExternalIndicator />
                          </Link>
                        </MobileNavSection>
                      </MobileNavSection>

                      <MobileNavSeparator />

                      {/* ── L1: API (expandable) ── */}
                      <MobileNavSection label="API">
                        <ApiTokenDialog
                          onApiStatusChange={onApiStatusChange}
                          triggerLabel="API Keys"
                          triggerClassName={mobileNavL2ClassName}
                          triggerIconClassName={mobileNavL2IconClassName}
                        />
                        <Link
                          href={API_REFERENCE_URL}
                          target="_blank"
                          rel="noreferrer"
                          className={mobileNavL2ClassName}
                          onClick={closeMobileMenu}
                        >
                          <Zap className={mobileNavL2IconClassName} />
                          API Reference
                          <MobileNavExternalIndicator />
                        </Link>
                      </MobileNavSection>

                      <MobileNavSeparator />

                      {/* ── L1: Docs (expandable) ── */}
                      <MobileNavSection label="Docs">
                        <Link
                          href={DOCUMENTATION_URL}
                          target="_blank"
                          rel="noreferrer"
                          className={mobileNavL2ClassName}
                          onClick={closeMobileMenu}
                        >
                          <BookOpen className={mobileNavL2IconClassName} />
                          Documentation
                          <MobileNavExternalIndicator />
                        </Link>
                        <Link
                          href={SOURCE_CODE_URL}
                          target="_blank"
                          rel="noreferrer"
                          className={mobileNavL2ClassName}
                          onClick={closeMobileMenu}
                        >
                          <Github className={mobileNavL2IconClassName} />
                          Source Code
                          <MobileNavExternalIndicator />
                        </Link>
                        <button
                          type="button"
                          className={mobileNavL2ClassName}
                          onClick={() => {
                            closeMobileMenu();
                            setAboutOpen(true);
                          }}
                        >
                          <Info className={mobileNavL2IconClassName} />
                          About
                          <MobileNavLinkIndicator />
                        </button>
                        <Link href="/faq" className={mobileNavL2ClassName} onClick={closeMobileMenu}>
                          <CircleHelp className={mobileNavL2IconClassName} />
                          FAQ
                          <MobileNavLinkIndicator />
                        </Link>
                        <Link href="/privacy" className={mobileNavL2ClassName} onClick={closeMobileMenu}>
                          <ShieldCheck className={mobileNavL2IconClassName} />
                          Privacy
                          <MobileNavLinkIndicator />
                        </Link>
                        <Link href="/abuse" className={mobileNavL2ClassName} onClick={closeMobileMenu}>
                          <ShieldAlert className={mobileNavL2IconClassName} />
                          Abuse
                          <MobileNavLinkIndicator />
                        </Link>
                        <Link href="/security" className={mobileNavL2ClassName} onClick={closeMobileMenu}>
                          <Skull className={mobileNavL2IconClassName} />
                          Security
                          <MobileNavLinkIndicator />
                        </Link>
                      </MobileNavSection>

                      <MobileNavSeparator />

                      <Link href="/hall-of-fame" className={mobileNavItemClassName} onClick={closeMobileMenu}>
                        <Trophy className={mobileNavItemIconClassName} />
                        HoF
                        <span className="ml-auto rounded bg-[rgb(var(--alias-accent-rgb)_/_0.15)] px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-wide text-[var(--neu-green)] uppercase">
                          New
                        </span>
                      </Link>

                      <MobileNavSeparator />

                      {/* ── L1: Admin ── */}
                      {isAllowedHost && (
                        <Link href="/dashboard" className={mobileNavItemClassName} onClick={closeMobileMenu}>
                          <Settings className={mobileNavItemIconClassName} />
                          Admin
                          <MobileNavLinkIndicator />
                        </Link>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </nav>

          {/* ── RIGHT: Actions ── */}
          <div className="hidden min-w-0 shrink-0 items-center justify-self-end gap-2 md:flex">
            {isMobileViewport === false && isAllowedHost ? (
              <>
                <Link href="/dashboard" className={actionBtnClass}>
                  <User className="h-3.5 w-3.5 opacity-80" />
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
