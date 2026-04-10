import * as React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useCopyFeedback } from "@/lib/use-copy-feedback";
import { clampLower, validateMailboxEmail } from "@/lib/utils-mail";

import {
  buildSubscribeUrl,
  buildUnsubscribeUrl,
  buildDomainDisableUrl,
  buildDomainEnableUrl,
  requestConfirmToken,
  requestHandle,
} from "@/features/handle-console/services/handle-console.service";
import type {
  ApiResponse,
  HandleConsoleCardProps,
  HandleConsoleTab,
  HandleIntent,
  HandleSnapshot,
  RequestState,
} from "@/features/handle-console/types/handle-console.types";
import {
  buildClaimCurl,
  buildDomainDisableCurl,
  buildDomainEnableCurl,
  buildRemoveCurl,
  describeApiError,
  getStatusKind,
  getStatusPillText,
  intentLabel,
  sanitizeOtpToken,
  validateDomain,
  validateHandle,
} from "@/features/handle-console/utils/handle-console.utils";

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toErrorMessage(value: unknown): string {
  const errorRecord = toRecord(value);
  const message = toText(errorRecord.message);
  return String(message ?? value);
}

export function useHandleConsoleController({ apiStatus: apiStatusProp, onApiStatusChange }: HandleConsoleCardProps = {}) {
  // --- Form state ---
  const [handle, setHandle] = React.useState("");
  const [to, setTo] = React.useState("");
  const [removeHandle, setRemoveHandle] = React.useState("");
  const [domainHandle, setDomainHandle] = React.useState("");
  const [domainValue, setDomainValue] = React.useState("");
  const [domainAction, setDomainAction] = React.useState<"disable" | "enable">("disable");
  const [host, setHost] = React.useState("localhost");

  React.useEffect(() => {
    setHost(window.location.host);
  }, []);

  // --- UI state ---
  const [activeTab, setActiveTab] = React.useState<HandleConsoleTab>("claim");
  const [requestState, setRequestState] = React.useState<RequestState>("idle");
  const [apiStatusInternal, setApiStatusInternal] = React.useState<"idle" | "connected" | "error">("idle");
  const [lastIntent, setLastIntent] = React.useState<HandleIntent | null>(null);
  const [pendingSnapshot, setPendingSnapshot] = React.useState<HandleSnapshot | null>(null);
  const [confirmedSnapshot, setConfirmedSnapshot] = React.useState<HandleSnapshot | null>(null);
  const [, setPayload] = React.useState<ApiResponse | null>(null);

  // --- Confirm dialog state ---
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = React.useState(false);
  const [confirmCode, setConfirmCode] = React.useState("");
  const [confirmIntent, setConfirmIntent] = React.useState<HandleIntent | null>(null);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [confirmErrorText, setConfirmErrorText] = React.useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);
  const confirmCloseBypass = React.useRef(false);

  const { copiedId, copyWithFeedback } = useCopyFeedback();
  const requestResetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiStatus = apiStatusProp ?? apiStatusInternal;
  const setApiStatus = onApiStatusChange ?? setApiStatusInternal;

  const successIcon = React.createElement(CheckCircle2, { className: "h-4 w-4 text-emerald-400" });
  const errorIcon = React.createElement(AlertTriangle, { className: "h-4 w-4 text-rose-400" });

  const toastSuccess = React.useCallback((title: string, description?: string) => {
    toast.success(title, { description, icon: successIcon });
  }, [successIcon]);

  const toastError = React.useCallback((title: string, description?: string) => {
    toast.error(title, { description, icon: errorIcon });
  }, [errorIcon]);

  React.useEffect(() => {
    return () => {
      if (requestResetTimer.current) clearTimeout(requestResetTimer.current);
    };
  }, []);

  // --- cURL previews ---
  const curlClaim = React.useMemo(
    () => buildClaimCurl(handle, to, host),
    [handle, to, host]
  );
  const curlRemove = React.useMemo(
    () => buildRemoveCurl(removeHandle, host),
    [removeHandle, host]
  );
  const curlDomainDisable = React.useMemo(
    () => buildDomainDisableCurl(domainHandle, domainValue, host),
    [domainHandle, domainValue, host]
  );
  const curlDomainEnable = React.useMemo(
    () => buildDomainEnableCurl(domainHandle, domainValue, host),
    [domainHandle, domainValue, host]
  );

  // --- State helpers ---
  const setRequestStateNow = React.useCallback((state: RequestState) => {
    if (requestResetTimer.current) clearTimeout(requestResetTimer.current);
    setRequestState(state);
  }, []);

  const setRequestStateTransient = React.useCallback(
    (state: RequestState, next: RequestState = "idle", delay = 1500) => {
      if (requestResetTimer.current) clearTimeout(requestResetTimer.current);
      setRequestState(state);
      requestResetTimer.current = setTimeout(() => setRequestState(next), delay);
    },
    []
  );

  const statusPillText = getStatusPillText(requestState);
  const statusKind = getStatusKind(requestState);
  const requestBusy = requestState === "loading";

  // --- Derived states per tab ---
  const claimHasInput = Boolean(handle.trim() || to.trim());
  const claimReady = Boolean(handle.trim() && to.trim());
  const removeReady = Boolean(removeHandle.trim());
  const domainReady = Boolean(domainHandle.trim() && domainValue.trim());

  const canCopyClaimCurl = claimReady;
  const canCopyRemoveCurl = removeReady;
  const canCopyDomainCurl = domainReady;

  const claimActionState = lastIntent === "subscribe" ? requestState : "idle";
  const removeActionState = lastIntent === "unsubscribe" ? requestState : "idle";
  const domainActionState = (lastIntent === "domain_disable" || lastIntent === "domain_enable") ? requestState : "idle";

  const claimButtonBusy = claimActionState === "loading";
  const removeButtonBusy = removeActionState === "loading";
  const domainButtonBusy = domainActionState === "loading";

  const claimAwaiting = claimActionState === "awaiting_confirmation";
  const showConfirmedPanel = requestState === "success" && confirmedSnapshot?.intent === "subscribe";

  // --- Confirm dialog logic ---
  const resetResult = React.useCallback(() => {
    setPayload(null);
  }, []);

  const openConfirmDialog = React.useCallback((intent: HandleIntent, initialCode = "") => {
    confirmCloseBypass.current = false;
    setConfirmIntent(intent);
    setConfirmCode(initialCode);
    setConfirmErrorText(null);
    setConfirmCloseOpen(false);
    setConfirmLoading(false);
    setConfirmDialogOpen(true);
  }, []);

  const closeConfirmDialog = React.useCallback(() => {
    confirmCloseBypass.current = true;
    setConfirmDialogOpen(false);
    setConfirmCloseOpen(false);
    setConfirmCode("");
    setConfirmErrorText(null);
    setConfirmLoading(false);
    setConfirmIntent(null);
  }, []);

  const requestConfirmClose = React.useCallback(() => {
    setConfirmCloseOpen(true);
  }, []);

  const onConfirmDialogOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      if (confirmCloseBypass.current) {
        confirmCloseBypass.current = false;
        setConfirmDialogOpen(false);
        return;
      }
      requestConfirmClose();
      return;
    }
    confirmCloseBypass.current = false;
    setConfirmDialogOpen(true);
  }, [requestConfirmClose]);

  const onConfirmCodeChange = React.useCallback((value: string) => {
    setConfirmCode(sanitizeOtpToken(value));
    if (confirmErrorText) setConfirmErrorText(null);
  }, [confirmErrorText]);

  // --- Fetch helper ---
  const doFetch = React.useCallback(async (
    url: string,
    intent: HandleIntent,
    snapshot: HandleSnapshot,
  ) => {
    setRequestStateNow("loading");
    setLastIntent(intent);
    setPendingSnapshot(snapshot);
    setConfirmedSnapshot(null);

    try {
      const { response, rawText, data } = await requestHandle(url);
      const payload = toRecord(data);

      setPayload(data);

      const success = response.ok && payload.ok !== false;

      if (success) {
        setApiStatus("connected");

        // Check if this was a silent accept (handle doesn't exist for unsubscribe/domain ops)
        if (payload.accepted === true && !payload.confirmation) {
          setRequestStateTransient("success");
          toastSuccess("Request accepted", "Operation completed.");
          return;
        }

        setRequestStateNow("awaiting_confirmation");
        openConfirmDialog(intent);

        const confirmation = toRecord(payload.confirmation);
        const sent = confirmation.sent;
        const ttl = confirmation.ttl_minutes;
        const description = [
          `Handle: ${snapshot.handle}`,
          snapshot.domain ? `Domain: ${snapshot.domain}` : null,
          Number.isFinite(ttl) ? `TTL: ${ttl} min` : null,
        ].filter(Boolean).join(" · ");

        const title = sent === false
          ? "Confirmation already sent"
          : `Confirmation email sent`;
        toastSuccess(title, description || "Check your inbox to continue.");
        return;
      }

      const errorInfo = describeApiError(data, rawText, response.status);
      setApiStatus("error");
      setRequestStateTransient("error");
      toastError(errorInfo.title, errorInfo.description);
    } catch (err: unknown) {
      const message = toErrorMessage(err);
      setApiStatus("error");
      setPayload(null);
      setRequestStateTransient("error");
      toastError("Network error", message);
    }
  }, [openConfirmDialog, setApiStatus, setRequestStateNow, setRequestStateTransient, toastError, toastSuccess]);

  // --- Form submitters ---
  const onClaim = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    resetResult();

    const handleValidation = validateHandle(handle);
    if (!handleValidation.ok) {
      toastError("Invalid handle", handleValidation.error);
      return;
    }

    const targetValidation = validateMailboxEmail(to.trim());
    if (!targetValidation.ok) {
      toastError("Invalid destination email", "Use local@domain (max 254) with a valid DNS domain.");
      return;
    }

    const snapshot: HandleSnapshot = {
      handle: handleValidation.value,
      to: targetValidation.value,
      intent: "subscribe",
    };
    await doFetch(buildSubscribeUrl(handleValidation.value, targetValidation.value), "subscribe", snapshot);
  }, [doFetch, handle, resetResult, to, toastError]);

  const onRemove = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    resetResult();

    const handleValidation = validateHandle(removeHandle);
    if (!handleValidation.ok) {
      toastError("Invalid handle", handleValidation.error);
      return;
    }

    const snapshot: HandleSnapshot = {
      handle: handleValidation.value,
      to: "",
      intent: "unsubscribe",
    };
    await doFetch(buildUnsubscribeUrl(handleValidation.value), "unsubscribe", snapshot);
  }, [doFetch, removeHandle, resetResult, toastError]);

  const onDomainSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    resetResult();

    const handleValidation = validateHandle(domainHandle);
    if (!handleValidation.ok) {
      toastError("Invalid handle", handleValidation.error);
      return;
    }

    const domainValidation = validateDomain(domainValue);
    if (!domainValidation.ok) {
      toastError("Invalid domain", domainValidation.error);
      return;
    }

    const intent: HandleIntent = domainAction === "disable" ? "domain_disable" : "domain_enable";
    const buildUrl = domainAction === "disable" ? buildDomainDisableUrl : buildDomainEnableUrl;

    const snapshot: HandleSnapshot = {
      handle: handleValidation.value,
      to: "",
      intent,
      domain: domainValidation.value,
    };
    await doFetch(buildUrl(handleValidation.value, domainValidation.value), intent, snapshot);
  }, [doFetch, domainAction, domainHandle, domainValue, resetResult, toastError]);

  // --- Confirm token submission ---
  const submitConfirmToken = React.useCallback(async (tokenInput: string, fallbackIntent?: HandleIntent | null) => {
    const token = sanitizeOtpToken(tokenInput);
    if (!/^\d{6}$/.test(token)) {
      setConfirmErrorText("Confirmation code must be exactly 6 digits.");
      return;
    }

    const intent = fallbackIntent ?? confirmIntent;
    if (!intent) {
      setConfirmErrorText("Unknown action. Please restart the process.");
      return;
    }

    setConfirmLoading(true);
    setRequestStateNow("loading");

    try {
      const { response, data } = await requestConfirmToken(token, intent);
      const payload = toRecord(data);
      const isOk = payload.ok === true;
      const isConfirmed = isOk && (payload.created === true || payload.updated === true);

      if (isConfirmed) {
        const handleValue = toText(payload.handle) ?? pendingSnapshot?.handle ?? "";
        const domainVal = toText(payload.domain) ?? pendingSnapshot?.domain;
        const snapshot: HandleSnapshot = {
          handle: handleValue,
          to: pendingSnapshot?.to ?? "",
          intent,
          domain: domainVal,
        };

        closeConfirmDialog();
        setApiStatus("connected");
        setLastIntent(intent);
        setConfirmedSnapshot(snapshot);
        setRequestStateTransient("success");

        setTimeout(() => setSuccessDialogOpen(true), 180);
        return;
      }

      const errorInfo = describeApiError(data, null, response.status);
      setApiStatus("error");
      setConfirmErrorText(errorInfo.description ?? "The API returned an unexpected response. Please try again.");
      setRequestStateTransient("error", "awaiting_confirmation", 1200);
      toastError(errorInfo.title, errorInfo.description);
    } catch (err: unknown) {
      const message = toErrorMessage(err);
      setApiStatus("error");
      setConfirmErrorText(`Network error: ${message}`);
      setRequestStateTransient("error", "awaiting_confirmation", 1200);
      toastError("Network error", message);
    } finally {
      setConfirmLoading(false);
    }
  }, [closeConfirmDialog, confirmIntent, pendingSnapshot, setApiStatus, setRequestStateNow, setRequestStateTransient, toastError]);

  const onConfirmCodeSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmErrorText(null);
    await submitConfirmToken(confirmCode, confirmIntent);
  }, [confirmCode, confirmIntent, submitConfirmToken]);

  // --- Copy handlers ---
  const copyClaimCurl = React.useCallback(() => {
    if (!canCopyClaimCurl) return;
    copyWithFeedback("curl-claim", curlClaim, "Claim command");
  }, [canCopyClaimCurl, copyWithFeedback, curlClaim]);

  const copyRemoveCurl = React.useCallback(() => {
    if (!canCopyRemoveCurl) return;
    copyWithFeedback("curl-remove", curlRemove, "Remove command");
  }, [canCopyRemoveCurl, copyWithFeedback, curlRemove]);

  const copyDomainDisableCurl = React.useCallback(() => {
    if (!canCopyDomainCurl) return;
    copyWithFeedback("curl-domain-disable", curlDomainDisable, "Domain disable command");
  }, [canCopyDomainCurl, copyWithFeedback, curlDomainDisable]);

  const copyDomainEnableCurl = React.useCallback(() => {
    if (!canCopyDomainCurl) return;
    copyWithFeedback("curl-domain-enable", curlDomainEnable, "Domain enable command");
  }, [canCopyDomainCurl, copyWithFeedback, curlDomainEnable]);

  const copySuccessHandle = React.useCallback(() => {
    if (!confirmedSnapshot?.handle) return;
    copyWithFeedback("success-dialog-handle", confirmedSnapshot.handle, "Handle");
  }, [confirmedSnapshot, copyWithFeedback]);

  return {
    // Form state
    handle,
    to,
    removeHandle,
    domainHandle,
    domainValue,
    domainAction,

    // UI state
    activeTab,
    requestBusy,
    statusKind,
    statusPillText,
    lastIntent,

    // Action states
    claimButtonBusy,
    removeButtonBusy,
    domainButtonBusy,
    claimHasInput,
    claimReady,
    claimAwaiting,
    showConfirmedPanel,

    // cURL
    curlClaim,
    curlRemove,
    curlDomainDisable,
    curlDomainEnable,
    canCopyClaimCurl,
    canCopyRemoveCurl,
    canCopyDomainCurl,

    // Confirm dialog
    confirmDialogOpen,
    confirmCloseOpen,
    confirmCode,
    confirmLoading,
    confirmErrorText,
    confirmIntent,

    // Success dialog
    successDialogOpen,
    confirmedSnapshot,
    copiedId,

    // Form handlers
    onHandleChange: setHandle,
    onToChange: setTo,
    onRemoveHandleChange: setRemoveHandle,
    onDomainHandleChange: setDomainHandle,
    onDomainValueChange: setDomainValue,
    onDomainActionChange: setDomainAction,
    onTabChange: (value: string) => setActiveTab(value as HandleConsoleTab),

    // Submit handlers
    onClaim,
    onRemove,
    onDomainSubmit,

    // Confirm dialog handlers
    onConfirmDialogOpenChange,
    onConfirmGuardOpenChange: setConfirmCloseOpen,
    onCloseConfirmDialog: closeConfirmDialog,
    onConfirmCodeChange,
    onConfirmCodeSubmit,

    // Success dialog handlers
    onSuccessDialogOpenChange: setSuccessDialogOpen,
    copySuccessHandle,

    // cURL copy handlers
    copyClaimCurl,
    copyRemoveCurl,
    copyDomainDisableCurl,
    copyDomainEnableCurl,
  };
}
