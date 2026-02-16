"use client";

import * as React from "react";
import { Check, Copy, KeyRound, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";
import { API_HOST } from "@/lib/api-host";
import { useCopyFeedback } from "@/lib/use-copy-feedback";
import { safeJson, validateMailboxEmail } from "@/lib/utils-mail";

type ApiResponse = Record<string, unknown>;
type ApiStatus = "idle" | "connected" | "error";
type TokenRequestState = "idle" | "loading" | "success" | "error";

const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";
const staticIconClass = "cursor-default";
const codeBlockClass =
  "overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-200/90 tracking-[0.01em] tabular-nums";

function CopyLabel({ copied, label }: { copied: boolean; label: string }) {
  return (
    <span className="inline-grid">
      <span
        className={`col-start-1 row-start-1 transition-opacity duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] ${copied ? "opacity-0" : "opacity-100"}`}
      >
        {label}
      </span>
      <span
        className={`col-start-1 row-start-1 transition-opacity duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] ${copied ? "opacity-100" : "opacity-0"}`}
      >
        Copied
      </span>
    </span>
  );
}

export function ApiTokenDialog({
  onApiStatusChange,
}: {
  onApiStatusChange?: (status: ApiStatus) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [apiEmail, setApiEmail] = React.useState("");
  const [apiDays, setApiDays] = React.useState("30");
  const [tokenState, setTokenState] = React.useState<TokenRequestState>("idle");
  const [tokenOk, setTokenOk] = React.useState<boolean | null>(null);
  const [tokenPayload, setTokenPayload] = React.useState<ApiResponse | null>(null);
  const [tokenErrorText, setTokenErrorText] = React.useState<string | null>(null);
  const [showApiSafety, setShowApiSafety] = React.useState(false);

  const { copiedId, copyWithFeedback } = useCopyFeedback();
  const tokenResetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem("mf_api_token_safety_hidden");
      setShowApiSafety(dismissed !== "1");
    } catch {
      setShowApiSafety(true);
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setTokenOk(null);
    setTokenPayload(null);
    setTokenErrorText(null);
    if (tokenResetTimer.current) clearTimeout(tokenResetTimer.current);
    setTokenState("idle");
  }, [open]);

  React.useEffect(() => {
    return () => {
      if (tokenResetTimer.current) clearTimeout(tokenResetTimer.current);
    };
  }, []);

  const tokenBusy = tokenState === "loading" || tokenState === "success";

  const setTokenStateNow = React.useCallback((state: TokenRequestState) => {
    if (tokenResetTimer.current) clearTimeout(tokenResetTimer.current);
    setTokenState(state);
  }, []);

  const setTokenStateTransient = React.useCallback(
    (state: TokenRequestState, next: TokenRequestState = "idle", delay = 1500) => {
      if (tokenResetTimer.current) clearTimeout(tokenResetTimer.current);
      setTokenState(state);
      tokenResetTimer.current = setTimeout(() => setTokenState(next), delay);
    },
    []
  );

  function resetTokenResult() {
    setTokenOk(null);
    setTokenPayload(null);
    setTokenErrorText(null);
    setTokenStateNow("idle");
  }

  function dismissApiSafety() {
    setShowApiSafety(false);
    try {
      window.localStorage.setItem("mf_api_token_safety_hidden", "1");
    } catch {
      // ignore storage errors
    }
  }

  async function onCreateToken(e: React.FormEvent) {
    e.preventDefault();
    resetTokenResult();

    const emailValidation = validateMailboxEmail(apiEmail);
    const days = Number.parseInt(apiDays, 10);

    if (!emailValidation.ok) {
      setTokenOk(false);
      setTokenErrorText("Valid email is required (local@domain, max 254, strict DNS domain).");
      return;
    }
    const email = emailValidation.value;

    if (!Number.isFinite(days) || days < 1 || days > 90) {
      setTokenOk(false);
      setTokenErrorText("Validity days must be between 1 and 90.");
      return;
    }

    setTokenStateNow("loading");
    try {
      const res = await fetch(`${API_HOST}/api/credentials/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, days }),
      });
      const data = (await res.json()) as ApiResponse;
      const success = res.ok && (data as any)?.ok !== false;

      setTokenOk(success);
      setTokenPayload(data);
      if (success) {
        onApiStatusChange?.("connected");
        setTokenStateTransient("success");
      } else {
        onApiStatusChange?.("error");
        setTokenErrorText("Request failed. See response below.");
        setTokenStateTransient("error");
        toast.error("API error", { description: "Token request failed." });
      }
    } catch (err: any) {
      const message = String(err?.message ?? err);
      onApiStatusChange?.("error");
      setTokenOk(false);
      setTokenErrorText(`Network error: ${message}`);
      setTokenPayload({ ok: false, error: "network_error", detail: message });
      setTokenStateTransient("error");
      toast.error("Network error", { description: message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="group relative overflow-visible border-white/10 bg-white/5 hover:bg-white/10"
          title="Create a free token to automate alias management via API."
          aria-label="Create a free token to automate alias management via API."
        >
          <KeyRound className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
          Generate API Token
        </Button>
      </DialogTrigger>

      <DialogContent className="border-white/10 bg-zinc-950/95">
        <DialogHeader>
          <DialogTitle>Free API Token</DialogTitle>
          <DialogDescription>
            A token lets you create aliases for your own email without re-verifying ownership each time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">❌ Without API</p>
              <p className="mt-2 text-sm text-zinc-300">
                You need to verify your email for each new alias address you create.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <p className="text-xs uppercase tracking-wide text-zinc-500">✅ With API</p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                <li>You need to verify your email for 1 time only.</li>
                <li>All your aliases will be created without email address confirmation.</li>
              </ul>
            </div>
          </div>

          {showApiSafety && (
            <Alert className="border-white/10 bg-black/30">
              <AlertTitle className="flex items-center gap-2">
                <ShieldAlert className={`h-4 w-4 ${staticIconClass}`} />
                Security note
              </AlertTitle>
              <AlertDescription className="flex flex-col gap-3 text-zinc-300">
                <span>
                  Never share your API token. Anyone with it can create aliases for your inbox.
                </span>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={dismissApiSafety}
                  >
                    Got it
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={onCreateToken} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
                  className="bg-black/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-days">Token validity (days)</Label>
                <Input
                  id="api-days"
                  type="number"
                  min={1}
                  max={90}
                  placeholder="30"
                  value={apiDays}
                  onChange={(e) => setApiDays(e.target.value)}
                  className="bg-black/30"
                />
                <p className="text-xs text-zinc-400">Choose 1-90 days.</p>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-zinc-400">
                We'll email a one-time confirmation link (15 min) to view the token.
              </p>
              <Button type="submit" className="group" disabled={tokenBusy}>
                {tokenState === "loading" ? (
                  <>
                    <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
                    Requesting...
                  </>
                ) : tokenState === "success" ? (
                  <>
                    <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
                    Confirmed
                  </>
                ) : (
                  "Generate token"
                )}
              </Button>
            </DialogFooter>
          </form>

          {tokenOk !== null && (
            <Alert variant={tokenOk ? "default" : "destructive"} className="border-white/10 bg-black/30">
              <AlertTitle className="flex items-center gap-2">
                {tokenOk ? (
                  <ShieldCheck className={`h-4 w-4 ${staticIconClass}`} />
                ) : (
                  <ShieldAlert className={`h-4 w-4 ${staticIconClass}`} />
                )}
                {tokenOk ? "Check your email" : "Error"}
              </AlertTitle>
              <AlertDescription className="text-zinc-300">
                {tokenOk ? (
                  <>
                    We sent a confirmation link to your email. Open it within 15 minutes to reveal the token.
                  </>
                ) : (
                  <>{tokenErrorText ?? "The API returned an error response. See the JSON below."}</>
                )}
              </AlertDescription>
            </Alert>
          )}

          {tokenPayload && (
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-200">Response payload</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="group border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() =>
                    copyWithFeedback("token-json", safeJson(tokenPayload), "Token response JSON")
                  }
                >
                  {copiedId === "token-json" ? (
                    <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
                  ) : (
                    <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                  )}
                  <CopyLabel copied={copiedId === "token-json"} label="Copy JSON" />
                </Button>
              </div>

              <Separator className="my-3 bg-white/10" />

              <pre className={codeBlockClass}>
                {safeJson(tokenPayload)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
