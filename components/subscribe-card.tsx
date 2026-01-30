"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Loader2, Wand2, ShieldCheck, ShieldAlert, Terminal, MailX, MailPlus } from "lucide-react";
import { fetchDomains, normalizeDomains, RE_DOMAIN } from "@/lib/domains";
import { API_HOST } from "@/lib/api-host";
import { badgeClasses, clampLower, isProbablyEmail, safeJson } from "@/lib/utils-mail";
import { useCopyFeedback } from "@/lib/use-copy-feedback";
import { toast } from "sonner";

const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";
const staticIconClass = "cursor-default";

type ApiResponse = Record<string, unknown>;
type RequestState = "idle" | "loading" | "awaiting_confirmation" | "success" | "error";
type ApiStatus = "idle" | "connected" | "error";
type MappingSnapshot = { alias: string; to: string; intent: "subscribe" | "unsubscribe" };

const RE_NAME = /^[a-z0-9](?:[a-z0-9.]{0,62}[a-z0-9])?$/;

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
  const [to, setTo] = React.useState("");

  // unsubscribe form
  const [alias, setAlias] = React.useState("");

  // ui state
  const [activeTab, setActiveTab] = React.useState<"subscribe" | "unsubscribe" | "curl">("subscribe");
  const [requestState, setRequestState] = React.useState<RequestState>("idle");
  const [apiStatusInternal, setApiStatusInternal] = React.useState<ApiStatus>("idle");
  const [lastIntent, setLastIntent] = React.useState<"subscribe" | "unsubscribe" | null>(null);
  const [pendingMapping, setPendingMapping] = React.useState<MappingSnapshot | null>(null);
  const [confirmedMapping, setConfirmedMapping] = React.useState<MappingSnapshot | null>(null);
  const [ok, setOk] = React.useState<boolean | null>(null);
  const [payload, setPayload] = React.useState<ApiResponse | null>(null);
  const [errorText, setErrorText] = React.useState<string | null>(null);

  // confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = React.useState(false);
  const [confirmCode, setConfirmCode] = React.useState("");
  const [confirmIntent, setConfirmIntent] = React.useState<"subscribe" | "unsubscribe" | null>(null);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [confirmErrorText, setConfirmErrorText] = React.useState<string | null>(null);
  const [confirmSubmitted, setConfirmSubmitted] = React.useState(false);
  const confirmCloseBypass = React.useRef(false);

  const { copiedId, copyWithFeedback } = useCopyFeedback();
  const requestResetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiStatus = apiStatusProp ?? apiStatusInternal;
  const setApiStatus = onApiStatusChange ?? setApiStatusInternal;

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


  const previewHandle = React.useMemo(() => clampLower(name) || "handle", [name]);
  const previewDomain = React.useMemo(() => clampLower(domain) || "domain.tld", [domain]);
  const previewAlias = React.useMemo(() => `${previewHandle}@${previewDomain}`, [previewHandle, previewDomain]);

  const curlSubscribe = React.useMemo(() => {
    const h = clampLower(name) || "{alias_handle}";
    const d = clampLower(domain) || "{alias_domain}";
    const t = to.trim() || "{your_mail}";
    const params = new URLSearchParams({ name: h, domain: d, to: t });
    return `curl '${API_HOST}/forward/subscribe?${params.toString()}'`;
  }, [name, domain, to]);

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
      : requestState === "awaiting_confirmation"
      ? "Awaiting"
      : requestState === "success"
      ? "Confirmed"
      : requestState === "error"
      ? "Error"
      : "Idle";

  const statusKind: "ok" | "bad" | "idle" =
    requestState === "success" ? "ok" : requestState === "error" ? "bad" : "idle";

  const statusApiText =
    apiStatus === "connected" ? "connected" : apiStatus === "error" ? "error" : "idle";

  const requestBusy =
    requestState === "loading" || requestState === "awaiting_confirmation" || requestState === "success";

  const subscribeActionState = lastIntent === "subscribe" ? requestState : "idle";
  const unsubscribeActionState = lastIntent === "unsubscribe" ? requestState : "idle";
  const confirmLengthInvalid =
    confirmSubmitted && (confirmCode.trim().length < 12 || confirmCode.trim().length > 64);

  const isAwaitingConfirmation = requestState === "awaiting_confirmation";
  const confirmationTtlMinutes = React.useMemo(() => {
    const raw = (payload as { confirmation?: { ttl_minutes?: unknown } } | null)?.confirmation?.ttl_minutes;
    if (raw === undefined || raw === null) return null;
    const value = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(value) ? value : null;
  }, [payload]);

  const subscribeHasInput = Boolean(name.trim() || to.trim());
  const subscribeAliasReady = Boolean(name.trim() && domain.trim());
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
        Requesting…
      </>
    ) : subscribeActionState === "awaiting_confirmation" ? (
      "Awaiting confirmation…"
    ) : subscribeActionState === "success" ? (
      <>
        <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
        Confirmed
      </>
    ) : (
      "Request alias"
    );

  const unsubscribeButtonContent =
    unsubscribeActionState === "loading" ? (
      <>
        <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
        Requesting…
      </>
    ) : unsubscribeActionState === "awaiting_confirmation" ? (
      "Awaiting confirmation…"
    ) : unsubscribeActionState === "success" ? (
      <>
        <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
        Confirmed
      </>
    ) : (
      "Request removal"
    );

  function resetResult() {
    setOk(null);
    setPayload(null);
    setErrorText(null);
  }

  function openConfirmDialog(intent: "subscribe" | "unsubscribe") {
    confirmCloseBypass.current = false;
    setConfirmIntent(intent);
    setConfirmCode("");
    setConfirmErrorText(null);
    setConfirmSubmitted(false);
    setConfirmCloseOpen(false);
    setConfirmLoading(false);
    setConfirmDialogOpen(true);
  }

  function closeConfirmDialog() {
    confirmCloseBypass.current = true;
    setConfirmDialogOpen(false);
    setConfirmCloseOpen(false);
    setConfirmCode("");
    setConfirmErrorText(null);
    setConfirmSubmitted(false);
    setConfirmLoading(false);
    setConfirmIntent(null);
  }

  function requestConfirmClose() {
    setConfirmCloseOpen(true);
  }


  function setExampleSubscribe() {
    setName("hacker");
    setDomain(domains[0] ?? "segfault.net");
    setTo("you@proton.me");
  }

  function setExampleUnsub() {
    setAlias("hacker@segfault.net");
  }

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
      const data = (await res.json()) as ApiResponse;
      const success = res.ok && (data as any)?.ok !== false;

      setOk(success);
      setPayload(data);

      if (success) {
        setApiStatus("connected");
        if (intent) {
          setRequestStateNow("awaiting_confirmation");
          openConfirmDialog(intent);
        } else {
          setRequestStateTransient("success");
        }
      } else {
        setApiStatus("error");
        setErrorText("Request failed. See response below.");
        setRequestStateTransient("error");
        toast.error("API error", { description: "Request failed. See response below." });
      }
    } catch (err: any) {
      const message = String(err?.message ?? err);
      setApiStatus("error");
      setOk(false);
      setErrorText(`Network error: ${message}`);
      setPayload({ ok: false, error: "network_error", detail: message });
      setRequestStateTransient("error");
      toast.error("Network error", { description: message });
    }
  }

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    resetResult();

    const n = clampLower(name);
    const d = clampLower(domain);
    const t = to.trim();

    if (!RE_NAME.test(n)) {
      setOk(false);
      setErrorText("Invalid alias handle. Use [a-z0-9.] (1–64), no dot at start/end.");
      return;
    }
    if (!RE_DOMAIN.test(d)) {
      setOk(false);
      setErrorText("Invalid domain.");
      return;
    }
    if (!isProbablyEmail(t)) {
      setOk(false);
      setErrorText("Destination email is required (max 254 chars).");
      return;
    }

    const url = `${API_HOST}/forward/subscribe?${new URLSearchParams({
      name: n,
      domain: d,
      to: t,
    }).toString()}`;

    const mapping: MappingSnapshot = { alias: `${n}@${d}`, to: t, intent: "subscribe" };
    await doFetch(url, "subscribe", mapping);
  }

  async function onUnsubscribe(e: React.FormEvent) {
    e.preventDefault();
    resetResult();

    const a = clampLower(alias);

    if (!isProbablyEmail(a)) {
      setOk(false);
      setErrorText("Alias email is required.");
      return;
    }

    const url = `${API_HOST}/forward/unsubscribe?${new URLSearchParams({ alias: a }).toString()}`;
    const mapping: MappingSnapshot = { alias: a, to: "", intent: "unsubscribe" };
    await doFetch(url, "unsubscribe", mapping);
  }

  async function onConfirmCode(e: React.FormEvent) {
    e.preventDefault();
    setConfirmSubmitted(true);
    setConfirmErrorText(null);

    const token = confirmCode.trim();
    if (token.length < 12 || token.length > 64) {
      setConfirmErrorText("Confirmation code must be 12–64 characters.");
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
      const invalid = (data as any)?.ok === false && (data as any)?.error === "invalid_or_expired";
      const confirmed = (data as any)?.ok === true && (data as any)?.confirmed === true;

      if (invalid) {
        setApiStatus("error");
        setConfirmErrorText("Code is invalid or expired. Please try again.");
        setRequestStateTransient("error", "awaiting_confirmation", 1200);
        toast.error("Confirmation failed", { description: "The confirmation code is invalid or expired." });
        return;
      }

      if (!res.ok && !confirmed) {
        setApiStatus("error");
        setConfirmErrorText("Request failed. Please try again.");
        setRequestStateTransient("error", "awaiting_confirmation", 1200);
        toast.error("API error", { description: "Confirmation request failed." });
        return;
      }

      if (confirmed) {
        const intent = typeof (data as any)?.intent === "string"
          ? ((data as any)?.intent as "subscribe" | "unsubscribe")
          : confirmIntent;
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

        toast.success(title, { description });
        return;
      }

      setApiStatus("error");
      setConfirmErrorText("The API returned an unexpected response. Please try again.");
      setRequestStateTransient("error", "awaiting_confirmation", 1200);
      toast.error("API error", { description: "Unexpected confirmation response." });
    } catch (err: any) {
      const message = String(err?.message ?? err);
      setApiStatus("error");
      setConfirmErrorText(`Network error: ${message}`);
      setRequestStateTransient("error", "awaiting_confirmation", 1200);
      toast.error("Network error", { description: message });
    } finally {
      setConfirmLoading(false);
    }
  }

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
            }
            return;
          }
          confirmCloseBypass.current = false;
          setConfirmDialogOpen(true);
        }}
      >
        <DialogContent
          className="border-white/10 bg-zinc-950/95"
          onEscapeKeyDown={(event) => {
            event.preventDefault();
          }}
          onInteractOutside={(event) => {
            event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Confirm email code</DialogTitle>
            <DialogDescription>
              We sent a confirmation code to your email. Paste it below to finish.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onConfirmCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-code">Confirmation code</Label>
              <Input
                id="confirm-code"
                placeholder="Paste confirmation code"
                value={confirmCode}
                onChange={(e) => {
                  setConfirmCode(e.target.value);
                  if (confirmErrorText) setConfirmErrorText(null);
                }}
                autoCapitalize="none"
                spellCheck={false}
                maxLength={64}
                aria-invalid={confirmLengthInvalid || !!confirmErrorText}
                className={`bg-black/30 font-mono tracking-[0.18em] ${confirmLengthInvalid || confirmErrorText ? "border-rose-500/50 focus-visible:ring-rose-500/30" : ""}`}
              />
              <p className="text-xs text-zinc-400">Code length: 12–64 characters.</p>
            </div>

            {confirmErrorText && (
              <Alert variant="destructive" className="border-white/10 bg-black/30">
                <AlertTitle>Confirmation failed</AlertTitle>
                <AlertDescription className="text-zinc-300">
                  {confirmErrorText}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="text-zinc-400 hover:text-zinc-200"
                onClick={requestConfirmClose}
              >
                Close
              </Button>
              <Button type="submit" className="group" disabled={confirmLoading}>
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
          </form>
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
              Mail alias console
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Create or remove aliases with a single request (plus email confirmation on removal).
            </CardDescription>
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

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-zinc-500">
          <span className={`text-zinc-400 ${requestState === "loading" ? "animate-pulse" : ""}`}>
            status: {statusLineText}
          </span>
          <span className="text-zinc-600">•</span>
          <span>api: {statusApiText}</span>
          <span className="text-zinc-600">•</span>
          <span>tls: on-demand</span>
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-zinc-400">Preview alias</p>
              <p className="truncate font-mono text-sm text-zinc-100">
                {previewAlias}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="group border-white/10 bg-white/5 hover:bg-white/10"
                disabled={isAwaitingConfirmation}
                onClick={() => copyWithFeedback("preview-alias", previewAlias, "Preview alias")}
                aria-label="Copy preview alias"
              >
                {copiedId === "preview-alias" ? (
                  <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
                ) : (
                  <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                )}
                <CopyLabel copied={copiedId === "preview-alias"} label="Copy" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="group border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => {
                  resetResult();
                  setActiveTab("subscribe");
                  setExampleSubscribe();
                }}
              >
                <Wand2 className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                Fill example
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 border border-white/10 bg-black/30">
            <TabsTrigger
              value="subscribe"
              className="group gap-2 data-[state=active]:bg-white/5 data-[state=active]:text-zinc-100 data-[state=active]:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.25)]"
            >
              <MailPlus className={`h-4 w-4 ${clickableIconClass}`} />
              Subscribe
            </TabsTrigger>
            <TabsTrigger
              value="unsubscribe"
              className="group gap-2 data-[state=active]:bg-white/5 data-[state=active]:text-zinc-100 data-[state=active]:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.25)]"
            >
              <MailX className={`h-4 w-4 ${clickableIconClass}`} />
              Unsubscribe
            </TabsTrigger>
            <TabsTrigger
              value="curl"
              className="group gap-2 data-[state=active]:bg-white/5 data-[state=active]:text-zinc-100 data-[state=active]:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.25)]"
            >
              <Terminal className={`h-4 w-4 ${clickableIconClass}`} />
              cURL
            </TabsTrigger>
          </TabsList>

          {/* SUBSCRIBE */}
          <TabsContent value="subscribe" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-5">
              <form onSubmit={onSubscribe} className="space-y-5 lg:col-span-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Alias handle</Label>
                  <Input
                    id="name"
                    placeholder="extencil"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoCapitalize="none"
                    spellCheck={false}
                    className="bg-black/30"
                  />
                  <p className="text-xs text-zinc-400">
                    Allowed: <span className="font-mono text-zinc-300">a-z 0-9 .</span> · 1–64 · no dot at start/end
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Alias domain</Label>
                  <Select value={domain} onValueChange={setDomain}>
                    <SelectTrigger className="bg-black/30">
                      <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.length ? (
                        domains.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__none" disabled>
                          No domains available (API /domains failed)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to">Destination email</Label>
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
                  <p className="text-xs text-zinc-400">Must be a valid email address (max 254 chars).</p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="submit"
                    className="group w-full sm:w-auto"
                    disabled={requestBusy || !domains.length}
                  >
                    {subscribeButtonContent}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="group w-full border-white/10 bg-white/5 hover:bg-white/10 sm:w-auto"
                    onClick={() => copyWithFeedback("curl-subscribe", curlSubscribe, "Subscribe cURL")}
                    disabled={!domains.length || isAwaitingConfirmation}
                  >
                    {copiedId === "curl-subscribe" ? (
                      <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
                    ) : (
                      <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                    )}
                    <CopyLabel copied={copiedId === "curl-subscribe"} label="Copy subscribe cURL" />
                  </Button>
                </div>
              </form>

              <div className="space-y-3 lg:col-span-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm font-medium text-zinc-200">What you’ll get</p>
                  <Separator className="my-3 bg-white/10" />
                  {isAwaitingConfirmation && (
                    <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3">
                      <p className="text-xs font-medium text-zinc-200">Check your inbox</p>
                      {confirmationTtlMinutes !== null && (
                        <p className="mt-1 text-xs text-zinc-400">
                          TTL: {confirmationTtlMinutes} minutes
                        </p>
                      )}
                    </div>
                  )}
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
                        • Forwards to:{" "}
                        <span className="font-mono text-zinc-200">
                          {subscribeTarget || "your inbox"}
                        </span>
                      </li>
                    </ul>
                  )}

                  <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3">
                    <p className="text-xs text-zinc-400">Live request</p>
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
                  Need to remove one instead?
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* UNSUBSCRIBE */}
          <TabsContent value="unsubscribe" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-5">
              <form onSubmit={onUnsubscribe} className="space-y-5 lg:col-span-3">
                <div className="space-y-2">
                  <Label htmlFor="alias">Alias email</Label>
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
                  <p className="text-xs text-zinc-400">
                    The API will send a confirmation email (TTL is usually returned by the API).
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button type="submit" className="group w-full sm:w-auto" disabled={requestBusy}>
                    {unsubscribeButtonContent}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="group w-full border-white/10 bg-white/5 hover:bg-white/10 sm:w-auto"
                    onClick={() => copyWithFeedback("curl-unsubscribe", curlUnsubscribe, "Unsubscribe cURL")}
                    disabled={!alias.trim() || isAwaitingConfirmation}
                  >
                    {copiedId === "curl-unsubscribe" ? (
                      <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
                    ) : (
                      <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                    )}
                    <CopyLabel copied={copiedId === "curl-unsubscribe"} label="Copy unsubscribe cURL" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="group w-full border-white/10 bg-white/5 hover:bg-white/10 sm:w-auto"
                    onClick={() => {
                      resetResult();
                      setExampleUnsub();
                    }}
                  >
                    <Wand2 className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                    Fill example
                  </Button>
                </div>
              </form>

              <div className="space-y-3 lg:col-span-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm font-medium text-zinc-200">How removal works</p>
                  <Separator className="my-3 bg-white/10" />
                  {isAwaitingConfirmation && (
                    <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3">
                      <p className="text-xs font-medium text-zinc-200">Check your inbox</p>
                      {confirmationTtlMinutes !== null && (
                        <p className="mt-1 text-xs text-zinc-400">
                          TTL: {confirmationTtlMinutes} minutes
                        </p>
                      )}
                    </div>
                  )}
                  <ul className="space-y-2 text-sm text-zinc-400">
                    <li>• You request unsubscribe for an alias</li>
                    <li>• The service sends a confirmation email</li>
                    <li>• User confirms following the email instructions</li>
                  </ul>

                  <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3">
                    <p className="text-xs text-zinc-400">Live request</p>
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
                  Back to subscribe
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* CURL */}
          <TabsContent value="curl" className="mt-6 space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200">Raw commands</p>
                  <p className="text-xs text-zinc-400">
                    Generated from the current form fields. Copy and run.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="group border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => copyWithFeedback("curl-subscribe-tab", curlSubscribe, "Subscribe command")}
                    disabled={!domains.length || isAwaitingConfirmation}
                  >
                    {copiedId === "curl-subscribe-tab" ? (
                      <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
                    ) : (
                      <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                    )}
                    <CopyLabel copied={copiedId === "curl-subscribe-tab"} label="Copy subscribe" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="group border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => copyWithFeedback("curl-unsubscribe-tab", curlUnsubscribe, "Unsubscribe command")}
                    disabled={!alias.trim() || isAwaitingConfirmation}
                  >
                    {copiedId === "curl-unsubscribe-tab" ? (
                      <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
                    ) : (
                      <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                    )}
                    <CopyLabel copied={copiedId === "curl-unsubscribe-tab"} label="Copy unsubscribe" />
                  </Button>
                </div>
              </div>

              <Separator className="my-4 bg-white/10" />

              <div className="space-y-3">
                <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                  <p className="text-xs text-zinc-400">Subscribe</p>
                  <pre className={`mt-1 ${codeBlockClass}`}>
                    {curlSubscribe}
                  </pre>
                </div>

                <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                  <p className="text-xs text-zinc-400">Unsubscribe</p>
                  <pre className={`mt-1 ${codeBlockClass}`}>
                    {curlUnsubscribe}
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* RESULT */}
        {ok !== null && (
          <Alert variant={ok ? "default" : "destructive"} className="border-white/10 bg-black/30">
            <AlertTitle className="flex items-center gap-2">
              {ok ? (
                <ShieldCheck className={`h-4 w-4 ${staticIconClass}`} />
              ) : (
                <ShieldAlert className={`h-4 w-4 ${staticIconClass}`} />
              )}
              {ok ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription className="text-zinc-300">
              {ok ? (
                <>
                  The API returned a success response. See the JSON below.
                </>
              ) : (
                <>{errorText ?? "The API returned an error response. See the JSON below."}</>
              )}
            </AlertDescription>
          </Alert>
        )}

        {payload && (
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-zinc-200">Response payload</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="group border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => copyWithFeedback("response-json", safeJson(payload), "Response JSON")}
              >
                {copiedId === "response-json" ? (
                  <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
                ) : (
                  <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
                )}
                <CopyLabel copied={copiedId === "response-json"} label="Copy JSON" />
              </Button>
            </div>

            <Separator className="my-3 bg-white/10" />

            <pre className={codeBlockClass}>
              {safeJson(payload)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
