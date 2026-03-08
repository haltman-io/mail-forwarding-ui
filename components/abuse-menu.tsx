"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type AbuseMenuProps = {
  triggerClassName?: string;
  triggerIconClassName?: string;
};

export function AbuseMenu({ triggerClassName, triggerIconClassName }: AbuseMenuProps = {}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (pathname === "/abuse") setOpen(true);
  }, [pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "group ui-focus-ring inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-sm font-medium",
            triggerClassName ?? "ui-smooth ui-surface-pressed text-[var(--text-muted)] hover:border-[color:color-mix(in_oklch,var(--hairline-border)_58%,white_42%)]"
          )}
          aria-label="Abuse policy"
          title="Abuse"
        >
          <ShieldAlert className={cn("h-4 w-4", triggerIconClassName)} />
          Abuse
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[min(94vw,920px)] max-w-[920px] overflow-y-auto border-[var(--hairline-border)] bg-[var(--surface-elevated)] p-0">
        <div className="space-y-5 p-6 sm:p-8">
          <DialogHeader className="space-y-0">
            <DialogTitle className="font-mono text-sm uppercase tracking-[0.08em] text-[var(--text-primary)]">
              ABUSE POLICY
            </DialogTitle>
          </DialogHeader>

          <Separator className="bg-[var(--hover-state)]" />

          <p className="overflow-x-auto whitespace-nowrap font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
            THIS SYSTEM IS NOT A CRIME PLATFORM.
          </p>

          <Separator className="bg-[var(--hover-state)]" />

          <section aria-labelledby="abuse-scope" className="space-y-3 font-mono text-sm leading-[1.4] text-[var(--text-secondary)]">
            <h2 id="abuse-scope" className="sr-only">Scope</h2>
            <p>TOOLS PROVIDED HERE ARE FOR RESEARCH AND EDUCATIONAL USE.</p>
            <p>IF YOU TURN THEM INTO WEAPONS, YOU ARE ON YOUR OWN.</p>
            <p>WE DO NOT PROTECT THEM.</p>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          <section aria-labelledby="abuse-prohibited" className="space-y-3 font-mono text-sm leading-[1.4] text-[var(--text-primary)]">
            <h2 id="abuse-prohibited" className="sr-only">Prohibited</h2>
            <ul className="space-y-3">
              <li>NO RANSOMWARE.</li>
              <li>NO BOTNETS.</li>
              <li>NO DDOS.</li>
              <li>NO FRAUD.</li>
              <li>NO &quot;REVENGE&quot;.</li>
              <li>NO EXCUSES.</li>
            </ul>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          <section aria-labelledby="abuse-enforcement" className="space-y-3 font-mono text-sm leading-[1.4] text-[var(--text-secondary)]">
            <h2 id="abuse-enforcement" className="sr-only">Enforcement</h2>
            <p>WE DO NOT HOST CRIMINAL OPERATIONS.</p>
            <p>VALID ABUSE REPORTS WILL BE REVIEWED.</p>
            <p>CONFIRMED ABUSE WILL BE TERMINATED.</p>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          <section aria-labelledby="abuse-report-channels" className="space-y-3">
            <h2
              id="abuse-report-channels"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]"
            >
              REPORT CHANNELS
            </h2>
            <div className="select-text space-y-3 font-mono text-sm leading-[1.4] text-[var(--text-primary)]">
              <p>
                REPORT:{" "}
                <a
                  href="mailto:members@proton.thc.org"
                  className="underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  members@proton.thc.org
                </a>
              </p>
              <p>
                ALT:{" "}
                <a
                  href="mailto:root@haltman.io"
                  className="underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  root@haltman.io
                </a>
              </p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
