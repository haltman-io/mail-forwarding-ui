"use client";

import * as React from "react";
import { AlertTriangle, Check, CheckCircle2, Copy, KeyRound, Loader2 } from "lucide-react";

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { API_HOST } from "@/lib/api-host";
import { useCopyFeedback } from "@/lib/use-copy-feedback";
import { validateMailboxEmail } from "@/lib/utils-mail";
import { toast } from "sonner";

type ApiStatus = "idle" | "connected" | "error";
type TokenRequestState = "idle" | "loading" | "awaiting_confirmation" | "success";

type ConfirmResponse = {
  ok?: boolean;
  confirmed?: boolean;
  action?: string;
  email?: string;
  token?: string;
  token_type?: string;
  expires_in_days?: number;
  error?: string;
};

function sanitizeOtpToken(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

function sanitizeDaysInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 2);
}

const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";

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

function describeConfirmError(data: ConfirmResponse | null, fallback: string | null, status?: number) {
  const error = typeof data?.error === "string" ? data.error : null;

  if (!error) {
    if (status === 429) {
      return { title: "Rate limited", description: fallback ?? "Too many requests. Try again soon." };
    }
    return {
      title: "Confirmation failed",
      description: fallback ?? "The API returned an unexpected response.",
    };
  }

  switch (error) {
    case "invalid_token":
      return { title: "Invalid code", description: "Code must be exactly 6 digits." };
    case "invalid_or_expired":
      return { title: "Code invalid or expired", description: "Request a new confirmation code and try again." };
    case "rate_limited":
      return { title: "Rate limited", description: "Too many requests. Try again soon." };
    default:
      return { title: "Confirmation failed", description: `Error: ${error}` };
  }
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
  const [confirmCode, setConfirmCode] = React.useState("");
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [confirmSubmitted, setConfirmSubmitted] = React.useState(false);
  const [confirmErrorText, setConfirmErrorText] = React.useState<string | null>(null);
  const [feedbackText, setFeedbackText] = React.useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = React.useState("");
  const [confirmedToken, setConfirmedToken] = React.useState("");
  const [confirmedExpiresInDays, setConfirmedExpiresInDays] = React.useState<number | null>(null);
  const autoConfirmAttemptRef = React.useRef<string | null>(null);
  const { copiedId, copyWithFeedback } = useCopyFeedback();

  const toastSuccess = React.useCallback((title: string, description?: string) => {
    toast.success(title, { description, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> });
  }, []);

  const toastError = React.useCallback((title: string, description?: string) => {
    toast.error(title, { description, icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> });
  }, []);

  const tokenBusy = tokenState === "loading";
  const otpBusy = confirmLoading;
  const otpStyleClass = "*:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-10 *:data-[slot=input-otp-slot]:text-lg *:data-[slot=input-otp-slot]:border-white/15 *:data-[slot=input-otp-slot]:bg-black/30 *:data-[slot=input-otp-slot]:text-zinc-100 *:data-[slot=input-otp-slot]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]";

  const resetDialogState = React.useCallback(() => {
    setTokenState("idle");
    setConfirmCode("");
    setConfirmLoading(false);
    setConfirmSubmitted(false);
    setConfirmErrorText(null);
    setFeedbackText(null);
    setConfirmedEmail("");
    setConfirmedToken("");
    setConfirmedExpiresInDays(null);
  }, []);

  const submitConfirmToken = React.useCallback(async (tokenInput: string) => {
    const token = sanitizeOtpToken(tokenInput);
    if (!/^\d{6}$/.test(token)) {
      setConfirmErrorText("Confirmation code must be exactly 6 digits.");
      return;
    }

    setConfirmLoading(true);
    setTokenState("loading");
    try {
      const res = await fetch(`${API_HOST}/api/credentials/confirm?${new URLSearchParams({ token }).toString()}`, {
        method: "GET",
      });

      const rawText = await res.text();
      let data: ConfirmResponse | null = null;
      if (rawText) {
        try {
          data = JSON.parse(rawText) as ConfirmResponse;
        } catch {
          data = null;
        }
      }

      const success =
        res.ok &&
        data?.ok === true &&
        data?.confirmed === true &&
        typeof data?.token === "string" &&
        typeof data?.email === "string";

      if (success) {
        const email = data?.email ?? "";
        const tokenValue = data?.token ?? "";
        const expiresInDays =
          typeof data?.expires_in_days === "number" && Number.isFinite(data.expires_in_days)
            ? data.expires_in_days
            : null;

        onApiStatusChange?.("connected");
        setConfirmErrorText(null);
        setFeedbackText(null);
        setConfirmedEmail(email);
        setConfirmedToken(tokenValue);
        setConfirmedExpiresInDays(expiresInDays);
        setTokenState("success");
        toastSuccess("API key confirmed", email ? `Email: ${email}` : undefined);
        return;
      }

      const errorInfo = describeConfirmError(data, rawText || null, res.status);
      onApiStatusChange?.("error");
      setConfirmErrorText(errorInfo.description);
      setTokenState("awaiting_confirmation");
      toastError(errorInfo.title, errorInfo.description);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      onApiStatusChange?.("error");
      setConfirmErrorText(`Network error: ${message}`);
      setTokenState("awaiting_confirmation");
      toastError("Network error", message);
    } finally {
      setConfirmLoading(false);
    }
  }, [onApiStatusChange, toastError, toastSuccess]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = sanitizeOtpToken(params.get("confirm_token") ?? params.get("token") ?? "");
    if (!token) return;
    if (autoConfirmAttemptRef.current === token) return;
    autoConfirmAttemptRef.current = token;

    params.delete("confirm_token");
    params.delete("token");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);

    setOpen(true);
    setTokenState("awaiting_confirmation");
    setConfirmCode(token);
    setConfirmSubmitted(true);
    void submitConfirmToken(token);
  }, [submitConfirmToken]);

  async function onCreateToken(e: React.FormEvent) {
    e.preventDefault();
    setFeedbackText(null);
    setConfirmErrorText(null);

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
        setTokenState("awaiting_confirmation");
        setFeedbackText("Check your email for the 6-digit confirmation code.");
        toastSuccess("Confirmation email sent", email ? `Email: ${email}` : undefined);
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

  async function onConfirmCode(e: React.FormEvent) {
    e.preventDefault();
    setConfirmSubmitted(true);
    setConfirmErrorText(null);
    await submitConfirmToken(confirmCode);
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="group relative overflow-visible border-white/10 bg-white/5 hover:bg-white/10"
          title="Create a free token to automate alias management via API."
          aria-label="Create a free token to automate alias management via API."
        >
          <KeyRound className="mr-2 h-4 w-4" />
          API Token
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[22rem] border-white/10 bg-zinc-950/95 p-0">
        {tokenState !== "awaiting_confirmation" && tokenState !== "success" ? (
          <>
            <div className="space-y-4 px-6 pt-6">
              <DialogHeader>
                <DialogTitle>Free API Token</DialogTitle>
                <DialogDescription>
                  Create an API token for alias automation.{" "}
                  <a
                    href={`${API_HOST}/docs`}
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
                    className="bg-black/30"
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
                    className="bg-black/30"
                  />
                </div>

                {feedbackText ? <p className="text-xs text-zinc-300">{feedbackText}</p> : null}
              </form>
            </div>

            <Separator className="my-4 bg-white/10" />

            <DialogFooter className="flex flex-col gap-2 px-6 pb-6">
              <Button form="api-token-register-form" type="submit" disabled={tokenBusy} className="group w-full">
                {tokenBusy ? (
                  <>
                    <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
                    Generating...
                  </>
                ) : (
                  "Generate token"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : tokenState === "awaiting_confirmation" ? (
          <>
            <div className="space-y-4 px-6 pt-6">
              <DialogHeader>
                <DialogTitle>Confirm email code</DialogTitle>
                <DialogDescription>
                  We sent a 6-digit verification code to your email. Enter it below to finish.
                </DialogDescription>
              </DialogHeader>

              <form id="api-token-confirm-otp-form" onSubmit={onConfirmCode} className="space-y-3">
                <div className="space-y-2">
                  <Label>Verification code</Label>
                  <InputOTP
                    maxLength={6}
                    value={confirmCode}
                    className="w-full"
                    containerClassName="w-full justify-start gap-2"
                    onChange={(value) => {
                      setConfirmCode(sanitizeOtpToken(value));
                      if (confirmErrorText) setConfirmErrorText(null);
                    }}
                  >
                    <InputOTPGroup className={otpStyleClass}>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator className="mx-2 text-zinc-500" />
                    <InputOTPGroup className={otpStyleClass}>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <p className="text-xs text-zinc-400">Enter the 6-digit code from your email.</p>
                </div>

                {confirmErrorText && (
                  <Alert variant="destructive" className="border-white/10 bg-black/30">
                    <AlertTitle>Confirmation failed</AlertTitle>
                    <AlertDescription className="text-zinc-300">{confirmErrorText}</AlertDescription>
                  </Alert>
                )}

                {confirmSubmitted && !/^\d{6}$/.test(confirmCode.trim()) ? (
                  <p className="text-xs text-rose-300">Confirmation code must be exactly 6 digits.</p>
                ) : null}
              </form>
            </div>

            <Separator className="my-4 bg-white/10" />

            <DialogFooter className="flex flex-col gap-2 px-6 pb-6">
              <Button form="api-token-confirm-otp-form" type="submit" className="group w-full" disabled={otpBusy}>
                {otpBusy ? (
                  <>
                    <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
                    Confirming…
                  </>
                ) : (
                  "Confirm code"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 px-6 pt-6">
              <DialogHeader>
                <DialogTitle>API key activated</DialogTitle>
                <DialogDescription>
                  Copy and save your key now.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400">Email</p>
                  <div className="rounded-md border border-white/10 bg-black/30 p-3 font-mono text-xs text-zinc-200 break-all">
                    {confirmedEmail || "-"}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-zinc-400">API key</p>
                  <div className="rounded-md border border-white/10 bg-black/30 p-3 font-mono text-xs text-zinc-200 break-all">
                    {confirmedToken || "-"}
                  </div>
                </div>

                {confirmedExpiresInDays !== null ? (
                  <p className="text-xs text-zinc-400">Valid for {confirmedExpiresInDays} days.</p>
                ) : null}
              </div>
            </div>

            <Separator className="my-4 bg-white/10" />

            <DialogFooter className="flex flex-col gap-2 px-6 pb-6">
              <Button
                type="button"
                variant="outline"
                className="group w-full border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => copyWithFeedback("api-token-email", confirmedEmail, "Email")}
                disabled={!confirmedEmail}
              >
                {copiedId === "api-token-email" ? (
                  <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
                ) : (
                  <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                )}
                <CopyLabel copied={copiedId === "api-token-email"} label="Copy email" />
              </Button>

              <Button
                type="button"
                className="group w-full"
                onClick={() => copyWithFeedback("api-token-value", confirmedToken, "API key")}
                disabled={!confirmedToken}
              >
                {copiedId === "api-token-value" ? (
                  <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
                ) : (
                  <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                )}
                <CopyLabel copied={copiedId === "api-token-value"} label="Copy API key" />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
