"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export function AbuseMenu() {
  const [open, setOpen] = React.useState(false);

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
        <div className="space-y-6 p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle>Abuse</DialogTitle>
            <DialogDescription>
              Policy on abuse of our tools and services.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 text-base leading-relaxed text-zinc-300">
            <p>
              We do not tolerate abuse of our tools or services. Please contact us if you
              have any concern about abuse.
            </p>
            <p>
              The tools we develop and services we provide are for research and educational
              purposes only. They are meant to be used for good purposes.
            </p>
            <p>
              THC and Haltman.IO is no place for mining-imbeciles, ransomware-idiots, DDoS-kiddos,
              revenge-hacking, greed, hate or criminal activities. We have no patience for this.
            </p>
          </div>

          <Separator className="bg-white/10" />

          <div className="space-y-3 rounded-xl border border-white/10 bg-black/30 p-5 text-center sm:p-6">
            <p className="text-2xl font-semibold leading-tight tracking-tight text-zinc-100 sm:text-3xl">
              We will respond to abuse requests and stop the abuse.
            </p>
            <p className="text-sm text-zinc-300 sm:text-base">
              (contact us at{" "}
              <Link
                href="mailto:members@proton.thc.org"
                className="underline underline-offset-4 hover:text-zinc-100"
              >
                members@proton.thc.org
              </Link>
              {" "}OR{" "}
              <Link
                href="mailto:root@haltman.io"
                className="underline underline-offset-4 hover:text-zinc-100"
              >
                root@haltman.io
              </Link>
              )
            </p>
          </div>

          <Separator className="bg-white/10" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
