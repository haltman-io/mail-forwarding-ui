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

import type { HandleIntent, HandleSnapshot } from "@/features/handle-console/types/handle-console.types";
import { intentLabel } from "@/features/handle-console/utils/handle-console.utils";

type HandleSuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent: HandleIntent | null;
  snapshot: HandleSnapshot | null;
  copiedId: string | null;
  onCopyHandle: () => void;
};

const COPY_ID = "success-dialog-handle";

function getDialogInfo(intent: HandleIntent | null, snapshot: HandleSnapshot | null) {
  switch (intent) {
    case "subscribe":
      return {
        title: "Handle claimed successfully",
        description: `Your handle "${snapshot?.handle ?? ""}" is now forwarding mail to ${snapshot?.to || "your destination"}.`,
        showHandle: true,
        accentType: "green" as const,
      };
    case "unsubscribe":
      return {
        title: "Handle removed successfully",
        description: `The handle "${snapshot?.handle ?? ""}" has been deactivated. The name remains permanently reserved.`,
        showHandle: false,
        accentType: "amber" as const,
      };
    case "domain_disable":
      return {
        title: "Domain disabled",
        description: `Emails to ${snapshot?.handle ?? ""}@${snapshot?.domain ?? ""} will now be rejected.`,
        showHandle: false,
        accentType: "amber" as const,
      };
    case "domain_enable":
      return {
        title: "Domain enabled",
        description: `Emails to ${snapshot?.handle ?? ""}@${snapshot?.domain ?? ""} will now be forwarded again.`,
        showHandle: false,
        accentType: "green" as const,
      };
    default:
      return {
        title: "Action completed",
        description: "The operation was successful.",
        showHandle: false,
        accentType: "green" as const,
      };
  }
}

export function HandleSuccessDialog({
  open,
  onOpenChange,
  intent,
  snapshot,
  copiedId,
  onCopyHandle,
}: HandleSuccessDialogProps) {
  const info = getDialogInfo(intent, snapshot);
  const copied = copiedId === COPY_ID;

  const isGreen = info.accentType === "green";
  const accentColor = isGreen ? "var(--neu-green)" : "var(--neu-amber)";
  const accentGlow = isGreen ? "var(--neu-green-glow)" : "var(--neu-amber-glow)";
  const accentSoft = isGreen ? "var(--neu-green-soft)" : "var(--neu-amber-soft)";
  const iconClass = isGreen ? "text-[var(--alias-accent)]" : "text-amber-500";

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
                <DialogTitle>{info.title}</DialogTitle>
                <DialogDescription>{info.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {info.showHandle && snapshot?.handle && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[var(--text-muted)]">Your handle</p>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--hairline-border)] bg-[var(--hover-state)] px-3 py-2.5">
                <span className="flex-1 select-all font-mono text-sm tracking-[0.01em] text-[var(--text-primary)]">
                  {snapshot.handle}
                </span>
                <button
                  type="button"
                  onClick={onCopyHandle}
                  className="ui-focus-ring group shrink-0 rounded-md p-1.5 text-[var(--text-muted)] transition-colors duration-150 hover:bg-[var(--hover-state)] hover:text-[var(--text-secondary)]"
                  aria-label="Copy handle"
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
