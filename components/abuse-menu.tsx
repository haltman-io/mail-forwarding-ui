"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export function AbuseMenu() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (pathname === "/abuse") setOpen(true);
  }, [pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="group h-8 border-white/10 bg-white/5 px-2.5 text-zinc-200 hover:bg-white/10"
          aria-label="Abuse policy"
          title="Abuse"
        >
          Abuse
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[min(94vw,920px)] max-w-[920px] overflow-y-auto border-white/10 bg-zinc-950/95 p-0">
        <div className="space-y-5 p-6 sm:p-8">
          <DialogHeader className="space-y-0">
            <DialogTitle className="font-mono text-sm uppercase tracking-[0.08em] text-zinc-100">
              ABUSE POLICY
            </DialogTitle>
          </DialogHeader>

          <Separator className="bg-white/10" />

          <p className="overflow-x-auto whitespace-nowrap font-mono text-xs uppercase tracking-[0.08em] text-zinc-500">
            THIS SYSTEM IS NOT A CRIME PLATFORM.
          </p>

          <Separator className="bg-white/10" />

          <section aria-labelledby="abuse-scope" className="space-y-3 font-mono text-sm leading-[1.4] text-zinc-300">
            <h2 id="abuse-scope" className="sr-only">Scope</h2>
            <p>TOOLS PROVIDED HERE ARE FOR RESEARCH AND EDUCATIONAL USE.</p>
            <p>IF YOU TURN THEM INTO WEAPONS, YOU ARE ON YOUR OWN.</p>
            <p>WE DO NOT PROTECT THEM.</p>
          </section>

          <Separator className="bg-white/10" />

          <section aria-labelledby="abuse-prohibited" className="space-y-3 font-mono text-sm leading-[1.4] text-zinc-200">
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

          <Separator className="bg-white/10" />

          <section aria-labelledby="abuse-enforcement" className="space-y-3 font-mono text-sm leading-[1.4] text-zinc-300">
            <h2 id="abuse-enforcement" className="sr-only">Enforcement</h2>
            <p>WE DO NOT HOST CRIMINAL OPERATIONS.</p>
            <p>VALID ABUSE REPORTS WILL BE REVIEWED.</p>
            <p>CONFIRMED ABUSE WILL BE TERMINATED.</p>
          </section>

          <Separator className="bg-white/10" />

          <section aria-labelledby="abuse-report-channels" className="space-y-3">
            <h2
              id="abuse-report-channels"
              className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500"
            >
              REPORT CHANNELS
            </h2>
            <div className="select-text space-y-3 font-mono text-sm leading-[1.4] text-zinc-200">
              <p>
                REPORT:{" "}
                <a
                  href="mailto:members@proton.thc.org"
                  className="underline underline-offset-4 hover:text-zinc-100"
                >
                  members@proton.thc.org
                </a>
              </p>
              <p>
                ALT:{" "}
                <a
                  href="mailto:root@haltman.io"
                  className="underline underline-offset-4 hover:text-zinc-100"
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
