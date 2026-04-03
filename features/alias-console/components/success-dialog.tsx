import * as React from "react";
import { Check, CheckCircle2, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import type { Intent, MappingSnapshot } from "@/features/alias-console/types/alias-console.types";

type SuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent: Intent | null;
  mapping: MappingSnapshot | null;
  copiedId: string | null;
  onCopyAlias: () => void;
};

const COPY_ID = "success-dialog-alias";

export function SuccessDialog({
  open,
  onOpenChange,
  intent,
  mapping,
  copiedId,
  onCopyAlias,
}: SuccessDialogProps) {
  const isCreate = intent === "subscribe";
  const copied = copiedId === COPY_ID;

  const accentColor = isCreate ? "var(--neu-green)" : "var(--neu-amber)";
  const accentGlow = isCreate ? "var(--neu-green-glow)" : "var(--neu-amber-glow)";
  const accentSoft = isCreate ? "var(--neu-green-soft)" : "var(--neu-amber-soft)";
  const iconClass = isCreate
    ? "text-[var(--alias-accent)]"
    : "text-amber-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[22rem] p-0"
        style={{
          borderTop: `2px solid ${accentColor}`,
          boxShadow: `0 -4px 16px ${accentGlow}`,
        }}
      >
        <div className="space-y-4 px-6 pt-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: accentSoft }}
              >
                <CheckCircle2 className={`h-5 w-5 ${iconClass}`} />
              </div>
              <div className="space-y-1">
                <DialogTitle>
                  {isCreate ? "Alias created successfully" : "Alias removed successfully"}
                </DialogTitle>
                <DialogDescription>
                  {isCreate
                    ? `Your new alias is now forwarding mail to ${mapping?.to || "your destination"}.`
                    : `The alias ${mapping?.alias || ""} has been permanently removed.`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isCreate && mapping?.alias && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[var(--text-muted)]">Your alias address</p>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--hairline-border)] bg-[var(--hover-state)] px-3 py-2.5">
                <span className="flex-1 select-all font-mono text-sm tracking-[0.01em] text-[var(--text-primary)]">
                  {mapping.alias}
                </span>
                <button
                  type="button"
                  onClick={onCopyAlias}
                  className="ui-focus-ring group shrink-0 rounded-md p-1.5 text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--hover-state)] hover:text-[var(--text-secondary)]"
                  aria-label="Copy alias email"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-[var(--alias-accent)]" />
                  ) : (
                    <Copy className="h-4 w-4 opacity-70 transition-opacity duration-200 group-hover:opacity-100" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <Separator className="bg-[color:var(--hairline-border)]" />

        <DialogFooter className="px-6 pb-6">
          <Button
            type="button"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
