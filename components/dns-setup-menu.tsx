"use client";

import * as React from "react";
import { AtSign, Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CheckDnsResponse,
  DnsOverallStatus,
  DnsRequestResponse,
  DnsStatus,
  EmailMissing,
  UiMissing,
  checkDns,
  requestEmail,
  requestUi,
} from "@/lib/dns-validation";
import { RE_DOMAIN } from "@/lib/domains";
import { badgeClasses, clampLower } from "@/lib/utils-mail";
import { useCopyFeedback } from "@/lib/use-copy-feedback";


type DnsDialogKind = "UI" | "EMAIL";

type CopyableInputRowProps = {
  id: string;
  value: string;
  label?: string;
  inputLabel: string;
  copyLabel: string;
  copiedId: string | null;
  onCopy: (id: string, value: string, label: string) => void;
};

const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";

const MIN_POLL_INTERVAL_MS = 10000;
const FALLBACK_POLL_INTERVAL_MS = 45000;
const MAX_POLL_INTERVAL_MS = 120000;
const POLL_ERROR_THRESHOLD = 3;
const POLL_ERROR_TOAST_COOLDOWN_MS = 60000;
const REQUEST_RETRY_COUNT = 2;
const REQUEST_RETRY_BASE_DELAY_MS = 600;
const REQUEST_RETRY_MAX_DELAY_MS = 4000;

function abortError() {
  const err = new Error("Aborted");
  (err as Error).name = "AbortError";
  return err;
}

function sleep(ms: number, signal?: AbortSignal) {
  if (!signal) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }

    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      reject(abortError());
    };

    signal.addEventListener("abort", onAbort);
  });
}

async function withRetry<T>(
  fn: () => Promise<T>,
  {
    retries,
    baseDelayMs,
    maxDelayMs,
    signal,
    shouldRetry,
  }: {
    retries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    signal?: AbortSignal;
    shouldRetry?: (error: any) => boolean;
  }
): Promise<T> {
  let attempt = 0;
  let delay = baseDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      if (err?.name === "AbortError") throw err;
      if (shouldRetry && !shouldRetry(err)) throw err;
      if (attempt >= retries) throw err;
      attempt += 1;
      await sleep(delay, signal);
      delay = Math.min(maxDelayMs, delay * 2);
    }
  }
}

function getStatusKind(status: DnsOverallStatus | DnsStatus | null) {
  if (status === "ACTIVE") return "ok";
  if (status === "FAILED" || status === "EXPIRED") return "bad";
  return "idle";
}

function formatTimeLabel(value?: string | null) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  return new Date(timestamp).toLocaleString();
}

function formatCopyValue(value?: string | null, fallback = "-") {
  const normalized = value?.trim();
  if (normalized) return normalized;
  return fallback;
}

type FoundEntry = {
  value: string;
  isCorrect: boolean;
};

function normalizeDnsName(value: string) {
  return value.trim().toLowerCase().replace(/\.+$/, "");
}

function normalizeTxtValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function getUiFoundEntries(item: UiMissing): FoundEntry[] {
  const expected = normalizeDnsName(item.expected);
  return item.found.map((value) => ({
    value,
    isCorrect: normalizeDnsName(value) === expected,
  }));
}

function getEmailFoundEntries(item: EmailMissing): FoundEntry[] {
  if (item.key === "MX") {
    const expectedHost = normalizeDnsName(item.expected.host);
    const expectedPriority = item.expected.priority;
    return item.found.map((entry) => ({
      value: `${entry.exchange} (priority ${entry.priority})`,
      isCorrect:
        normalizeDnsName(entry.exchange) === expectedHost &&
        entry.priority === expectedPriority,
    }));
  }

  const expected = normalizeTxtValue(item.expected);
  return item.found.map((value) => ({
    value,
    isCorrect: normalizeTxtValue(value) === expected,
  }));
}

function getRecordCardToneClass(foundEntries: FoundEntry[], fallbackOk: boolean) {
  if (!foundEntries.length) {
    return fallbackOk
      ? "border-emerald-500/45 bg-emerald-500/5"
      : "border-rose-500/45 bg-rose-500/5";
  }

  return foundEntries.every((entry) => entry.isCorrect)
    ? "border-emerald-500/45 bg-emerald-500/5"
    : "border-rose-500/45 bg-rose-500/5";
}

function getFoundEntryToneClass(isCorrect: boolean) {
  return isCorrect
    ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-200"
    : "border-rose-500/45 bg-rose-500/10 text-rose-200";
}

function FoundEntries({
  entries,
  foundTruncated,
}: {
  entries: FoundEntry[];
  foundTruncated: boolean;
}) {
  if (!entries.length) {
    return (
      <p className="mt-2 text-xs text-rose-300">
        Found: -
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-xs text-zinc-400">
        Found:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {entries.map((entry, index) => (
          <span
            key={`${entry.value}-${index}`}
            className={`inline-flex max-w-full items-center rounded-md border px-2 py-1 text-[11px] font-mono leading-none ${getFoundEntryToneClass(entry.isCorrect)}`}
            title={entry.value}
          >
            <span className="truncate">
              {entry.value}
            </span>
          </span>
        ))}
      </div>
      {foundTruncated ? (
        <p className="text-[11px] text-amber-300">
          Found list truncated by API.
        </p>
      ) : null}
    </div>
  );
}

function getOverallStatus(
  data: CheckDnsResponse | null,
  request: DnsRequestResponse | null,
  kind: DnsDialogKind
) {
  const typeStatus = kind === "UI" ? data?.ui?.status : data?.email?.status;
  return typeStatus ?? request?.status ?? data?.summary?.overall_status ?? null;
}

function getNextCheckAt(data: CheckDnsResponse | null, kind: DnsDialogKind) {
  if (!data) return null;
  const typeNext = kind === "UI" ? data.ui?.next_check_at : data.email?.next_check_at;
  return typeNext ?? data.summary?.next_check_at_min ?? null;
}

function shouldStopPolling(data: CheckDnsResponse | null, kind: DnsDialogKind) {
  if (!data) return false;
  const overall = data.summary?.overall_status ?? null;
  if (overall === "ACTIVE" || overall === "EXPIRED" || overall === "FAILED") return true;
  const typeStatus = kind === "UI" ? data.ui?.status : data.email?.status;
  return typeStatus === "ACTIVE" || typeStatus === "EXPIRED";
}

function CopyableInputRow({
  id,
  value,
  label,
  inputLabel,
  copyLabel,
  copiedId,
  onCopy,
}: CopyableInputRowProps) {
  const isCopied = copiedId === id;
  return (
    <div className="space-y-1 min-w-0">
      {label ? (
        <p className="text-[10px] uppercase tracking-wide text-zinc-500">
          {label}
        </p>
      ) : null}
      <div className="flex min-w-0 items-center gap-2">
        <Input
          value={value}
          readOnly
          disabled
          title={value}
          aria-label={inputLabel}
          className="min-w-0 flex-1 bg-black/30 text-xs font-mono text-zinc-200/90 disabled:cursor-default disabled:opacity-100 truncate"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="group h-8 w-8 shrink-0 border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => onCopy(id, value, copyLabel)}
          aria-label={`Copy ${copyLabel}`}
        >
          {isCopied ? (
            <Check className={`h-3.5 w-3.5 text-emerald-300 ${clickableIconClass}`} />
          ) : (
            <Copy className={`h-3.5 w-3.5 ${clickableIconClass}`} />
          )}
        </Button>
      </div>
    </div>
  );
}

function DnsValidationDialog({
  open,
  onOpenChange,
  kind,
  title,
  description,
  icon: Icon,
  closeGuard = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: DnsDialogKind;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  closeGuard?: boolean;
}) {
  const [target, setTarget] = React.useState("");
  const [token, setToken] = React.useState("");
  const [requestResponse, setRequestResponse] = React.useState<DnsRequestResponse | null>(null);
  const [checkResponse, setCheckResponse] = React.useState<CheckDnsResponse | null>(null);
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isPolling, setIsPolling] = React.useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = React.useState(false);
  const [showPollingIndicator, setShowPollingIndicator] = React.useState(false);

  const pollTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingIndicatorTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const lastPollAtRef = React.useRef(0);
  const pollTargetRef = React.useRef("");
  const openRef = React.useRef(open);
  const tokenRef = React.useRef("");
  const pollFnRef = React.useRef<() => void>(() => {});
  const confirmCloseBypass = React.useRef(false);
  const pollErrorCountRef = React.useRef(0);
  const lastErrorToastAtRef = React.useRef(0);

  const { copiedId, copyWithFeedback } = useCopyFeedback();

  React.useEffect(() => {
    openRef.current = open;
  }, [open]);

  React.useEffect(() => {
    tokenRef.current = token.trim();
  }, [token]);

  const resetPollErrors = React.useCallback(() => {
    pollErrorCountRef.current = 0;
    lastErrorToastAtRef.current = 0;
  }, []);

  const stopPolling = React.useCallback((resetInterval = true) => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (resetInterval) {
      lastPollAtRef.current = 0;
    }
    setIsPolling(false);
    if (resetInterval) {
      resetPollErrors();
    }
  }, [resetPollErrors]);

  React.useEffect(() => {
    if (open) return;
    stopPolling();
    setRequestResponse(null);
    setCheckResponse(null);
    setErrorText(null);
    setIsSubmitting(false);
    setConfirmCloseOpen(false);
    setShowPollingIndicator(false);
    confirmCloseBypass.current = false;
    pollTargetRef.current = "";
    if (pollingIndicatorTimerRef.current) {
      clearTimeout(pollingIndicatorTimerRef.current);
      pollingIndicatorTimerRef.current = null;
    }
  }, [open, stopPolling]);

  React.useEffect(() => {
    return () => {
      stopPolling();
      if (pollingIndicatorTimerRef.current) {
        clearTimeout(pollingIndicatorTimerRef.current);
        pollingIndicatorTimerRef.current = null;
      }
    };
  }, [stopPolling]);

  const scheduleNext = React.useCallback(
    (data: CheckDnsResponse) => {
      const nextCheckAt = getNextCheckAt(data, kind);
      let delay = FALLBACK_POLL_INTERVAL_MS;

      if (nextCheckAt) {
        const parsed = Date.parse(nextCheckAt);
        if (!Number.isNaN(parsed)) {
          delay = Math.max(0, parsed - Date.now());
        }
      }

      if (delay < MIN_POLL_INTERVAL_MS) delay = MIN_POLL_INTERVAL_MS;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      pollTimerRef.current = setTimeout(() => {
        pollFnRef.current();
      }, delay);
    },
    [kind]
  );

  const scheduleNextAfterError = React.useCallback((errorCount: number) => {
    const multiplier = Math.max(0, errorCount - 1);
    let delay = FALLBACK_POLL_INTERVAL_MS * Math.pow(2, multiplier);
    delay = Math.min(MAX_POLL_INTERVAL_MS, delay);
    if (delay < MIN_POLL_INTERVAL_MS) delay = MIN_POLL_INTERVAL_MS;
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    pollTimerRef.current = setTimeout(() => {
      pollFnRef.current();
    }, delay);
  }, []);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!closeGuard) {
        onOpenChange(nextOpen);
        return;
      }

      if (!nextOpen) {
        if (confirmCloseBypass.current) {
          confirmCloseBypass.current = false;
          onOpenChange(false);
          return;
        }
        setConfirmCloseOpen(true);
        return;
      }

      confirmCloseBypass.current = false;
      onOpenChange(true);
    },
    [closeGuard, onOpenChange]
  );

  const requestClose = React.useCallback(() => {
    if (!closeGuard) {
      onOpenChange(false);
      return;
    }
    setConfirmCloseOpen(true);
  }, [closeGuard, onOpenChange]);

  const confirmClose = React.useCallback(() => {
    confirmCloseBypass.current = true;
    setConfirmCloseOpen(false);
    handleOpenChange(false);
  }, [handleOpenChange]);

  const pollCheck = React.useCallback(async () => {
    const targetValue = pollTargetRef.current;
    if (!targetValue) return;

    const now = Date.now();
    const elapsed = now - lastPollAtRef.current;
    if (elapsed < MIN_POLL_INTERVAL_MS) {
      const wait = MIN_POLL_INTERVAL_MS - elapsed;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      pollTimerRef.current = setTimeout(() => {
        pollFnRef.current();
      }, wait);
      return;
    }

    lastPollAtRef.current = now;
    setIsPolling(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await checkDns(targetValue, tokenRef.current || undefined, controller.signal);
      if (!openRef.current) return;
      setCheckResponse(data);
      resetPollErrors();
      setErrorText(null);
      if (data.normalized_target) {
        pollTargetRef.current = data.normalized_target;
      }

      if (shouldStopPolling(data, kind)) {
        setIsPolling(false);
        return;
      }

      scheduleNext(data);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      if (!openRef.current) return;
      const message = String(err?.message ?? "Request failed.");
      const errorCount = pollErrorCountRef.current + 1;
      pollErrorCountRef.current = errorCount;
      setErrorText(message);
      if (errorCount >= POLL_ERROR_THRESHOLD) {
        const now = Date.now();
        if (now - lastErrorToastAtRef.current >= POLL_ERROR_TOAST_COOLDOWN_MS) {
          const title = err?.status ? "DNS API unavailable" : "Network error";
          toast.error(title, { description: "Still retrying DNS checks in the background." });
          lastErrorToastAtRef.current = now;
        }
      }
      scheduleNextAfterError(errorCount);
    } finally {
      if (openRef.current) setIsPolling(false);
    }
  }, [kind, resetPollErrors, scheduleNext, scheduleNextAfterError]);

  React.useEffect(() => {
    pollFnRef.current = () => {
      void pollCheck();
    };
  }, [pollCheck]);

  const onStartValidation = React.useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const normalized = clampLower(target);

      if (!RE_DOMAIN.test(normalized)) {
        setErrorText("Enter a plain domain like example.com.");
        return;
      }

      stopPolling(false);
      setErrorText(null);
      setRequestResponse(null);
      setCheckResponse(null);
      resetPollErrors();
      pollTargetRef.current = normalized;

      setIsSubmitting(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await withRetry(
          () =>
            kind === "UI"
              ? requestUi(normalized, controller.signal)
              : requestEmail(normalized, controller.signal),
          {
            retries: REQUEST_RETRY_COUNT,
            baseDelayMs: REQUEST_RETRY_BASE_DELAY_MS,
            maxDelayMs: REQUEST_RETRY_MAX_DELAY_MS,
            signal: controller.signal,
            shouldRetry: (error) => {
              const status = Number(error?.status);
              if (!status) return true;
              if (status === 429 || status >= 500) return true;
              return false;
            },
          }
        );

        if (!openRef.current) return;

        setRequestResponse(response);
        pollTargetRef.current = response.target || normalized;
        await pollCheck();
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        if (!openRef.current) return;
        const requestError = err;

        if (kind === "UI" || kind === "EMAIL") {
          try {
            const resumed = await checkDns(
              normalized,
              tokenRef.current || undefined,
              controller.signal
            );

            if (!openRef.current) return;

            setRequestResponse(null);
            setCheckResponse(resumed);
            resetPollErrors();
            setErrorText(null);
            pollTargetRef.current =
              resumed.normalized_target || resumed.target || normalized;

            toast("Found existing DNS check", {
              description: "Resuming status polling for this domain.",
            });

            if (!shouldStopPolling(resumed, kind)) {
              scheduleNext(resumed);
            }
            return;
          } catch (resumeErr: any) {
            if (resumeErr?.name === "AbortError") return;
          }
        }

        const message = String(requestError?.message ?? "Request failed.");
        setErrorText(message);
        if (requestError?.status) {
          toast.error("API error", { description: message });
        } else {
          toast.error("Network error", { description: message });
        }
      } finally {
        if (openRef.current) setIsSubmitting(false);
      }
    },
    [kind, pollCheck, resetPollErrors, scheduleNext, stopPolling, target]
  );

  const status = getOverallStatus(checkResponse, requestResponse, kind);
  const statusKind = getStatusKind(status);
  const nextCheckLabel = formatTimeLabel(getNextCheckAt(checkResponse, kind));

  React.useEffect(() => {
    if (isPolling) {
      setShowPollingIndicator(true);
      if (pollingIndicatorTimerRef.current) {
        clearTimeout(pollingIndicatorTimerRef.current);
        pollingIndicatorTimerRef.current = null;
      }
      return;
    }

    if (!showPollingIndicator) return;
    if (pollingIndicatorTimerRef.current) {
      clearTimeout(pollingIndicatorTimerRef.current);
    }
    pollingIndicatorTimerRef.current = setTimeout(() => {
      setShowPollingIndicator(false);
    }, 2000);
  }, [isPolling, showPollingIndicator]);

  const uiMissing = kind === "UI" ? (checkResponse?.ui?.missing ?? []) : [];
  const emailMissing = kind === "EMAIL" ? (checkResponse?.email?.missing ?? []) : [];

  const showResults = Boolean(requestResponse || checkResponse);
  const submitDisabled = isSubmitting || !target.trim();
  const defaultRecordName = formatCopyValue(
    checkResponse?.normalized_target ?? checkResponse?.target ?? target
  );
  const pendingRecordsViewportClass =
    status === "PENDING" ? "max-h-[min(46vh,420px)] overflow-y-auto pr-1" : "";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950/95"
          onEscapeKeyDown={
            closeGuard
              ? (event) => {
                  event.preventDefault();
                  requestClose();
                }
              : undefined
          }
          onInteractOutside={
            closeGuard
              ? (event) => {
                  event.preventDefault();
                  requestClose();
                }
              : undefined
          }
        >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${clickableIconClass}`} />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onStartValidation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${kind}-target`}>Domain</Label>
            <Input
              id={`${kind}-target`}
              placeholder="example.com"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              className="bg-black/30"
            />
            <p className="text-xs text-zinc-400">
              Plain domain only (no scheme or path).
            </p>
          </div>

          {/*
          <div className="space-y-2">
            <Label htmlFor={`${kind}-token`}>API token (optional)</Label>
            <Input
              id={`${kind}-token`}
              placeholder="x-api-key"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              className="bg-black/30"
            />
            <p className="text-xs text-zinc-400">
              Only needed when your server requires an API key for checkdns.
            </p>
          </div>
          */}

          <DialogFooter className="sm:justify-between">
            <Button
              type="submit"
              className="group"
              disabled={submitDisabled}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
                  Starting...
                </>
              ) : (
                "Start validation"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="group border-white/10 bg-white/5 hover:bg-white/10"
              onClick={requestClose}
            >
              Close
            </Button>
          </DialogFooter>
        </form>

        {errorText && (
          <Alert variant="destructive" className="border-white/10 bg-black/30">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-zinc-300">
              {errorText}
            </AlertDescription>
          </Alert>
        )}

        {showResults && (
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${badgeClasses(statusKind)}`}
                >
                  {status ?? "PENDING"}
                </span>
                {showPollingIndicator && (
                  <span
                    className="text-[11px] font-semibold tracking-wide text-orange-400 animate-[breathe-opacity_450ms_ease-in-out_infinite_alternate]"
                    style={{ willChange: "opacity" }}
                    aria-live="polite"
                  >
                    Checking…
                  </span>
                )}
              </div>
              {nextCheckLabel && (
                <span className="text-xs text-zinc-400">
                  Next check: {nextCheckLabel}
                </span>
              )}
            </div>

            <Separator className="my-3 bg-white/10" />

            {kind === "UI" ? (
              <>
                {uiMissing.length ? (
                  <div className={pendingRecordsViewportClass}>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {uiMissing.map((item, index) => {
                        const recordType = formatCopyValue(item.type, item.key);
                        const recordName = formatCopyValue(item.name, defaultRecordName);
                        const foundEntries = getUiFoundEntries(item);
                        const cardToneClass = getRecordCardToneClass(foundEntries, item.ok);

                        return (
                          <div
                            key={`${item.key}-${index}`}
                            className={`min-w-0 rounded-lg border p-3 ${cardToneClass}`}
                          >
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                              {item.key}
                            </p>
                            <div className="mt-2 space-y-2">
                              <CopyableInputRow
                                id={`${kind}-type-${index}`}
                                value={recordType}
                                label="Type"
                                inputLabel="DNS record type"
                                copyLabel={`${item.key} record type`}
                                copiedId={copiedId}
                                onCopy={copyWithFeedback}
                              />
                              <CopyableInputRow
                                id={`${kind}-name-${index}`}
                                value={recordName}
                                label="Name"
                                inputLabel="DNS record name"
                                copyLabel={`${item.key} record name`}
                                copiedId={copiedId}
                                onCopy={copyWithFeedback}
                              />
                              <CopyableInputRow
                                id={`${kind}-expected-${index}`}
                                value={item.expected}
                                label="Expected"
                                inputLabel="Expected value"
                                copyLabel={`${item.key} expected value`}
                                copiedId={copiedId}
                                onCopy={copyWithFeedback}
                              />
                            </div>
                            <FoundEntries
                              entries={foundEntries}
                              foundTruncated={item.found_truncated}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">
                    No missing records reported yet.
                  </p>
                )}
              </>
            ) : (
              <>
                {emailMissing.length ? (
                  <div className={pendingRecordsViewportClass}>
                    <div className="grid gap-3">
                      {emailMissing.map((item, index) => {
                        const recordType = formatCopyValue(item.type, item.key);
                        const recordName = formatCopyValue(item.name, defaultRecordName);

                        if (item.key === "MX") {
                          const foundEntries = getEmailFoundEntries(item);
                          const cardToneClass = getRecordCardToneClass(foundEntries, item.ok);
                          return (
                            <div
                              key={`${item.key}-${index}`}
                              className={`min-w-0 rounded-lg border p-3 ${cardToneClass}`}
                            >
                              <p className="text-xs uppercase tracking-wide text-zinc-500">
                                MX
                              </p>
                              <div className="mt-2 space-y-2">
                                <CopyableInputRow
                                  id={`${kind}-mx-type-${index}`}
                                  value={recordType}
                                  label="Type"
                                  inputLabel="MX record type"
                                  copyLabel="MX record type"
                                  copiedId={copiedId}
                                  onCopy={copyWithFeedback}
                                />
                                <CopyableInputRow
                                  id={`${kind}-mx-name-${index}`}
                                  value={recordName}
                                  label="Name"
                                  inputLabel="MX record name"
                                  copyLabel="MX record name"
                                  copiedId={copiedId}
                                  onCopy={copyWithFeedback}
                                />
                                <CopyableInputRow
                                  id={`${kind}-mx-host-${index}`}
                                  value={item.expected.host}
                                  label="Host"
                                  inputLabel="MX host"
                                  copyLabel="MX host"
                                  copiedId={copiedId}
                                  onCopy={copyWithFeedback}
                                />
                                <CopyableInputRow
                                  id={`${kind}-mx-priority-${index}`}
                                  value={String(item.expected.priority)}
                                  label="Priority"
                                  inputLabel="MX priority"
                                  copyLabel="MX priority"
                                  copiedId={copiedId}
                                  onCopy={copyWithFeedback}
                                />
                              </div>
                              <FoundEntries
                                entries={foundEntries}
                                foundTruncated={item.found_truncated}
                              />
                            </div>
                          );
                        }

                        const foundEntries = getEmailFoundEntries(item);
                        const cardToneClass = getRecordCardToneClass(foundEntries, item.ok);

                        return (
                          <div
                            key={`${item.key}-${index}`}
                            className={`min-w-0 rounded-lg border p-3 ${cardToneClass}`}
                          >
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                              {item.key}
                            </p>
                            <div className="mt-2 space-y-2">
                              <CopyableInputRow
                                id={`${kind}-${item.key.toLowerCase()}-type-${index}`}
                                value={recordType}
                                label="Type"
                                inputLabel={`${item.key} record type`}
                                copyLabel={`${item.key} record type`}
                                copiedId={copiedId}
                                onCopy={copyWithFeedback}
                              />
                              <CopyableInputRow
                                id={`${kind}-${item.key.toLowerCase()}-name-${index}`}
                                value={recordName}
                                label="Name"
                                inputLabel={`${item.key} record name`}
                                copyLabel={`${item.key} record name`}
                                copiedId={copiedId}
                                onCopy={copyWithFeedback}
                              />
                              <CopyableInputRow
                                id={`${kind}-${item.key.toLowerCase()}-${index}`}
                                value={item.expected}
                                label="Expected"
                                inputLabel="Expected value"
                                copyLabel={`${item.key} expected value`}
                                copiedId={copiedId}
                                onCopy={copyWithFeedback}
                              />
                            </div>
                            <FoundEntries
                              entries={foundEntries}
                              foundTruncated={item.found_truncated}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">
                    No missing records reported yet.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
      </Dialog>

      {closeGuard && (
        <AlertDialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close DNS setup?</AlertDialogTitle>
              <AlertDialogDescription>
                Closing now will interrupt your DNS verification progress.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep editing</AlertDialogCancel>
              <AlertDialogAction onClick={confirmClose}>
                Close anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <style>{`
        @keyframes breathe-opacity {
          from { opacity: 0.35; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

export function DnsSetupMenu() {
  const [emailOpen, setEmailOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="group relative h-8 overflow-visible border-white/10 bg-white/5 px-2.5 text-zinc-200 hover:bg-white/10"
        aria-label="Add domain"
        title="Use your domain for aliases"
        onClick={() => setEmailOpen(true)}
      >
        <AtSign className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
        Add domain
      </Button>

      <DnsValidationDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        kind="EMAIL"
        title="Use your domain for aliases"
        description="Add MX/SPF/DMARC records so we can forward mail for your domain."
        icon={AtSign}
        closeGuard
      />
    </>
  );
}
