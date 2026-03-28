"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_HOST } from "@/lib/api-host";
import { validateMailboxEmail } from "@/lib/utils-mail";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ApiStatus = "idle" | "connected" | "error";
type TokenRequestState = "idle" | "loading";

function sanitizeDaysInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 2);
}

const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";

export function ApiTokenDialog({
  onApiStatusChange,
  triggerClassName,
  triggerIconClassName,
  triggerLabel = "API Token",
}: {
  onApiStatusChange?: (status: ApiStatus) => void;
  triggerClassName?: string;
  triggerIconClassName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [apiEmail, setApiEmail] = React.useState("");
  const [apiDays, setApiDays] = React.useState("30");
  const [tokenState, setTokenState] = React.useState<TokenRequestState>("idle");
  const [feedbackText, setFeedbackText] = React.useState<string | null>(null);

  const toastSuccess = React.useCallback((title: string, description?: string) => {
    toast.success(title, { description, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> });
  }, []);

  const toastError = React.useCallback((title: string, description?: string) => {
    toast.error(title, { description, icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> });
  }, []);

  const tokenBusy = tokenState === "loading";

  const resetDialogState = React.useCallback(() => {
    setTokenState("idle");
    setFeedbackText(null);
    setApiEmail("");
    setApiDays("30");
  }, []);

  async function onCreateToken(e: React.FormEvent) {
    e.preventDefault();
    setFeedbackText(null);

    const emailValidation = validateMailboxEmail(apiEmail);
    const days = Number.parseInt(apiDays, 10);

    if (!emailValidation.ok) {
      setFeedbackText("Enter a valid email address.");
      return;
    }
    const email = emailValidation.value;

    if (!Number.isFinite(days) || days < 1 || days > 90) {
      setFeedbackText("Validity must be between 1 and 90 days.");
      return;
    }

    setTokenState("loading");
    try {
      const res = await fetch(`${API_HOST}/api/credentials/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, days }),
      });
      const data = (await res.json()) as { ok?: boolean; confirmation?: { sent?: boolean } };
      const success = res.ok && data?.ok !== false;

      if (success) {
        onApiStatusChange?.("connected");
        setOpen(false);
        resetDialogState();
        toastSuccess(
          "Confirmation email sent",
          `We sent a confirmation email to ${email}. Open the link in that message to finish creating your API key.`
        );
      } else {
        onApiStatusChange?.("error");
        setFeedbackText("Request failed. Try again.");
        toastError("Request failed", "Try again in a moment.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      onApiStatusChange?.("error");
      setFeedbackText(`Network error: ${message}`);
      toastError("Network error", message);
    } finally {
      setTokenState((current) => (current === "loading" ? "idle" : current));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetDialogState();
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "group relative inline-flex items-center gap-2 overflow-visible rounded-lg text-sm font-medium",
            triggerClassName ?? "h-8 justify-center px-2.5 border border-[var(--hairline-border)] bg-[var(--hover-state)] text-[var(--text-primary)] hover:bg-[var(--hover-state)]"
          )}
          title="Create a free token to automate alias management via API."
          aria-label="Create a free token to automate alias management via API."
        >
          <KeyRound className={cn("h-4 w-4", triggerIconClassName ?? "text-[var(--text-secondary)]")} />
          {triggerLabel}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] border-[var(--hairline-border)] bg-[var(--surface-elevated)] p-0">
        <div className="space-y-4 px-6 pt-6">
          <DialogHeader>
            <DialogTitle>Free API Token</DialogTitle>
            <DialogDescription>
              Create an API token for alias automation.{" "}
              <a
                href={`${API_HOST}/api/docs`}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                API Docs
              </a>
            </DialogDescription>
          </DialogHeader>

          <form id="api-token-register-form" onSubmit={onCreateToken} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="api-email">Email</Label>
              <Input
                id="api-email"
                type="email"
                placeholder="you@proton.me"
                value={apiEmail}
                onChange={(e) => setApiEmail(e.target.value)}
                autoCapitalize="none"
                spellCheck={false}
                className="bg-[var(--surface-pressed)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-days">Validity (days)</Label>
              <Input
                id="api-days"
                type="number"
                min={1}
                max={90}
                value={apiDays}
                onChange={(e) => setApiDays(sanitizeDaysInput(e.target.value))}
                className="bg-[var(--surface-pressed)]"
              />
            </div>

            {feedbackText ? <p className="text-xs text-[var(--text-secondary)]">{feedbackText}</p> : null}
          </form>
        </div>

        <DialogFooter className="flex flex-col gap-2 px-6 pb-6 pt-4">
          <Button form="api-token-register-form" type="submit" disabled={tokenBusy} className="group w-full">
            {tokenBusy ? (
              <>
                <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
                Sending...
              </>
            ) : (
              "Send confirmation email"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
