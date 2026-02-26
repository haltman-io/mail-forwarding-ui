import * as React from "react";
import { toast } from "sonner";

import type { CheckDnsResponse, DnsRequestResponse } from "@/lib/dns-validation";
import { RE_DOMAIN } from "@/lib/domains";
import { clampLower } from "@/lib/utils-mail";
import {
  FALLBACK_POLL_INTERVAL_MS,
  MAX_POLL_INTERVAL_MS,
  MIN_POLL_INTERVAL_MS,
  POLL_ERROR_THRESHOLD,
  POLL_ERROR_TOAST_COOLDOWN_MS,
  fetchDnsStatus,
  requestDnsValidation,
} from "@/features/dns-setup-menu/services/dns-setup-menu.service";
import {
  formatCopyValue,
  formatTimeLabel,
  getNextCheckAt,
  getOverallStatus,
  getStatusKind,
  prioritizePendingRecords,
  shouldStopPolling,
} from "@/features/dns-setup-menu/utils/dns-setup-menu.utils";
import type { DnsValidationDialogProps } from "@/features/dns-setup-menu/types/dns-setup-menu.types";

type UseDnsValidationControllerArgs = Pick<
  DnsValidationDialogProps,
  "open" | "onOpenChange" | "closeGuard"
>;

export function useDnsValidationController({
  open,
  onOpenChange,
  closeGuard,
}: UseDnsValidationControllerArgs) {
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

  const closeGuardEnabled = Boolean(closeGuard);

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
      const nextCheckAt = getNextCheckAt(data);
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
    []
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
      if (!closeGuardEnabled) {
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
    [closeGuardEnabled, onOpenChange]
  );

  const requestClose = React.useCallback(() => {
    if (!closeGuardEnabled) {
      onOpenChange(false);
      return;
    }
    setConfirmCloseOpen(true);
  }, [closeGuardEnabled, onOpenChange]);

  const confirmClose = React.useCallback(() => {
    confirmCloseBypass.current = true;
    setConfirmCloseOpen(false);
    handleOpenChange(false);
  }, [handleOpenChange]);

  const handleDone = React.useCallback(() => {
    confirmCloseBypass.current = true;
    onOpenChange(false);
  }, [onOpenChange]);

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
      const data = await fetchDnsStatus(targetValue, tokenRef.current || undefined, controller.signal);
      if (!openRef.current) return;
      setCheckResponse(data);
      resetPollErrors();
      setErrorText(null);
      if (data.normalized_target) {
        pollTargetRef.current = data.normalized_target;
      }

      if (shouldStopPolling(data)) {
        setIsPolling(false);
        return;
      }

      scheduleNext(data);
    } catch (err: unknown) {
      if ((err as { name?: string } | null)?.name === "AbortError") return;
      if (!openRef.current) return;
      const message = String((err as { message?: unknown } | null)?.message ?? "Request failed.");
      const errorCount = pollErrorCountRef.current + 1;
      pollErrorCountRef.current = errorCount;
      setErrorText(message);
      if (errorCount >= POLL_ERROR_THRESHOLD) {
        const now = Date.now();
        if (now - lastErrorToastAtRef.current >= POLL_ERROR_TOAST_COOLDOWN_MS) {
          const status = (err as { status?: unknown } | null)?.status;
          const title = status ? "DNS API unavailable" : "Network error";
          toast.error(title, { description: "Still retrying DNS checks in the background." });
          lastErrorToastAtRef.current = now;
        }
      }
      scheduleNextAfterError(errorCount);
    } finally {
      if (openRef.current) setIsPolling(false);
    }
  }, [resetPollErrors, scheduleNext, scheduleNextAfterError]);

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
        const response = await requestDnsValidation(normalized, controller.signal);

        if (!openRef.current) return;

        setRequestResponse(response);
        pollTargetRef.current = response.target || normalized;
        await pollCheck();
      } catch (err: unknown) {
        if ((err as { name?: string } | null)?.name === "AbortError") return;
        if (!openRef.current) return;
        const requestError = err;

        {
          try {
            const resumed = await fetchDnsStatus(
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

            if (!shouldStopPolling(resumed)) {
              scheduleNext(resumed);
            }
            return;
          } catch (resumeErr: unknown) {
            if ((resumeErr as { name?: string } | null)?.name === "AbortError") return;
          }
        }

        const message = String((requestError as { message?: unknown } | null)?.message ?? "Request failed.");
        setErrorText(message);
        if ((requestError as { status?: unknown } | null)?.status) {
          toast.error("API error", { description: message });
        } else {
          toast.error("Network error", { description: message });
        }
      } finally {
        if (openRef.current) setIsSubmitting(false);
      }
    },
    [pollCheck, resetPollErrors, scheduleNext, stopPolling, target]
  );

  const status = getOverallStatus(checkResponse, requestResponse);
  const statusKind = getStatusKind(status);
  const nextCheckLabel = formatTimeLabel(getNextCheckAt(checkResponse));

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

  const emailMissing = checkResponse?.email?.missing ?? [];
  const prioritizedEmailMissing = React.useMemo(
    () => prioritizePendingRecords(emailMissing),
    [emailMissing]
  );

  const showResults = Boolean(requestResponse || checkResponse);
  const submitDisabled = isSubmitting || !target.trim();
  const defaultRecordName = formatCopyValue(
    checkResponse?.normalized_target ?? checkResponse?.target ?? target
  );
  const pendingRecordsViewportClass =
    status === "PENDING" ? "max-h-[min(46vh,420px)] overflow-y-auto pr-1" : "";

  return {
    target,
    setTarget,
    token,
    setToken,
    requestResponse,
    checkResponse,
    errorText,
    isSubmitting,
    isPolling,
    confirmCloseOpen,
    setConfirmCloseOpen,
    showPollingIndicator,
    handleOpenChange,
    requestClose,
    confirmClose,
    handleDone,
    onStartValidation,
    status,
    statusKind,
    nextCheckLabel,
    prioritizedEmailMissing,
    showResults,
    submitDisabled,
    defaultRecordName,
    pendingRecordsViewportClass,
  };
}
