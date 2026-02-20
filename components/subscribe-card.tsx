"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  MailX,
  MailPlus,
  ChevronsUpDown,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { fetchDomains, normalizeDomains, RE_DOMAIN } from "@/lib/domains";
import { API_HOST } from "@/lib/api-host";
import {
  badgeClasses,
  clampLower,
  validateAliasEmail,
  validateAliasHandle,
  validateMailboxEmail,
} from "@/lib/utils-mail";
import { useCopyFeedback } from "@/lib/use-copy-feedback";
import { toast } from "sonner";

const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";
const staticIconClass = "cursor-default";

type ApiResponse = Record<string, unknown>;
type RequestState = "idle" | "loading" | "awaiting_confirmation" | "success" | "error";
type ApiStatus = "idle" | "connected" | "error";
type MappingSnapshot = { alias: string; to: string; intent: "subscribe" | "unsubscribe" };

const DOMAINS_URL = `${API_HOST}/domains`;

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

export function SubscribeCard({
  apiStatus: apiStatusProp,
  onApiStatusChange,
}: {
  apiStatus?: ApiStatus;
  onApiStatusChange?: (status: ApiStatus) => void;
} = {}) {
  // subscribe form
  const [name, setName] = React.useState("");
  const [domains, setDomains] = React.useState<string[]>([]);
  const [domain, setDomain] = React.useState("");
  const [domainComboboxOpen, setDomainComboboxOpen] = React.useState(false);
  const [to, setTo] = React.useState("");
  const [isCustomAddress, setIsCustomAddress] = React.useState(false);
  const [customAddress, setCustomAddress] = React.useState("");

  // unsubscribe form
  const [alias, setAlias] = React.useState("");

  // ui state
  const [activeTab, setActiveTab] = React.useState<"subscribe" | "unsubscribe" | "curl">("subscribe");
  const [requestState, setRequestState] = React.useState<RequestState>("idle");
  const [apiStatusInternal, setApiStatusInternal] = React.useState<ApiStatus>("idle");
  const [lastIntent, setLastIntent] = React.useState<"subscribe" | "unsubscribe" | null>(null);
  const [pendingMapping, setPendingMapping] = React.useState<MappingSnapshot | null>(null);
  const [confirmedMapping, setConfirmedMapping] = React.useState<MappingSnapshot | null>(null);
  const [payload, setPayload] = React.useState<ApiResponse | null>(null);

  // confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = React.useState(false);
  const [confirmCode, setConfirmCode] = React.useState("");
  const [confirmIntent, setConfirmIntent] = React.useState<"subscribe" | "unsubscribe" | null>(null);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [confirmErrorText, setConfirmErrorText] = React.useState<string | null>(null);
  const [confirmSubmitted, setConfirmSubmitted] = React.useState(false);
  const confirmCloseBypass = React.useRef(false);
  const autoConfirmAttemptRef = React.useRef<string | null>(null);

  const { copiedId, copyWithFeedback } = useCopyFeedback();
  const requestResetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiStatus = apiStatusProp ?? apiStatusInternal;
  const setApiStatus = onApiStatusChange ?? setApiStatusInternal;

  const successIcon = <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  const errorIcon = <AlertTriangle className="h-4 w-4 text-rose-400" />;

  const toastSuccess = (title: string, description?: string) => {
    toast.success(title, { description, icon: successIcon });
  };

  const toastError = (title: string, description?: string) => {
    toast.error(title, { description, icon: errorIcon });
  };

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await fetchDomains(DOMAINS_URL);
        if (cancelled) return;

        // fallback opcional: se a API falhar, usa NEXT_PUBLIC_DOMAINS
        const fallbackRaw = process.env.NEXT_PUBLIC_DOMAINS ?? "";
        const fallback = normalizeDomains(fallbackRaw.split(","));

        const finalList = list.length ? list : fallback;

        setDomains(finalList);

        // seta default do select (se ainda não tiver)
        setDomain((cur) => cur || finalList[0] || "");
      } catch {
        if (cancelled) return;
        setDomains([]);
        setDomain("");
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
  const customAddressParts = React.useMemo(() => {
    const value = customAddress.trim();
    const atIndex = value.lastIndexOf("@");
    if (atIndex === -1) return { local: value, domain: "" };
    return { local: value.slice(0, atIndex), domain: value.slice(atIndex + 1) };
  }, [customAddress]);

  const previewHandle = React.useMemo(() => clampLower(name) || "handle", [name]);
  const previewDomain = React.useMemo(() => clampLower(domain) || "domain.tld", [domain]);
  const previewAlias = React.useMemo(
    () => (isCustomAddress ? customAddressValue || "alias@domain.tld" : `${previewHandle}@${previewDomain}`),
    [customAddressValue, isCustomAddress, previewHandle, previewDomain]
  );

  const curlSubscribe = React.useMemo(() => {
    const t = to.trim() || "{your_mail}";
    if (isCustomAddress) {
      const address = clampLower(customAddressValue) || "{alias_email}";
      const params = new URLSearchParams({ address, to: t });
      return `curl '${API_HOST}/forward/subscribe?${params.toString()}'`;
    }
    const h = clampLower(name) || "{alias_handle}";
    const d = clampLower(domain) || "{alias_domain}";
    const params = new URLSearchParams({ name: h, domain: d, to: t });
    return `curl '${API_HOST}/forward/subscribe?${params.toString()}'`;
  }, [customAddressValue, domain, isCustomAddress, name, to]);

  const curlUnsubscribe = React.useMemo(() => {
    const a = clampLower(alias) || "{alias_email}";
    const params = new URLSearchParams({ alias: a });
    return `curl '${API_HOST}/forward/unsubscribe?${params.toString()}'`;
  }, [alias]);

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


  const statusLineText =
    requestState === "loading"
      ? "requesting…"
      : requestState === "awaiting_confirmation"
        ? "awaiting confirmation"
        : requestState === "success"
          ? "confirmed"
          : requestState === "error"
            ? "error"
            : "idle";

  const statusPillText =
    requestState === "loading"
      ? "Requesting"
      : requestState === "success"
        ? "Confirmed"
        : requestState === "error"
          ? "Error"
          : "Idle";

  const statusKind: "ok" | "bad" | "idle" =
    requestState === "success" ? "ok" : requestState === "error" ? "bad" : "idle";

  const statusApiText =
    apiStatus === "connected" ? "connected" : apiStatus === "error" ? "error" : "idle";

  const requestBusy = requestState === "loading";

  const subscribeActionState = lastIntent === "subscribe" ? requestState : "idle";
  const unsubscribeActionState = lastIntent === "unsubscribe" ? requestState : "idle";
  const confirmLengthInvalid =
    confirmSubmitted && !/^\d{6}$/.test(confirmCode.trim());

  const isAwaitingConfirmation = requestState === "awaiting_confirmation";
  const confirmationTtlMinutes = React.useMemo(() => {
    const raw = (payload as { confirmation?: { ttl_minutes?: unknown } } | null)?.confirmation?.ttl_minutes;
    if (raw === undefined || raw === null) return null;
    const value = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(value) ? value : null;
  }, [payload]);

  const subscribeHasInput = Boolean((isCustomAddress ? customAddressValue : name.trim()) || to.trim());
  const subscribeAliasReady = Boolean(isCustomAddress ? customAddressValue : name.trim() && domain.trim());
  const subscribeTarget = to.trim();
  const showConfirmedPanel =
    requestState === "success" && confirmedMapping?.intent === "subscribe";
  const subscribeAwaiting = subscribeActionState === "awaiting_confirmation";
  const codeBlockClass =
    "overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-200/90 tracking-[0.01em] tabular-nums";

  const subscribeButtonContent =
    subscribeActionState === "loading" ? (
      <>
        <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
        Saving...
      </>
    ) : (
      "SAVE"
    );

  const unsubscribeButtonContent =
    unsubscribeActionState === "loading" ? (
      <>
        <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
        Deleting
      </>
    ) : (
      "DELETE"
    );

  const customAddressToggle = (
    <Label
      htmlFor="custom-address-toggle"
      className="inline-flex h-7 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 text-[11px] text-zinc-300"
    >
      <Switch
        id="custom-address-toggle"
        checked={isCustomAddress}
        onCheckedChange={setIsCustomAddress}
        aria-label="Toggle custom address"
      />
      <span>Custom Address</span>
    </Label>
  );

  function resetResult() {
    setPayload(null);
  }

  const openConfirmDialog = React.useCallback((intent: "subscribe" | "unsubscribe", initialCode = "") => {
    confirmCloseBypass.current = false;
    setConfirmIntent(intent);
    setConfirmCode(initialCode);
    setConfirmErrorText(null);
    setConfirmSubmitted(false);
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
    setConfirmSubmitted(false);
    setConfirmLoading(false);
    setConfirmIntent(null);
  }, []);

  const requestConfirmClose = React.useCallback(() => {
    setConfirmCloseOpen(true);
  }, []);


  function setExampleUnsub() {
    setAlias("hacker@segfault.net");
  }

  const describeApiError = React.useCallback(
    (data: any, fallback: string | null, status?: number) => {
      const error = typeof data?.error === "string" ? data.error : null;

      if (!error) {
        if (status === 429) {
          return { title: "Rate limited", description: fallback ?? "Too many requests. Try again soon." };
        }
        return {
          title: "Request failed",
          description: fallback ?? "Please try again in a moment.",
        };
      }

      switch (error) {
        case "invalid_params": {
          const parts = [
            data?.field ? `Field: ${data.field}` : null,
            data?.reason ? `Reason: ${data.reason}` : null,
            data?.hint ? `Hint: ${data.hint}` : null,
          ].filter(Boolean);
          return {
            title: "Invalid parameters",
            description: parts.join(" · ") || "Check the submitted values and try again.",
          };
        }
        case "invalid_domain":
          return {
            title: "Invalid domain",
            description: data?.domain ? `Domain: ${data.domain}` : data?.hint ?? "Domain is not active.",
          };
        case "banned": {
          const ban = data?.ban;
          if (ban?.ban_type && ban?.ban_value) {
            const reason = ban?.reason ? ` (${ban.reason})` : "";
            return {
              title: "Request blocked",
              description: `Banned ${ban.ban_type}: ${ban.ban_value}${reason}`,
            };
          }
          const type = data?.type ? `Banned ${data.type}` : "Request blocked";
          const value = data?.value ? `: ${data.value}` : "";
          return { title: "Request blocked", description: `${type}${value}`.trim() };
        }
        case "alias_taken":
          return {
            title: "Alias already exists",
            description: data?.address ? `Alias: ${data.address}` : "Choose a different alias and try again.",
          };
        case "alias_not_found":
          return {
            title: "Alias not found",
            description: data?.alias || data?.address ? `Alias: ${data.alias ?? data.address}` : "Alias not found.",
          };
        case "alias_inactive":
          return {
            title: "Alias inactive",
            description: data?.alias ? `Alias: ${data.alias}` : "Alias is inactive.",
          };
        case "alias_owner_changed":
          return {
            title: "Alias ownership changed",
            description: data?.address ? `Alias: ${data.address}` : "Alias owner changed since the request.",
          };
        case "invalid_or_expired":
          return {
            title: "Code invalid or expired",
            description: "Request a new confirmation code and try again.",
          };
        case "invalid_token":
          return {
            title: "Invalid code",
            description: "Code must be exactly 6 digits.",
          };
        case "unsupported_intent":
          return {
            title: "Unsupported intent",
            description: data?.intent ? `Intent: ${data.intent}` : "This confirmation request is invalid.",
          };
        case "rate_limited":
          return {
            title: "Rate limited",
            description: data?.reason
              ? `${data?.where ? `${data.where}: ` : ""}${data.reason}`
              : "Too many requests. Try again soon.",
          };
        case "server_misconfigured":
          return {
            title: "Server misconfigured",
            description: data?.field ? `Missing ${data.field}.` : "Server configuration error.",
          };
        case "unsupported_media_type":
          return { title: "Unsupported media type", description: "Please send JSON only." };
        case "temporarily_unavailable":
          return { title: "Temporarily unavailable", description: "Please retry in a moment." };
        case "confirmation_payload_missing":
          return { title: "Confirmation failed", description: "Confirmation payload is missing." };
        case "invalid_goto_on_alias":
          return { title: "Alias corrupted", description: "Alias destination could not be parsed." };
        case "internal_error":
          return { title: "Server error", description: "Please try again shortly." };
        default:
          return {
            title: "Request failed",
            description: `Error: ${error}`,
          };
      }
    },
    []
  );

  async function doFetch(url: string, intent?: "subscribe" | "unsubscribe", mapping?: MappingSnapshot) {
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
      const res = await fetch(url, { method: "GET" });
      const rawText = await res.text();
      let data: ApiResponse | null = null;
      if (rawText) {
        try {
          data = JSON.parse(rawText) as ApiResponse;
        } catch {
          data = null;
        }
      }

      setPayload(data);

      const success = res.ok && (data as any)?.ok !== false;

      if (success) {
        setApiStatus("connected");
        if (intent) {
          setRequestStateNow("awaiting_confirmation");
          openConfirmDialog(intent);
        } else {
          setRequestStateTransient("success");
        }

        if (intent === "subscribe") {
          const alias = (data as any)?.alias_candidate ?? mapping?.alias;
          const target = (data as any)?.to ?? mapping?.to;
          const confirmation = (data as any)?.confirmation;
          const ttl = confirmation?.ttl_minutes;
          const sent = confirmation?.sent;
          const description = [
            alias ? `Alias: ${alias}` : null,
            target ? `To: ${target}` : null,
            Number.isFinite(ttl) ? `TTL: ${ttl} min` : null,
          ]
            .filter(Boolean)
            .join(" · ");
          const title = sent === false ? "Confirmation already sent" : "Confirmation email sent";
          toastSuccess(title, description || "Check your inbox to continue.");
        } else if (intent === "unsubscribe") {
          const alias = (data as any)?.alias ?? mapping?.alias;
          const ttl = (data as any)?.ttl_minutes;
          const sent = (data as any)?.sent;
          const reason = (data as any)?.reason;
          const description = [
            alias ? `Alias: ${alias}` : null,
            Number.isFinite(ttl) ? `TTL: ${ttl} min` : null,
            reason ? `Reason: ${reason}` : null,
          ]
            .filter(Boolean)
            .join(" · ");
          const title = sent === false ? "Confirmation already sent" : "Removal confirmation sent";
          toastSuccess(title, description || "Check your inbox to continue.");
        } else {
          toastSuccess("Request completed");
        }
      } else {
        const errorInfo = describeApiError(data, rawText, res.status);
        setApiStatus("error");
        setRequestStateTransient("error");
        toastError(errorInfo.title, errorInfo.description);
      }
    } catch (err: any) {
      const message = String(err?.message ?? err);
      setApiStatus("error");
      setPayload(null);
      setRequestStateTransient("error");
      toastError("Network error", message);
    }
  }

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    resetResult();

    const t = to.trim();
    const targetValidation = validateMailboxEmail(t);

    if (!targetValidation.ok) {
      toastError(
        "Invalid destination email",
        "Use local@domain (max 254) with a strict DNS domain."
      );
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

      const url = `${API_HOST}/forward/subscribe?${new URLSearchParams({
        address,
        to: target,
      }).toString()}`;

      const mapping: MappingSnapshot = { alias: address, to: target, intent: "subscribe" };
      await doFetch(url, "subscribe", mapping);
      return;
    }

    const handleValidation = validateAliasHandle(name);
    if (!handleValidation.ok) {
      toastError(
        "Invalid handle",
        "Allowed: a-z 0-9 dot underscore hyphen (1-64), no dot at start/end or repeated."
      );
      return;
    }

    const n = handleValidation.value;
    const d = clampLower(domain);

    if (!RE_DOMAIN.test(d)) {
      toastError("Invalid domain", "Use strict DNS format (example.com).");
      return;
    }
    const aliasAddress = `${n}@${d}`;
    if (aliasAddress.length > 254) {
      toastError("Alias email is too long", "Mailbox length must be at most 254 characters.");
      return;
    }

    const url = `${API_HOST}/forward/subscribe?${new URLSearchParams({
      name: n,
      domain: d,
      to: target,
    }).toString()}`;

    const mapping: MappingSnapshot = { alias: aliasAddress, to: target, intent: "subscribe" };
    await doFetch(url, "subscribe", mapping);
  }

  async function onUnsubscribe(e: React.FormEvent) {
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
    const a = aliasValidation.value;

    const url = `${API_HOST}/forward/unsubscribe?${new URLSearchParams({ alias: a }).toString()}`;
    const mapping: MappingSnapshot = { alias: a, to: "", intent: "unsubscribe" };
    await doFetch(url, "unsubscribe", mapping);
  }

  const submitConfirmToken = React.useCallback(async (
    tokenInput: string,
    fallbackIntent?: "subscribe" | "unsubscribe" | null
  ) => {
    const token = tokenInput.trim();
    if (!/^\d{6}$/.test(token)) {
      setConfirmErrorText("Confirmation code must be exactly 6 digits.");
      return;
    }

    setConfirmLoading(true);
    setRequestStateNow("loading");
    try {
      const res = await fetch(
        `${API_HOST}/forward/confirm?${new URLSearchParams({ token }).toString()}`,
        { method: "GET" }
      );
      const data = (await res.json()) as ApiResponse;
      const confirmed = (data as any)?.ok === true && (data as any)?.confirmed === true;

      if (confirmed) {
        const intent = typeof (data as any)?.intent === "string"
          ? ((data as any)?.intent as "subscribe" | "unsubscribe")
          : fallbackIntent ?? confirmIntent;
        const created = (data as any)?.created === true;
        const address = typeof (data as any)?.address === "string" ? (data as any)?.address : "";
        const mapping = pendingMapping ?? (address ? { alias: address, to: "", intent: intent ?? "subscribe" } : null);

        closeConfirmDialog();
        setApiStatus("connected");
        if (intent) setLastIntent(intent);
        if (mapping) setConfirmedMapping(mapping);
        setRequestStateTransient("success");

        const title = created || intent !== "unsubscribe" ? "Alias confirmed" : "Removal confirmed";
        const description =
          created || intent !== "unsubscribe"
            ? mapping?.alias && mapping?.to
              ? `${mapping.alias} → ${mapping.to}`
              : address
                ? `${address} → ${to.trim() || "destination"}`
                : "Alias confirmed."
            : "Alias removal confirmed successfully.";
        toastSuccess(title, description);
        return;
      }
      const errorInfo = describeApiError(data, null, res.status);
      setApiStatus("error");
      setConfirmErrorText(errorInfo.description ?? "The API returned an unexpected response. Please try again.");
      setRequestStateTransient("error", "awaiting_confirmation", 1200);
      toastError(errorInfo.title, errorInfo.description);
    } catch (err: any) {
      const message = String(err?.message ?? err);
      setApiStatus("error");
      setConfirmErrorText(`Network error: ${message}`);
      setRequestStateTransient("error", "awaiting_confirmation", 1200);
      toastError("Network error", message);
    } finally {
      setConfirmLoading(false);
    }
  }, [
    closeConfirmDialog,
    confirmIntent,
    pendingMapping,
    setApiStatus,
    setRequestStateNow,
    setRequestStateTransient,
    to,
  ]);

  async function onConfirmCode(e: React.FormEvent) {
    e.preventDefault();
    setConfirmSubmitted(true);
    setConfirmErrorText(null);
    await submitConfirmToken(confirmCode, confirmIntent);
  }

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = (params.get("confirm_token") ?? params.get("token") ?? "").trim();
    if (!token) return;
    if (autoConfirmAttemptRef.current === token) return;
    autoConfirmAttemptRef.current = token;

    const rawIntent = (params.get("confirm_intent") ?? params.get("intent") ?? "").trim().toLowerCase();
    const intent: "subscribe" | "unsubscribe" = rawIntent === "unsubscribe" ? "unsubscribe" : "subscribe";

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
    setConfirmSubmitted(true);
    void submitConfirmToken(token, intent);
  }, [openConfirmDialog, setRequestStateNow, submitConfirmToken]);

  return (
    <Card className="relative overflow-hidden border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-950/60">
      {/* subtle background */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
      </div>

      <Dialog
        open={confirmDialogOpen}
        onOpenChange={(open) => {
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
        }}
      >
        <DialogContent
          className="max-w-[22rem] border-white/10 bg-zinc-950/95 p-0"
        >
          <div className="space-y-4 px-6 pt-6">
            <DialogHeader>
              <DialogTitle>Confirm email code</DialogTitle>
              <DialogDescription>
                We sent a 6-digit verification code to your email. Enter it below to finish.
              </DialogDescription>
            </DialogHeader>

            <form id="confirm-otp-form" onSubmit={onConfirmCode} className="space-y-3">
              <div className="space-y-2">
                <Label>Verification code</Label>
                <InputOTP
                  maxLength={6}
                  value={confirmCode}
                  className="w-full"
                  containerClassName="w-full justify-start gap-2"
                  onChange={(value) => {
                    setConfirmCode(value);
                    if (confirmErrorText) setConfirmErrorText(null);
                  }}
                >
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-10 *:data-[slot=input-otp-slot]:text-lg *:data-[slot=input-otp-slot]:border-white/15 *:data-[slot=input-otp-slot]:bg-black/30 *:data-[slot=input-otp-slot]:text-zinc-100 *:data-[slot=input-otp-slot]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator className="mx-2 text-zinc-500" />
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-10 *:data-[slot=input-otp-slot]:text-lg *:data-[slot=input-otp-slot]:border-white/15 *:data-[slot=input-otp-slot]:bg-black/30 *:data-[slot=input-otp-slot]:text-zinc-100 *:data-[slot=input-otp-slot]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
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
                  <AlertDescription className="text-zinc-300">
                    {confirmErrorText}
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </div>

          <Separator className="bg-white/10" />

          <DialogFooter className="flex flex-col gap-2 px-6 pb-6">
            <Button form="confirm-otp-form" type="submit" className="group w-full" disabled={confirmLoading}>
              {confirmLoading ? (
                <>
                  <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
                  Confirming…
                </>
              ) : (
                "Confirm code"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close confirmation?</AlertDialogTitle>
            <AlertDialogDescription>
              If you close now, your confirmation progress may be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={closeConfirmDialog}>
              Close anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="tracking-tight">
              ALIAS CONSOLE
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <div className={`shrink-0 rounded-full border px-3 py-1 text-xs ${badgeClasses(statusKind)}`}>
              <span className="inline-flex items-center gap-2">
                {statusKind === "ok" ? (
                  <ShieldCheck className={`h-3.5 w-3.5 ${staticIconClass}`} />
                ) : statusKind === "bad" ? (
                  <ShieldAlert className={`h-3.5 w-3.5 ${staticIconClass}`} />
                ) : (
                  <Terminal className={`h-3.5 w-3.5 ${staticIconClass}`} />
                )}
                {statusPillText}
              </span>
            </div>
          </div>
        </div>

      </CardHeader>

      <CardContent className="relative space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2 border border-white/10 bg-black/30 sm:grid-cols-3">
            <TabsTrigger
              value="subscribe"
              className="group gap-2 data-[state=active]:bg-white/5 data-[state=active]:text-zinc-100 data-[state=active]:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.25)]"
            >
              <MailPlus className={`h-4 w-4 ${clickableIconClass}`} />
              CREATE
            </TabsTrigger>
            <TabsTrigger
              value="unsubscribe"
              className="group gap-2 data-[state=active]:bg-white/5 data-[state=active]:text-zinc-100 data-[state=active]:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.25)]"
            >
              <MailX className={`h-4 w-4 ${clickableIconClass}`} />
              DELETE
            </TabsTrigger>
            <TabsTrigger
              value="curl"
              className="group hidden gap-2 data-[state=active]:bg-white/5 data-[state=active]:text-zinc-100 data-[state=active]:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.25)] sm:inline-flex"
            >
              <Terminal className={`h-4 w-4 ${clickableIconClass}`} />
              CURL
            </TabsTrigger>
          </TabsList>

          {/* SUBSCRIBE */}
          <TabsContent value="subscribe" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-5">
              <form onSubmit={onSubscribe} className="space-y-5 lg:col-span-3 min-w-0">
                <div className="grid grid-cols-1 gap-4 items-start min-w-0">

                  {isCustomAddress ? (
                    <div className="flex-1 space-y-2 ">
                      <div className="flex items-center justify-between gap-2 min-h-[28px]">
                        <Label htmlFor="custom-address">Custom address</Label>
                        {customAddressToggle}
                      </div>
                      <Input
                        id="custom-address"
                        type="email"
                        placeholder="user@example.com"
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        autoCapitalize="none"
                        spellCheck={false}
                        className="bg-black/30"
                      />
                      <p className="text-xs text-zinc-400">
                        NOTE: The domain{" "}
                        <span className="font-mono text-zinc-300">{customAddressParts.domain || "…"}</span>{" "}
                        must have a MX record to{" "}
                        <span className="font-mono text-zinc-300">mail.abin.lat</span>, or your emails won't be forwarded.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center justify-between gap-2 min-h-[28px]">
                          <Label htmlFor="name">Handle</Label>
                        </div>

                        <Input
                          id="name"
                          placeholder="extencil"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoCapitalize="none"
                          spellCheck={false}
                          className="bg-black/30"
                        />
                      </div>

                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center justify-between gap-2 min-h-[28px]">
                          <Label>Domain</Label>
                          {customAddressToggle}
                        </div>
                        <Popover open={domainComboboxOpen} onOpenChange={setDomainComboboxOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              aria-expanded={domainComboboxOpen}
                              className="w-full min-w-0 justify-between border-white/10 bg-black/30 text-zinc-200 hover:bg-white/10"
                            >
                              <span className="truncate">
                                {domain || "Select a domain"}
                              </span>
                              <ChevronsUpDown className={`ml-2 h-4 w-4 shrink-0 opacity-50 ${clickableIconClass}`} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-[var(--radix-popover-trigger-width)] border-white/10 bg-zinc-950/95 p-0 text-zinc-200"
                          >
                            <Command className="bg-transparent">
                              <CommandInput placeholder="Search domain..." />
                              <CommandList>
                                <CommandEmpty>No domains found.</CommandEmpty>
                                <CommandGroup>
                                  {domains.length ? (
                                    domains.map((d) => (
                                      <CommandItem
                                        key={d}
                                        value={d}
                                        onSelect={() => {
                                          setDomain(d);
                                          setDomainComboboxOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${domain === d ? "text-emerald-300 opacity-100" : "opacity-0"}`}
                                        />
                                        <span className="truncate">{d}</span>
                                      </CommandItem>
                                    ))
                                  ) : (
                                    <CommandItem value="no-domains" disabled>
                                      No domains available (API /domains failed)
                                    </CommandItem>
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </>
                  )}
                </div>


                <div className="space-y-2">
                  <Label htmlFor="to">Destination email address</Label>
                  <Input
                    id="to"
                    type="email"
                    placeholder="extencil@proton.me"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    autoCapitalize="none"
                    spellCheck={false}
                    className="bg-black/30"
                  />
                  <p className="text-xs text-zinc-400">
                    Must be a valid mailbox.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="submit"
                    className="group w-full sm:w-auto"
                    disabled={requestBusy || (!domains.length && !isCustomAddress)}
                  >
                    {subscribeButtonContent}
                  </Button>
                </div>
              </form>

              <div className="space-y-3 lg:col-span-2">
                <div className="hidden rounded-xl border border-white/10 bg-black/30 p-4 sm:block">
                  <p className="text-sm font-medium text-zinc-200">REQUEST PREVIEW</p>
                  <Separator className="my-3 bg-white/10" />
                  {showConfirmedPanel ? (
                    <div className="space-y-2 text-sm text-zinc-300">
                      <p>Confirmed. Alias is active.</p>
                      {confirmedMapping?.alias ? (
                        <p className="font-mono text-xs text-zinc-200">
                          {confirmedMapping.alias}{" "}
                          <span className="text-zinc-500">→</span>{" "}
                          {confirmedMapping.to || "destination"}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-400">Confirmation received.</p>
                      )}
                    </div>
                  ) : subscribeAwaiting ? (
                    <div className="space-y-1 text-sm text-zinc-300">
                      <p>Awaiting confirmation email.</p>
                      <p className="text-xs text-zinc-400">
                        Check your inbox to finish creating the alias.
                      </p>
                    </div>
                  ) : !subscribeHasInput ? (
                    <p className="text-sm text-zinc-400">
                      Fill the form to preview your alias.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-sm text-zinc-400">
                      <li>
                        • Alias:{" "}
                        <span className="font-mono text-zinc-200">
                          {subscribeAliasReady ? previewAlias : "alias@domain.tld"}
                        </span>
                      </li>
                      <li>
                        • Destination:{" "}
                        <span className="font-mono text-zinc-200">
                          {subscribeTarget || "Fill destination email to preview"}
                        </span>
                      </li>
                    </ul>
                  )}

                  <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3">
                    <pre className={`mt-1 ${codeBlockClass}`}>
                      {curlSubscribe}
                    </pre>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="group w-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => {
                    resetResult();
                    setActiveTab("unsubscribe");
                    setExampleUnsub();
                  }}
                >
                  <MailX className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                  CLICK TO DELETE ALIAS
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* UNSUBSCRIBE */}
          <TabsContent value="unsubscribe" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-5">
              <form onSubmit={onUnsubscribe} className="space-y-5 lg:col-span-3">
                <div className="space-y-2">
                  <Label htmlFor="alias">ALIAS</Label>
                  <Input
                    id="alias"
                    type="email"
                    placeholder="docs.curl@fwd.haltman.io"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    autoCapitalize="none"
                    spellCheck={false}
                    className="bg-black/30"
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button type="submit" className="group w-full sm:w-auto" disabled={requestBusy}>
                    {unsubscribeButtonContent}
                  </Button>
                </div>
              </form>

              <div className="space-y-3 lg:col-span-2">
                <div className="hidden rounded-xl border border-white/10 bg-black/30 p-4 sm:block">
                  <p className="text-sm font-medium text-zinc-200">REQUEST PREVIEW</p>
                  <Separator className="my-3 bg-white/10" />


                  <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3">
                    <pre className={`mt-1 ${codeBlockClass}`}>
                      {curlUnsubscribe}
                    </pre>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="group w-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => {
                    resetResult();
                    setActiveTab("subscribe");
                  }}
                >
                  <MailPlus className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                  CLICK TO CREATE ALIAS
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* CURL */}
          <TabsContent value="curl" className="mt-6 hidden space-y-4 sm:block">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200">RAW CURL</p>
                  <p className="text-xs text-zinc-400">
                    Just copy, paste and run. No mistery.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="group border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => copyWithFeedback("curl-subscribe-tab", curlSubscribe, "Subscribe command")}
                    disabled={!domains.length && !isCustomAddress}
                  >
                    {copiedId === "curl-subscribe-tab" ? (
                      <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
                    ) : (
                      <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                    )}
                    <CopyLabel copied={copiedId === "curl-subscribe-tab"} label="COPY (CREATE)" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="group border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => copyWithFeedback("curl-unsubscribe-tab", curlUnsubscribe, "Unsubscribe command")}
                    disabled={!alias.trim()}
                  >
                    {copiedId === "curl-unsubscribe-tab" ? (
                      <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
                    ) : (
                      <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                    )}
                    <CopyLabel copied={copiedId === "curl-unsubscribe-tab"} label="COPY (DELETE)" />
                  </Button>
                </div>
              </div>

              <Separator className="my-4 bg-white/10" />

              <div className="space-y-3">
                <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                  <p className="text-xs text-zinc-400">CREATE</p>
                  <pre className={`mt-1 ${codeBlockClass}`}>
                    {curlSubscribe}
                  </pre>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                  <p className="text-xs text-zinc-400">DELETE</p>
                  <pre className={`mt-1 ${codeBlockClass}`}>
                    {curlUnsubscribe}
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </CardContent>
    </Card>
  );
}
