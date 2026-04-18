"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PrivacyPolicyContent } from "@/components/privacy-policy-content";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { privacyPolicyDocument } from "@/lib/privacy-policy";
import { cn } from "@/lib/utils";

type PrivacyMenuProps = {
  triggerClassName?: string;
};

export function PrivacyMenu({ triggerClassName }: PrivacyMenuProps = {}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "group ui-focus-ring inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-sm font-medium",
            triggerClassName ??
              "ui-smooth ui-surface-pressed text-[var(--text-muted)] hover:border-[color:color-mix(in_oklch,var(--hairline-border)_58%,white_42%)]",
          )}
          aria-label="Privacy policy"
          title="Privacy"
        >
          Privacy
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[min(94vw,920px)] max-w-[920px] overflow-y-auto border-[var(--hairline-border)] bg-[var(--surface-elevated)] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Privacy policy</DialogTitle>
          <DialogDescription>
            Current privacy policy loaded from the shared policy source.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex items-center justify-end">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.04em] text-[var(--neu-green)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]"
            >
              Open dedicated page
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <PrivacyPolicyContent document={privacyPolicyDocument} variant="dialog" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
