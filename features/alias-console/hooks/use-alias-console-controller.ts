import * as React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { RE_DOMAIN } from "@/lib/domains";
import { useCopyFeedback } from "@/lib/use-copy-feedback";
import { clampLower, validateAliasEmail, validateAliasHandle, validateMailboxEmail } from "@/lib/utils-mail";

import {
  buildSubscribeUrl,
  buildUnsubscribeUrl,
  loadAvailableDomains,
  requestConfirmToken,
  requestForwarding,
} from "@/features/alias-console/services/alias-console.service";
import type {
  AliasConsoleTab,
  ApiResponse,
  Intent,
  MappingSnapshot,
  RequestState,
  SubscribeCardProps,
} from "@/features/alias-console/types/alias-console.types";
import {
  buildSubscribeCurl,
  buildUnsubscribeCurl,
  describeApiError,
  DOMAINS_URL,
  getStatusKind,
  getStatusPillText,
  parseCustomAddress,
  parseUrlDomainParam,
  sanitizeOtpToken,
} from "@/features/alias-console/utils/alias-console.utils";

export const PINNED_DOMAINS = [
  "reads.phrack.org",
  "smokes.thc.org",
  "free.team-teso.net",
  "segfault.net",
  "ghetto.eurocompton.net",
  "lulz.antisec.net"
];

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toIntent(value: unknown): Intent | null {
  return value === "subscribe" || value === "unsubscribe" ? value : null;
}

function toErrorMessage(value: unknown): string {
  const errorRecord = toRecord(value);
  const message = toText(errorRecord.message);
  return String(message ?? value);
}

export function useAliasConsoleController({ apiStatus: apiStatusProp, onApiStatusChange }: SubscribeCardProps = {}) {
  const [name, setName] = React.useState("");
  const [domains, setDomains] = React.useState<string[]>([]);
  const [domain, setDomain] = React.useState("");
  const [domainComboboxOpen, setDomainComboboxOpen] = React.useState(false);
  const [to, setTo] = React.useState("");
  const [isCustomAddress, setIsCustomAddress] = React.useState(false);
  const [customAddress, setCustomAddress] = React.useState("");

  const [alias, setAlias] = React.useState("");
  const [host, setHost] = React.useState("localhost");

  React.useEffect(() => {
    setHost(window.location.host);
  }, []);

  const [activeTab, setActiveTab] = React.useState<AliasConsoleTab>("subscribe");
  const [requestState, setRequestState] = React.useState<RequestState>("idle");
  const [apiStatusInternal, setApiStatusInternal] = React.useState<"idle" | "connected" | "error">("idle");
  const [lastIntent, setLastIntent] = React.useState<Intent | null>(null);
  const [pendingMapping, setPendingMapping] = React.useState<MappingSnapshot | null>(null);
  const [confirmedMapping, setConfirmedMapping] = React.useState<MappingSnapshot | null>(null);
  const [, setPayload] = React.useState<ApiResponse | null>(null);

  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = React.useState(false);
  const [confirmCode, setConfirmCode] = React.useState("");
  const [confirmIntent, setConfirmIntent] = React.useState<Intent | null>(null);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [confirmErrorText, setConfirmErrorText] = React.useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);
  const confirmCloseBypass = React.useRef(false);
  const autoConfirmAttemptRef = React.useRef<string | null>(null);

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
    let cancelled = false;
    const urlDomain = parseUrlDomainParam();

    const pickDefault = () =>
      PINNED_DOMAINS[Math.floor(Math.random() * PINNED_DOMAINS.length)] || "";

    (async () => {
      try {
        const list = await loadAvailableDomains(DOMAINS_URL, process.env.NEXT_PUBLIC_DOMAINS ?? "");
        if (cancelled) return;

        const apiDomains = list.filter((dom) => !PINNED_DOMAINS.includes(dom));
        const combined = [...PINNED_DOMAINS, ...apiDomains];
        setDomains(combined);

        const urlDomainAvailable = urlDomain != null && combined.includes(urlDomain);
        setDomain((current) => current || (urlDomainAvailable ? urlDomain : pickDefault()));
      } catch {
        if (cancelled) return;
        setDomains(PINNED_DOMAINS);

        const urlDomainPinned = urlDomain != null && PINNED_DOMAINS.includes(urlDomain);
        setDomain((current) => current || (urlDomainPinned ? urlDomain : pickDefault()));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (requestResetTimer.current) clearTimeout(requestResetTimer.current);
    };
  }, []);

  const customAddressValue = customAddress.trim();
  const customAddressParts = React.useMemo(() => parseCustomAddress(customAddress), [customAddress]);

  const previewHandle = React.useMemo(() => clampLower(name) || "handle", [name]);
  const previewDomain = React.useMemo(() => clampLower(domain) || "domain.tld", [domain]);
  const previewAlias = React.useMemo(
    () => (isCustomAddress ? customAddressValue || "alias@domain.tld" : `${previewHandle}@${previewDomain}`),
    [customAddressValue, isCustomAddress, previewHandle, previewDomain]
  );

  const curlSubscribe = React.useMemo(
    () => buildSubscribeCurl({ to, isCustomAddress, customAddress: customAddressValue, name, domain, host }),
    [to, isCustomAddress, customAddressValue, name, domain, host]
  );

  const curlUnsubscribe = React.useMemo(() => buildUnsubscribeCurl(alias, host), [alias, host]);

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

  const subscribeActionState = lastIntent === "subscribe" ? requestState : "idle";
  const unsubscribeActionState = lastIntent === "unsubscribe" ? requestState : "idle";

  const subscribeHasInput = Boolean((isCustomAddress ? customAddressValue : name.trim()) || to.trim());
  const subscribeAliasReady = Boolean(isCustomAddress ? customAddressValue : name.trim() && domain.trim());
  const subscribeTarget = to.trim();
  const canCopySubscribePreview = Boolean(subscribeAliasReady && subscribeTarget);
  const canCopyUnsubscribePreview = Boolean(alias.trim());
  const showConfirmedPanel = requestState === "success" && confirmedMapping?.intent === "subscribe";
  const subscribeAwaiting = subscribeActionState === "awaiting_confirmation";
  const subscribePreviewPulseSource = `${isCustomAddress ? customAddressValue : name.trim()}|${domain.trim()}|${subscribeTarget}`;
  const unsubscribePreviewPulseSource = alias.trim();

  const subscribeButtonBusy = subscribeActionState === "loading";
  const unsubscribeButtonBusy = unsubscribeActionState === "loading";

  const canCopySubscribeCurl = canCopySubscribePreview;
  const canCopyUnsubscribeCurl = canCopyUnsubscribePreview;

  const resetResult = React.useCallback(() => {
    setPayload(null);
  }, []);

  const openConfirmDialog = React.useCallback((intent: Intent, initialCode = "") => {
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

  const setExampleUnsubscribeAlias = React.useCallback(() => {
    setAlias("hacker@segfault.net");
  }, []);

  const doFetch = React.useCallback(async (
    url: string,
    intent?: Intent,
    mapping?: MappingSnapshot,
  ) => {
    setRequestStateNow("loading");

    if (intent) {
      setLastIntent(intent);
      setPendingMapping(mapping ?? null);
      setConfirmedMapping(null);
    } else {
      setLastIntent(null);
      setPendingMapping(null);
    }

    try {
      const { response, rawText, data } = await requestForwarding(url);
      const payload = toRecord(data);

      setPayload(data);

      const success = response.ok && payload.ok !== false;
      if (success) {
        setApiStatus("connected");
        if (intent) {
          setRequestStateNow("awaiting_confirmation");
          openConfirmDialog(intent);
        } else {
          setRequestStateTransient("success");
        }

        if (intent === "subscribe") {
          const aliasValue = toText(payload.alias_candidate) ?? mapping?.alias;
          const targetValue = toText(payload.to) ?? mapping?.to;
          const confirmation = toRecord(payload.confirmation);
          const ttl = confirmation.ttl_minutes;
          const sent = confirmation.sent;
          const description = [
            aliasValue ? `Alias: ${aliasValue}` : null,
            targetValue ? `To: ${targetValue}` : null,
            Number.isFinite(ttl) ? `TTL: ${ttl} min` : null,
          ]
            .filter(Boolean)
            .join(" · ");
          const title = sent === false ? "Confirmation already sent" : "Confirmation email sent";
          toastSuccess(title, description || "Check your inbox to continue.");
          return;
        }

        if (intent === "unsubscribe") {
          const aliasValue = toText(payload.alias) ?? mapping?.alias;
          const ttl = payload.ttl_minutes;
          const sent = payload.sent;
          const reason = toText(payload.reason);
          const description = [
            aliasValue ? `Alias: ${aliasValue}` : null,
            Number.isFinite(ttl) ? `TTL: ${ttl} min` : null,
            reason ? `Reason: ${reason}` : null,
          ]
            .filter(Boolean)
            .join(" · ");
          const title = sent === false ? "Confirmation already sent" : "Removal confirmation sent";
          toastSuccess(title, description || "Check your inbox to continue.");
          return;
        }

        toastSuccess("Request completed");
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

  const onSubscribe = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    resetResult();

    const targetValidation = validateMailboxEmail(to.trim());
    if (!targetValidation.ok) {
      toastError("Invalid destination email", "Use local@domain (max 254) with a strict DNS domain.");
      return;
    }

    const target = targetValidation.value;

    if (isCustomAddress) {
      const addressValidation = validateAliasEmail(customAddress);
      if (!addressValidation.ok) {
        toastError(
          "Invalid custom alias",
          "Allowed local: a-z 0-9 dot underscore hyphen (1-64); domain must follow strict DNS."
        );
        return;
      }

      const address = addressValidation.value;
      const mapping: MappingSnapshot = { alias: address, to: target, intent: "subscribe" };
      await doFetch(buildSubscribeUrl({ address, to: target }), "subscribe", mapping);
      return;
    }

    const handleValidation = validateAliasHandle(name);
    if (!handleValidation.ok) {
      toastError("Invalid handle", "Allowed: a-z 0-9 dot underscore hyphen (1-64), no dot at start/end or repeated.");
      return;
    }

    const normalizedName = handleValidation.value;
    const normalizedDomain = clampLower(domain);

    if (!RE_DOMAIN.test(normalizedDomain)) {
      toastError("Invalid domain", "Use strict DNS format (example.com).");
      return;
    }

    const aliasAddress = `${normalizedName}@${normalizedDomain}`;
    if (aliasAddress.length > 254) {
      toastError("Alias email is too long", "Mailbox length must be at most 254 characters.");
      return;
    }

    const mapping: MappingSnapshot = { alias: aliasAddress, to: target, intent: "subscribe" };
    await doFetch(
      buildSubscribeUrl({ name: normalizedName, domain: normalizedDomain, to: target }),
      "subscribe",
      mapping
    );
  }, [customAddress, doFetch, domain, isCustomAddress, name, resetResult, to, toastError]);

  const onUnsubscribe = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    resetResult();

    const aliasValidation = validateAliasEmail(alias);
    if (!aliasValidation.ok) {
      toastError(
        "Invalid alias email",
        "Allowed local: a-z 0-9 dot underscore hyphen (1-64); domain must follow strict DNS."
      );
      return;
    }

    const normalizedAlias = aliasValidation.value;
    const mapping: MappingSnapshot = { alias: normalizedAlias, to: "", intent: "unsubscribe" };
    await doFetch(buildUnsubscribeUrl(normalizedAlias), "unsubscribe", mapping);
  }, [alias, doFetch, resetResult, toastError]);

  const submitConfirmToken = React.useCallback(async (tokenInput: string, fallbackIntent?: Intent | null) => {
    const token = sanitizeOtpToken(tokenInput);
    if (!/^\d{6}$/.test(token)) {
      setConfirmErrorText("Confirmation code must be exactly 6 digits.");
      return;
    }

    setConfirmLoading(true);
    setRequestStateNow("loading");

    try {
      const { response, data } = await requestConfirmToken(token);
      const payload = toRecord(data);
      const confirmed = payload.ok === true && payload.confirmed === true;

      if (confirmed) {
        const intent =
          toIntent(payload.intent) ?? fallbackIntent ?? confirmIntent;
        const created = payload.created === true;
        const address = toText(payload.address) ?? "";
        const mapping = pendingMapping ?? (address ? { alias: address, to: "", intent: intent ?? "subscribe" } : null);

        closeConfirmDialog();
        setApiStatus("connected");
        if (intent) setLastIntent(intent);
        if (mapping) setConfirmedMapping(mapping);
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
  }, [closeConfirmDialog, confirmIntent, pendingMapping, setApiStatus, setRequestStateNow, setRequestStateTransient, to, toastError, toastSuccess]);

  const onConfirmCodeSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmErrorText(null);
    await submitConfirmToken(confirmCode, confirmIntent);
  }, [confirmCode, confirmIntent, submitConfirmToken]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = sanitizeOtpToken(params.get("confirm_token") ?? params.get("token") ?? "");
    if (!token) return;
    if (autoConfirmAttemptRef.current === token) return;
    autoConfirmAttemptRef.current = token;

    const rawIntent = (params.get("confirm_intent") ?? params.get("intent") ?? "").trim().toLowerCase();
    const intent: Intent = rawIntent === "unsubscribe" ? "unsubscribe" : "subscribe";

    params.delete("confirm_token");
    params.delete("token");
    params.delete("confirm_intent");
    params.delete("intent");

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);

    setActiveTab(intent);
    setLastIntent(intent);
    setRequestStateNow("awaiting_confirmation");
    openConfirmDialog(intent, token);
    void submitConfirmToken(token, intent);
  }, [openConfirmDialog, setRequestStateNow, submitConfirmToken]);

  const goToSubscribeTab = React.useCallback(() => {
    resetResult();
    setActiveTab("subscribe");
  }, [resetResult]);

  const goToUnsubscribeTab = React.useCallback(() => {
    resetResult();
    setActiveTab("unsubscribe");
    setExampleUnsubscribeAlias();
  }, [resetResult, setExampleUnsubscribeAlias]);

  const copySubscribeCurl = React.useCallback(() => {
    if (!canCopySubscribeCurl) return;
    copyWithFeedback("curl-subscribe-tab", curlSubscribe, "Subscribe command");
  }, [canCopySubscribeCurl, copyWithFeedback, curlSubscribe]);

  const copyUnsubscribeCurl = React.useCallback(() => {
    if (!canCopyUnsubscribeCurl) return;
    copyWithFeedback("curl-unsubscribe-tab", curlUnsubscribe, "Unsubscribe command");
  }, [canCopyUnsubscribeCurl, copyWithFeedback, curlUnsubscribe]);

  const copySuccessAlias = React.useCallback(() => {
    if (!confirmedMapping?.alias) return;
    copyWithFeedback("success-dialog-alias", confirmedMapping.alias, "Alias email");
  }, [confirmedMapping, copyWithFeedback]);

  return {
    activeTab,
    alias,
    apiStatus,
    canCopySubscribeCurl,
    canCopyUnsubscribeCurl,
    confirmCloseOpen,
    confirmCode,
    confirmDialogOpen,
    confirmErrorText,
    confirmLoading,
    confirmedMapping,
    copiedId,
    copySuccessAlias,
    curlSubscribe,
    curlUnsubscribe,
    customAddress,
    customAddressParts,
    domain,
    domainComboboxOpen,
    domains,
    isCustomAddress,
    name,
    requestBusy,
    showConfirmedPanel,
    lastIntent,
    statusKind,
    statusPillText,
    successDialogOpen,
    subscribeActionState,
    subscribeAliasReady,
    subscribeAwaiting,
    subscribeButtonBusy,
    subscribeHasInput,
    subscribePreviewPulseSource,
    subscribeTarget,
    to,
    unsubscribePreviewPulseSource,
    unsubscribeActionState,
    unsubscribeButtonBusy,
    previewAlias,

    onSuccessDialogOpenChange: setSuccessDialogOpen,
    onAliasChange: setAlias,
    onConfirmCodeChange,
    onConfirmCodeSubmit,
    onConfirmDialogOpenChange,
    onConfirmGuardOpenChange: setConfirmCloseOpen,
    onCloseConfirmDialog: closeConfirmDialog,
    onDomainChange: setDomain,
    onDomainComboboxOpenChange: setDomainComboboxOpen,
    onIsCustomAddressChange: setIsCustomAddress,
    onNameChange: setName,
    onSubscribe,
    onTabChange: (value: string) => setActiveTab(value as AliasConsoleTab),
    onToChange: setTo,
    onCustomAddressChange: setCustomAddress,
    onUnsubscribe,
    goToSubscribeTab,
    goToUnsubscribeTab,
    copySubscribeCurl,
    copyUnsubscribeCurl,
  };
}
