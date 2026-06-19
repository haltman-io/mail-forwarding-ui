"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  KeyRound,
  Loader2,
  MailCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ApiCredentialItem,
  CredentialResponse,
  boolFromApi,
  confirmCredentialAction,
  describeCredentialError,
  normalizeConfirmationToken,
} from "@/lib/api-credentials";
import { safeDateLabel } from "@/lib/utils";

function formatMaybeDate(value?: string | null) {
  if (!value) return "-";
  return safeDateLabel(value);
}

function ResultTable({ items }: { items: ApiCredentialItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.025)] px-4 py-3 text-center text-xs text-[var(--text-muted)]">
        No active API keys were returned.
      </p>
    );
  }

  return (
    <div className="max-h-[220px] overflow-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14 pl-3 text-xs text-[var(--text-muted)]">ID</TableHead>
            <TableHead className="text-xs text-[var(--text-muted)]">Status</TableHead>
            <TableHead className="pr-3 text-xs text-[var(--text-muted)]">Expires</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-[var(--hover-state)]">
              <TableCell className="pl-3 font-mono text-xs tabular-nums text-[var(--text-secondary)]">
                {item.id}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Badge variant="fancy" color={boolFromApi(item.active) ? "emerald" : "red"}>
                    {boolFromApi(item.active) ? "active" : "inactive"}
                  </Badge>
                  {boolFromApi(item.automatic_renew) ? (
                    <Badge variant="fancy" color="sky">
                      auto
                    </Badge>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="pr-3 text-xs text-[var(--text-secondary)]">
                {formatMaybeDate(item.expires_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ConfirmApiPage() {
  const [token, setToken] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<CredentialResponse | null>(null);

  React.useEffect(() => {
    const initialToken = normalizeConfirmationToken(
      new URLSearchParams(window.location.search).get("token") ?? "",
    );
    if (!initialToken) return;

    const frame = window.requestAnimationFrame(() => setToken(initialToken));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedToken = normalizeConfirmationToken(token);
    if (normalizedToken.length !== 6) {
      setError("Enter the six-digit confirmation code.");
      return;
    }

    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const response = await confirmCredentialAction(normalizedToken);
      if (response.ok && response.data) {
        setResult(response.data);
      } else {
        setError(describeCredentialError(response, "Confirmation failed."));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copyToken() {
    if (!result?.token) return;
    await navigator.clipboard.writeText(result.token);
    toast.success("API key copied", {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    });
  }

  return (
    <main className="relative isolate min-h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 50% 14%, rgb(var(--alias-accent-rgb) / 0.10), transparent 28%),
              radial-gradient(circle at 18% 22%, rgb(var(--alias-accent-rgb) / 0.05), transparent 20%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 18%)
            `,
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--alias-accent-rgb)_/_0.24)] to-transparent" />
        <div className="absolute left-1/2 top-20 h-52 w-52 -translate-x-1/2 rounded-full bg-[rgb(var(--alias-accent-rgb)_/_0.08)] blur-[120px]" />
      </div>

      <div className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className="alias-console-surface neu-accent-bar relative w-full max-w-[520px] rounded-2xl">
          <div className="border-b border-[rgba(255,255,255,0.06)] px-7 pt-6 pb-5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgb(var(--alias-accent-rgb)_/_0.18)] bg-[rgb(var(--alias-accent-rgb)_/_0.08)]">
                <MailCheck className="h-3.5 w-3.5 text-[var(--neu-green)]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
                  Confirm API action
                </h1>
                <p className="text-[11px] leading-4 text-[var(--text-muted)]">
                  POST confirmation only
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-7 py-6">
            {result ? (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgb(var(--alias-accent-rgb)_/_0.20)] bg-[rgb(var(--alias-accent-rgb)_/_0.08)]">
                    <CheckCircle2 className="h-5 w-5 text-[var(--neu-green)]" />
                  </div>
                  <div className="flex flex-col gap-1.5 text-center">
                    <p className="text-[14px] font-medium text-[var(--text-primary)]">
                      Confirmed
                    </p>
                    {result.email ? (
                      <p className="font-mono text-[11px] text-[var(--text-muted)]">
                        {result.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                {result.token ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.025)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[var(--text-primary)]">API key</p>
                      <Button type="button" size="sm" variant="outline" onClick={copyToken}>
                        <Clipboard className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <code className="block overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.06)] bg-black/20 p-3 font-mono text-xs text-[var(--text-secondary)]">
                      {result.token}
                    </code>
                  </div>
                ) : null}

                {Array.isArray(result.items) ? <ResultTable items={result.items} /> : null}

                {result.action === "api_credentials_destroy_all_confirm" ? (
                  <div className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.025)] p-3">
                    <span className="text-sm text-[var(--text-secondary)]">Deleted keys</span>
                    <Badge variant="fancy" color="red">
                      {result.deleted_count ?? 0}
                    </Badge>
                  </div>
                ) : null}

                <Link href="/">
                  <Button className="alias-primary neu-btn-green group h-11 w-full rounded-xl font-mono text-sm font-semibold tracking-[0.02em]">
                    Back home
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <p className="text-[13px] leading-[1.7] text-[var(--text-secondary)]">
                  Confirming creates, lists, or destroys API keys depending on the pending e-mail action.
                </p>

                {error ? (
                  <Alert variant="destructive">
                    <AlertTriangle />
                    <AlertTitle>Confirmation failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="api-confirm-token"
                    className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase"
                  >
                    <KeyRound className="h-3 w-3" />
                    Confirmation code
                  </label>
                  <InputOTP
                    id="api-confirm-token"
                    maxLength={6}
                    value={token}
                    onChange={(value) => setToken(normalizeConfirmationToken(value))}
                    disabled={busy}
                    containerClassName="justify-center"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  type="submit"
                  disabled={token.length !== 6 || busy}
                  className="alias-primary neu-btn-green group h-11 w-full rounded-xl font-mono text-sm font-semibold tracking-[0.02em]"
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Confirm
                    </>
                  )}
                </Button>

                <Link
                  href="/"
                  className="flex w-full items-center justify-center gap-2 font-mono text-[11px] tracking-[0.06em] text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text-secondary)]"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back home
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
