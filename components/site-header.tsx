"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Github,
  Info,
  ExternalLink,
  BookOpen,
  Menu,
  Zap,
  OctagonAlert,
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
import { AbuseMenu } from "@/components/abuse-menu";
import { PrivacyMenu } from "@/components/privacy-menu";
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
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";

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

export function SiteHeader() {
  const [host, setHost] = React.useState("");
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [brandIconIndex, setBrandIconIndex] = React.useState(() => Math.floor(Math.random() * brandIcons.length));
  const [brandIconSwapKey, setBrandIconSwapKey] = React.useState(0);

  React.useEffect(() => {
    setHost(window.location.host);
  }, []);

  React.useEffect(() => {
    if (brandIcons.length < 2) return;

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
  const hostBase = hostLabel.split(":")[0];
  const isOfficial = hostBase === "forward.haltman.io" || hostBase.endsWith(".haltman.io") || hostBase === "localhost";
  const brand = hostLabel;
  const BrandIcon = brandIcons[brandIconIndex] ?? brandIcons[0];

  return (
    <>
      <header className="sticky top-3 z-50 px-4 sm:top-4">
        <div className="relative mx-auto w-full max-w-3xl">
          <div className="pointer-events-none absolute inset-x-10 -top-7 h-20 rounded-full bg-white/10 opacity-40 blur-3xl" />

          <nav
            aria-label="Primary"
            className="relative flex h-14 items-center justify-between gap-3 rounded-xl border border-white/10 bg-gradient-to-b from-zinc-950/95 to-zinc-950/80 px-3 shadow-[0_14px_35px_-24px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:px-4"
          >
            <div className="flex min-w-0 items-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200 hover:bg-white/10"
                aria-label="Home"
              >
                <span
                  key={brandIconSwapKey}
                  className="inline-flex motion-safe:animate-[spin_620ms_cubic-bezier(0.22,1,0.36,1)_1]"
                >
                  <BrandIcon className="h-3.5 w-3.5 text-zinc-300 sm:h-4 sm:w-4 sm:text-zinc-200" />
                </span>
                <span className="truncate font-mono text-[12px] text-zinc-300 sm:font-sans sm:text-sm sm:font-medium sm:text-zinc-200">{brand}</span>
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden sm:block">
                <AbuseMenu />
              </div>
              <div className="hidden sm:block">
                <PrivacyMenu />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="group border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                    aria-label="Open navigation menu"
                    title="Open navigation menu"
                  >
                    <Menu className={`h-4 w-4 ${clickableIconClass}`} />
                    <span className="sr-only">Open navigation menu</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-44 border-white/10 bg-black/80 p-1 text-zinc-100 backdrop-blur-xl"
                >
                  <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100">
                    <Link
                      href="https://dev.haltman.io/mail-forwarding-selfhost/get-started"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <BookOpen className="h-4 w-4 text-zinc-300" />
                      Documentation
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100">
                    <Link
                      href="https://dev.haltman.io/api-reference/get-domains"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Zap className="h-4 w-4 text-zinc-300" />
                      API Reference
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100">
                    <Link
                      href="https://github.com/haltman-io/mail-forwarding"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Github className="h-4 w-4 text-zinc-300" />
                      Source Code
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100 sm:hidden">
                    <Link href="/privacy">
                      <ShieldCheck className="h-4 w-4 text-zinc-300" />
                      Privacy
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100 sm:hidden">
                    <Link href="/abuse">
                      <OctagonAlert className="h-4 w-4 text-zinc-300" />
                      Abuse
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem
                    className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100"
                    onSelect={(event) => {
                      event.preventDefault();
                      setAboutOpen(true);
                    }}
                  >
                    <Info className="h-4 w-4 text-zinc-300" />
                    About
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </header>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="w-[min(94vw,460px)] border-white/10 bg-black/85 p-4 text-zinc-100 backdrop-blur-xl sm:p-5">
          <DialogHeader>
            <DialogTitle>ABOUT THIS</DialogTitle>
            <DialogDescription>FREE EMAIL FORWARDING SERVICE :)</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-xs text-zinc-300">NO TRACKING. NO BLOAT.</p>

            <Separator className="bg-white/10" />

            <div className="space-y-1">
              <p className="text-xs text-zinc-400">REFERENCE</p>
              <Link
                href="https://www.thc.org/mail/"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 text-xs text-zinc-200 underline underline-offset-4 hover:text-zinc-100"
              >
                https://www.thc.org/mail/
                <ExternalLink className={`h-3.5 w-3.5 text-zinc-400 ${clickableIconClass}`} />
              </Link>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-zinc-400">ORIGINAL CONCEPT: Lou-Cipher (2022)</p>
              <Link
                href="https://github.com/Lou-Cipher"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 text-xs text-zinc-200 underline underline-offset-4 hover:text-zinc-100"
              >
                https://github.com/Lou-Cipher
                <ExternalLink className={`h-3.5 w-3.5 text-zinc-400 ${clickableIconClass}`} />
              </Link>
            </div>

            <Separator className="bg-white/10" />

            <p className="m-0 font-sans text-[11px] leading-[1.6] text-white/40">
              POWERED BY{" "}
              <strong className="font-semibold text-white/80">HALTMAN.IO</strong> &amp;{" "}
              <strong className="font-semibold text-white/80">THE HACKER&apos;S CHOICE</strong>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
