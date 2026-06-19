"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  KeyRound,
  Loader2,
  Trash2,
} from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ApiCredentialItem,
  CredentialConfirmation,
  CredentialResponse,
  boolFromApi,
  confirmCredentialAction,
  describeCredentialError,
  isValidApiKey,
  normalizeApiKey,
  normalizeConfirmationToken,
  requestCreateCredential,
  requestCredentialAutomaticRenew,
  requestCredentialDestroy,
  requestCredentialDestroyAll,
  requestCredentialList,
  requestCredentialRenew,
} from "@/lib/api-credentials";
import { cn, safeDateLabel } from "@/lib/utils";
import { validateMailboxEmail } from "@/lib/utils-mail";

type ApiStatus = "idle" | "connected" | "error";
type CredentialTab =
  | "create"
  | "list"
  | "renew"
  | "automatic"
  | "destroy"
  | "destroy-all";
type BusyAction =
  | "create"
  | "list"
  | "renew"
  | "automatic"
  | "destroy"
  | "destroy-all"
  | "confirm";
type Feedback = {
  tone: "success" | "error" | "info";
  title: string;
  message?: string;
};
type ConfirmationFlow = {
  action: "create" | "list" | "destroy_all";
  email: string;
  title: string;
  description: string;
  confirmation?: CredentialConfirmation;
};

const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";
const inputClassName = "neu-inset h-10 rounded-xl px-3 font-mono text-xs";
const mutedPanelClassName =
  "rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.025)] p-3";

function sanitizeDaysInput(value: string, maxDigits: number) {
  return value.replace(/\D/g, "").slice(0, maxDigits);
}

function formatMaybeDate(value?: string | null) {
  if (!value) return "-";
  return safeDateLabel(value);
}

function formatCompactDateTime(value?: string | null) {
  if (!value) return "-";

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;

  const date = new Date(parsed);
  const year = String(date.getFullYear()).slice(-2);
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${date.getMonth() + 1}/${date.getDate()}/${year} ${hour}:${minute}`;
}

function validateDays(value: string, min: number, max: number) {
  const days = Number.parseInt(value, 10);
  if (!Number.isFinite(days) || days < min || days > max) {
    return {
      ok: false as const,
      error: `Days must be between ${min} and ${max}.`,
    };
  }
  return { ok: true as const, value: days };
}

function confirmationNotice(flow: ConfirmationFlow) {
  const confirmation = flow.confirmation;
  if (!confirmation) return flow.description;

  if (confirmation.sent === false && confirmation.reason === "cooldown") {
    return confirmation.next_allowed_send_at
      ? `A code was already sent. Wait until ${formatMaybeDate(confirmation.next_allowed_send_at)} before requesting another e-mail.`
      : "A code was already sent. Wait before requesting another e-mail.";
  }

  if (confirmation.sent === false && confirmation.reason === "rate_limited") {
    return "Too many confirmation e-mails were requested for this pending action.";
  }

  if (confirmation.sent === true) {
    const ttl = confirmation.ttl_minutes
      ? ` It expires in ${confirmation.ttl_minutes} minutes.`
      : "";
    return `${flow.description}${ttl}`;
  }

  return flow.description;
}

function tokenKindLabel(action?: string) {
  if (action === "api_credentials_list_confirm") return "List confirmed";
  if (action === "api_credentials_destroy_all_confirm")
    return "Destroy all confirmed";
  return "Created";
}

function apiKeyPreview(value: string) {
  return `${value.slice(0, 6)}...`;
}

function StatusBadge({ item }: { item: ApiCredentialItem }) {
  const active = boolFromApi(item.active);
  const autoRenew = boolFromApi(item.automatic_renew);

  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="fancy" color={active ? "emerald" : "red"}>
        {active ? "active" : "inactive"}
      </Badge>
      {autoRenew ? (
        <Badge variant="fancy" color="sky">
          auto
        </Badge>
      ) : null}
    </div>
  );
}

function CredentialItemsTable({ items }: { items: ApiCredentialItem[] }) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          mutedPanelClassName,
          "text-center text-xs text-[var(--text-muted)]",
        )}
      >
        No active API keys were returned.
      </div>
    );
  }

  return (
    <div className="max-h-[220px] overflow-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
      <Table className="table-fixed sm:table-auto">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="hidden w-14 pl-3 text-xs text-[var(--text-muted)] sm:table-cell">
              ID
            </TableHead>
            <TableHead className="w-[34%] px-2 text-xs text-[var(--text-muted)] sm:w-auto">
              Status
            </TableHead>
            <TableHead className="w-[33%] px-2 text-xs text-[var(--text-muted)] sm:w-auto">
              Expires
            </TableHead>
            <TableHead className="w-[33%] px-2 text-xs text-[var(--text-muted)] sm:w-auto sm:pr-3">
              Last used
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-[var(--hover-state)]">
              <TableCell className="hidden pl-3 font-mono text-xs tabular-nums text-[var(--text-secondary)] sm:table-cell">
                {item.id}
              </TableCell>
              <TableCell className="px-2">
                <StatusBadge item={item} />
              </TableCell>
              <TableCell className="px-2 font-mono text-[11px] tabular-nums text-[var(--text-secondary)] sm:text-xs">
                <span className="sm:hidden">
                  {formatCompactDateTime(item.expires_at)}
                </span>
                <span className="hidden sm:inline">
                  {formatMaybeDate(item.expires_at)}
                </span>
              </TableCell>
              <TableCell className="px-2 font-mono text-[11px] tabular-nums text-[var(--text-muted)] sm:pr-3 sm:text-xs">
                <span className="sm:hidden">
                  {formatCompactDateTime(item.last_used_at)}
                </span>
                <span className="hidden sm:inline">
                  {formatMaybeDate(item.last_used_at)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ApiTokenDialog({
  onApiStatusChange,
  triggerClassName,
  triggerIconClassName,
  triggerLabel = "API Keys",
}: {
  onApiStatusChange?: (status: ApiStatus) => void;
  triggerClassName?: string;
  triggerIconClassName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<CredentialTab>("create");
  const [busyAction, setBusyAction] = React.useState<BusyAction | null>(null);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const [confirmationFlow, setConfirmationFlow] =
    React.useState<ConfirmationFlow | null>(null);
  const [confirmationOpen, setConfirmationOpen] = React.useState(false);
  const [confirmationToken, setConfirmationToken] = React.useState("");
  const [destroyConfirmOpen, setDestroyConfirmOpen] = React.useState(false);
  const [pendingDestroyKey, setPendingDestroyKey] = React.useState<
    string | null
  >(null);

  const [createEmail, setCreateEmail] = React.useState("");
  const [createDays, setCreateDays] = React.useState("365");
  const [createAutomaticRenew, setCreateAutomaticRenew] = React.useState(false);
  const [createdToken, setCreatedToken] =
    React.useState<CredentialResponse | null>(null);

  const [listEmail, setListEmail] = React.useState("");
  const [listedItems, setListedItems] = React.useState<
    ApiCredentialItem[] | null
  >(null);

  const [renewKey, setRenewKey] = React.useState("");
  const [renewDays, setRenewDays] = React.useState("10");
  const [renewResult, setRenewResult] =
    React.useState<CredentialResponse | null>(null);

  const [automaticKey, setAutomaticKey] = React.useState("");
  const [automaticRenew, setAutomaticRenew] = React.useState(true);
  const [automaticResult, setAutomaticResult] =
    React.useState<CredentialResponse | null>(null);

  const [destroyKey, setDestroyKey] = React.useState("");
  const [destroyResult, setDestroyResult] =
    React.useState<CredentialResponse | null>(null);

  const [destroyAllEmail, setDestroyAllEmail] = React.useState("");
  const [destroyAllResult, setDestroyAllResult] =
    React.useState<CredentialResponse | null>(null);

  const toastSuccess = React.useCallback(
    (title: string, description?: string) => {
      toast.success(title, {
        description,
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      });
    },
    [],
  );

  const toastError = React.useCallback(
    (title: string, description?: string) => {
      toast.error(title, {
        description,
        icon: <AlertTriangle className="h-4 w-4 text-rose-400" />,
      });
    },
    [],
  );

  const resetDialogState = React.useCallback(() => {
    setActiveTab("create");
    setBusyAction(null);
    setFeedback(null);
    setConfirmationFlow(null);
    setConfirmationOpen(false);
    setConfirmationToken("");
    setDestroyConfirmOpen(false);
    setPendingDestroyKey(null);
    setCreateEmail("");
    setCreateDays("365");
    setCreateAutomaticRenew(false);
    setCreatedToken(null);
    setListEmail("");
    setListedItems(null);
    setRenewKey("");
    setRenewDays("10");
    setRenewResult(null);
    setAutomaticKey("");
    setAutomaticRenew(true);
    setAutomaticResult(null);
    setDestroyKey("");
    setDestroyResult(null);
    setDestroyAllEmail("");
    setDestroyAllResult(null);
  }, []);

  function showError(title: string, message: string) {
    onApiStatusChange?.("error");
    setFeedback({ tone: "error", title, message });
    toastError(title, message);
  }

  function showSuccess(title: string, message?: string) {
    onApiStatusChange?.("connected");
    setFeedback({ tone: "success", title, message });
    toastSuccess(title, message);
  }

  function validateEmailField(raw: string) {
    const validation = validateMailboxEmail(raw);
    if (!validation.ok) {
      return { ok: false as const, error: validation.error };
    }
    return { ok: true as const, value: validation.value };
  }

  function validateApiKeyField(raw: string) {
    const apiKey = normalizeApiKey(raw);
    if (!isValidApiKey(apiKey)) {
      return {
        ok: false as const,
        error: "API key must be 64 lowercase hexadecimal characters.",
      };
    }
    return { ok: true as const, value: apiKey };
  }

  function startConfirmation(flow: ConfirmationFlow) {
    setConfirmationFlow(flow);
    setConfirmationOpen(true);
    setConfirmationToken("");
    setFeedback(null);
    setOpen(false);
  }

  function closeConfirmationDialog() {
    if (busyAction === "confirm") return;

    setConfirmationOpen(false);
    setConfirmationFlow(null);
    setConfirmationToken("");
    setFeedback(null);
    setOpen(true);
  }

  async function onCreateCredential(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setCreatedToken(null);

    const email = validateEmailField(createEmail);
    const days = validateDays(createDays, 1, 9999);

    if (!email.ok) {
      setFeedback({
        tone: "error",
        title: "Invalid e-mail",
        message: email.error,
      });
      return;
    }

    if (!days.ok) {
      setFeedback({
        tone: "error",
        title: "Invalid validity",
        message: days.error,
      });
      return;
    }

    setBusyAction("create");
    try {
      const result = await requestCreateCredential({
        email: email.value,
        days: days.value,
        automatic_renew: createAutomaticRenew,
      });

      if (!result.ok) {
        showError(
          "Request failed",
          describeCredentialError(
            result,
            "Could not request API key creation.",
          ),
        );
        return;
      }

      startConfirmation({
        action: "create",
        email: email.value,
        title: "Confirm API key creation",
        description: `Enter the six-digit code sent to ${email.value}.`,
        confirmation: result.data?.confirmation,
      });
    } catch (error) {
      showError(
        "Network error",
        error instanceof Error ? error.message : "Try again.",
      );
    } finally {
      setBusyAction((current) => (current === "create" ? null : current));
    }
  }

  async function onListCredentialRequest(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setListedItems(null);

    const email = validateEmailField(listEmail);
    if (!email.ok) {
      setFeedback({
        tone: "error",
        title: "Invalid e-mail",
        message: email.error,
      });
      return;
    }

    setBusyAction("list");
    try {
      const result = await requestCredentialList(email.value);

      if (!result.ok) {
        showError(
          "Request failed",
          describeCredentialError(result, "Could not request API key list."),
        );
        return;
      }

      startConfirmation({
        action: "list",
        email: email.value,
        title: "Confirm API key list",
        description: `Enter the six-digit code sent to ${email.value}.`,
        confirmation: result.data?.confirmation,
      });
    } catch (error) {
      showError(
        "Network error",
        error instanceof Error ? error.message : "Try again.",
      );
    } finally {
      setBusyAction((current) => (current === "list" ? null : current));
    }
  }

  async function onRenewCredential(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setRenewResult(null);

    const apiKey = validateApiKeyField(renewKey);
    const days = validateDays(renewDays, 1, 999);

    if (!apiKey.ok) {
      setFeedback({
        tone: "error",
        title: "Invalid API key",
        message: apiKey.error,
      });
      return;
    }

    if (!days.ok) {
      setFeedback({
        tone: "error",
        title: "Invalid renewal",
        message: days.error,
      });
      return;
    }

    setBusyAction("renew");
    try {
      const result = await requestCredentialRenew({
        api_key: apiKey.value,
        days: days.value,
      });

      if (!result.ok) {
        showError(
          "Renew failed",
          describeCredentialError(result, "Could not renew the API key."),
        );
        return;
      }

      setRenewResult(result.data);
      showSuccess(
        "API key renewed",
        `${days.value} day${days.value === 1 ? "" : "s"} added.`,
      );
    } catch (error) {
      showError(
        "Network error",
        error instanceof Error ? error.message : "Try again.",
      );
    } finally {
      setBusyAction((current) => (current === "renew" ? null : current));
    }
  }

  async function onAutomaticRenew(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setAutomaticResult(null);

    const apiKey = validateApiKeyField(automaticKey);
    if (!apiKey.ok) {
      setFeedback({
        tone: "error",
        title: "Invalid API key",
        message: apiKey.error,
      });
      return;
    }

    setBusyAction("automatic");
    try {
      const result = await requestCredentialAutomaticRenew({
        api_key: apiKey.value,
        automatic_renew: automaticRenew,
      });

      if (!result.ok) {
        showError(
          "Update failed",
          describeCredentialError(result, "Could not update automatic renew."),
        );
        return;
      }

      setAutomaticResult(result.data);
      showSuccess(
        automaticRenew ? "Automatic renew enabled" : "Automatic renew disabled",
      );
    } catch (error) {
      showError(
        "Network error",
        error instanceof Error ? error.message : "Try again.",
      );
    } finally {
      setBusyAction((current) => (current === "automatic" ? null : current));
    }
  }

  function onDestroyCredentialRequest(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setDestroyResult(null);

    const apiKey = validateApiKeyField(destroyKey);
    if (!apiKey.ok) {
      setFeedback({
        tone: "error",
        title: "Invalid API key",
        message: apiKey.error,
      });
      return;
    }

    setPendingDestroyKey(apiKey.value);
    setDestroyConfirmOpen(true);
  }

  async function confirmDestroyCredential() {
    if (!pendingDestroyKey) return;

    setBusyAction("destroy");
    try {
      const result = await requestCredentialDestroy(pendingDestroyKey);

      if (!result.ok) {
        showError(
          "Destroy failed",
          describeCredentialError(result, "Could not destroy the API key."),
        );
        return;
      }

      setDestroyResult(result.data);
      setDestroyConfirmOpen(false);
      setPendingDestroyKey(null);
      setDestroyKey("");
      showSuccess(
        "API key destroyed",
        result.data?.notification_sent === false
          ? "The key was destroyed, but the notification e-mail was not sent."
          : "The key was destroyed.",
      );
    } catch (error) {
      showError(
        "Network error",
        error instanceof Error ? error.message : "Try again.",
      );
    } finally {
      setBusyAction((current) => (current === "destroy" ? null : current));
    }
  }

  async function onDestroyAllCredentialRequest(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setDestroyAllResult(null);

    const email = validateEmailField(destroyAllEmail);
    if (!email.ok) {
      setFeedback({
        tone: "error",
        title: "Invalid e-mail",
        message: email.error,
      });
      return;
    }

    setBusyAction("destroy-all");
    try {
      const result = await requestCredentialDestroyAll(email.value);

      if (!result.ok) {
        showError(
          "Request failed",
          describeCredentialError(
            result,
            "Could not request API key destruction.",
          ),
        );
        return;
      }

      startConfirmation({
        action: "destroy_all",
        email: email.value,
        title: "Confirm destroy all",
        description: `Enter the six-digit code sent to ${email.value}.`,
        confirmation: result.data?.confirmation,
      });
    } catch (error) {
      showError(
        "Network error",
        error instanceof Error ? error.message : "Try again.",
      );
    } finally {
      setBusyAction((current) => (current === "destroy-all" ? null : current));
    }
  }

  async function onConfirmCredential(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmationFlow) return;

    const token = normalizeConfirmationToken(confirmationToken);
    if (token.length !== 6) {
      setFeedback({
        tone: "error",
        title: "Invalid code",
        message: "Enter the six-digit confirmation code.",
      });
      return;
    }

    setBusyAction("confirm");
    try {
      const result = await confirmCredentialAction(token);

      if (!result.ok) {
        showError(
          "Confirmation failed",
          describeCredentialError(result, "Could not confirm this action."),
        );
        return;
      }

      const data = result.data;
      setConfirmationFlow(null);
      setConfirmationOpen(false);
      setConfirmationToken("");
      setOpen(true);

      if (data?.token) {
        setActiveTab("create");
        setCreatedToken(data);
        showSuccess("API key created", "Copy it now. It is shown only once.");
        return;
      }

      if (Array.isArray(data?.items)) {
        setActiveTab("list");
        setListedItems(data.items);
        showSuccess(
          "API keys loaded",
          `${data.items.length} active key${data.items.length === 1 ? "" : "s"} returned.`,
        );
        return;
      }

      if (data?.action === "api_credentials_destroy_all_confirm") {
        setActiveTab("destroy-all");
        setDestroyAllResult(data);
        showSuccess(
          "API keys destroyed",
          `${data.deleted_count ?? 0} key${data.deleted_count === 1 ? "" : "s"} removed.`,
        );
        return;
      }

      showSuccess(tokenKindLabel(data?.action), data?.email);
    } catch (error) {
      showError(
        "Network error",
        error instanceof Error ? error.message : "Try again.",
      );
    } finally {
      setBusyAction((current) => (current === "confirm" ? null : current));
    }
  }

  async function copyCreatedToken() {
    if (!createdToken?.token) return;
    await navigator.clipboard.writeText(createdToken.token);
    toastSuccess("API key copied");
  }

  const feedbackAlert = feedback ? (
    <Alert variant={feedback.tone === "error" ? "destructive" : "default"}>
      {feedback.tone === "error" ? <AlertTriangle /> : <CheckCircle2 />}
      <AlertTitle>{feedback.title}</AlertTitle>
      {feedback.message ? (
        <AlertDescription>{feedback.message}</AlertDescription>
      ) : null}
    </Alert>
  ) : null;
  const confirmationFeedback = confirmationOpen ? feedback : null;
  const confirmationHelperText =
    confirmationFlow?.confirmation?.sent === false
      ? confirmationNotice(confirmationFlow)
      : confirmationFlow?.confirmation?.ttl_minutes
        ? `Enter the 6-digit code from your email. It expires in ${confirmationFlow.confirmation.ttl_minutes} minutes.`
        : "Enter the 6-digit code from your email.";

  return (
    <>
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
              triggerClassName ??
                "h-8 justify-center border border-[var(--hairline-border)] bg-[var(--hover-state)] px-2.5 text-[var(--text-primary)] hover:bg-[var(--hover-state)]",
            )}
            title="Manage API keys for alias automation."
            aria-label="Manage API keys for alias automation."
          >
            <KeyRound
              className={cn(
                "h-4 w-4",
                triggerIconClassName ?? "text-[var(--text-secondary)]",
              )}
            />
            {triggerLabel}
          </button>
        </DialogTrigger>

        <DialogContent className="max-h-[min(92svh,760px)] w-[min(96vw,46rem)] overflow-hidden border-[var(--hairline-border)] bg-[var(--surface-elevated)] p-0">
          <div className="flex max-h-[inherit] flex-col">
            <div className="border-b border-[rgba(255,255,255,0.06)] px-6 pt-6 pb-4">
              <DialogHeader>
                <DialogTitle>API keys</DialogTitle>
                <DialogDescription>
                  Create, list, renew, and remove API keys for alias automation.{" "}
                  <a
                    href="/api/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4"
                  >
                    API Docs
                  </a>
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-4">
                {feedbackAlert}

                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as CredentialTab)
                  }
                >
                  <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-3 lg:grid-cols-6">
                    <TabsTrigger value="create">Create</TabsTrigger>
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="renew">Renew</TabsTrigger>
                    <TabsTrigger value="automatic">Auto</TabsTrigger>
                    <TabsTrigger value="destroy">Destroy</TabsTrigger>
                    <TabsTrigger value="destroy-all">Destroy all</TabsTrigger>
                  </TabsList>

                  <TabsContent value="create" className="pt-3">
                    <form
                      onSubmit={onCreateCredential}
                      className="flex flex-col gap-4"
                    >
                      <FieldGroup className="gap-4">
                        <Field>
                          <FieldLabel htmlFor="api-create-email">
                            Owner e-mail
                          </FieldLabel>
                          <Input
                            id="api-create-email"
                            type="email"
                            placeholder="owner@example.com"
                            value={createEmail}
                            onChange={(e) => setCreateEmail(e.target.value)}
                            autoCapitalize="none"
                            autoComplete="email"
                            spellCheck={false}
                            className={inputClassName}
                          />
                          <FieldDescription>
                            Managed forwarding domains are not accepted as
                            API-key owner domains.
                          </FieldDescription>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="api-create-days">
                            Validity in days
                          </FieldLabel>
                          <Input
                            id="api-create-days"
                            inputMode="numeric"
                            min={1}
                            max={9999}
                            value={createDays}
                            onChange={(e) =>
                              setCreateDays(
                                sanitizeDaysInput(e.target.value, 4),
                              )
                            }
                            className={inputClassName}
                          />
                        </Field>
                        <Field
                          orientation="horizontal"
                          className={mutedPanelClassName}
                        >
                          <Switch
                            id="api-create-auto-renew"
                            checked={createAutomaticRenew}
                            onCheckedChange={setCreateAutomaticRenew}
                          />
                          <FieldLabel
                            htmlFor="api-create-auto-renew"
                            className="cursor-pointer"
                          >
                            Automatic renew
                          </FieldLabel>
                        </Field>
                      </FieldGroup>

                      {createdToken?.token ? (
                        <div
                          className={cn(
                            mutedPanelClassName,
                            "flex flex-col gap-3",
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[var(--text-primary)]">
                                API key created
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                Shown once. Copy it before closing.
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={copyCreatedToken}
                              className="shrink-0"
                            >
                              <Clipboard className="h-4 w-4" />
                              Copy
                            </Button>
                          </div>
                          <code className="block max-w-full overflow-hidden rounded-lg border border-[rgba(255,255,255,0.06)] bg-black/20 p-3 font-mono text-xs text-[var(--text-secondary)]">
                            <span className="block truncate sm:hidden">
                              {apiKeyPreview(createdToken.token)}
                            </span>
                            <span className="hidden overflow-x-auto whitespace-nowrap sm:block">
                              {createdToken.token}
                            </span>
                          </code>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="fancy" color="emerald">
                              {createdToken.expires_in_days ?? createDays} days
                            </Badge>
                            <Badge
                              variant="fancy"
                              color={
                                boolFromApi(createdToken.automatic_renew)
                                  ? "sky"
                                  : "primary"
                              }
                            >
                              {boolFromApi(createdToken.automatic_renew)
                                ? "auto renew"
                                : "manual renew"}
                            </Badge>
                          </div>
                        </div>
                      ) : null}

                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={busyAction === "create"}
                        >
                          {busyAction === "create" ? (
                            <>
                              <Loader2
                                className={`h-4 w-4 animate-spin ${clickableIconClass}`}
                              />
                              Sending...
                            </>
                          ) : (
                            "Send confirmation"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>

                  <TabsContent value="list" className="pt-3">
                    <form
                      onSubmit={onListCredentialRequest}
                      className="flex flex-col gap-4"
                    >
                      <FieldGroup className="gap-4">
                        <Field>
                          <FieldLabel htmlFor="api-list-email">
                            Owner e-mail
                          </FieldLabel>
                          <Input
                            id="api-list-email"
                            type="email"
                            placeholder="owner@example.com"
                            value={listEmail}
                            onChange={(e) => setListEmail(e.target.value)}
                            autoCapitalize="none"
                            autoComplete="email"
                            spellCheck={false}
                            className={inputClassName}
                          />
                        </Field>
                      </FieldGroup>

                      {listedItems ? (
                        <CredentialItemsTable items={listedItems} />
                      ) : null}

                      <DialogFooter>
                        <Button type="submit" disabled={busyAction === "list"}>
                          {busyAction === "list" ? (
                            <>
                              <Loader2
                                className={`h-4 w-4 animate-spin ${clickableIconClass}`}
                              />
                              Sending...
                            </>
                          ) : (
                            "Send confirmation"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>

                  <TabsContent value="renew" className="pt-3">
                    <form
                      onSubmit={onRenewCredential}
                      className="flex flex-col gap-4"
                    >
                      <FieldGroup className="gap-4">
                        <Field>
                          <FieldLabel htmlFor="api-renew-key">
                            API key
                          </FieldLabel>
                          <Input
                            id="api-renew-key"
                            type="password"
                            placeholder="64 lowercase hex characters"
                            value={renewKey}
                            onChange={(e) => setRenewKey(e.target.value)}
                            autoCapitalize="none"
                            autoComplete="off"
                            spellCheck={false}
                            className={inputClassName}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="api-renew-days">
                            Days to add
                          </FieldLabel>
                          <Input
                            id="api-renew-days"
                            inputMode="numeric"
                            min={1}
                            max={999}
                            value={renewDays}
                            onChange={(e) =>
                              setRenewDays(sanitizeDaysInput(e.target.value, 3))
                            }
                            className={inputClassName}
                          />
                        </Field>
                      </FieldGroup>

                      {renewResult?.item ? (
                        <div
                          className={cn(
                            mutedPanelClassName,
                            "flex flex-col gap-2 text-xs text-[var(--text-secondary)]",
                          )}
                        >
                          <p>
                            <span className="text-[var(--text-muted)]">
                              Expires:
                            </span>{" "}
                            {formatMaybeDate(renewResult.item.expires_at)}
                          </p>
                          <p>
                            <span className="text-[var(--text-muted)]">
                              Days added:
                            </span>{" "}
                            {renewResult.days_added ?? renewDays}
                          </p>
                        </div>
                      ) : null}

                      <DialogFooter>
                        <Button type="submit" disabled={busyAction === "renew"}>
                          {busyAction === "renew" ? (
                            <>
                              <Loader2
                                className={`h-4 w-4 animate-spin ${clickableIconClass}`}
                              />
                              Renewing...
                            </>
                          ) : (
                            "Renew key"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>

                  <TabsContent value="automatic" className="pt-3">
                    <form
                      onSubmit={onAutomaticRenew}
                      className="flex flex-col gap-4"
                    >
                      <FieldGroup className="gap-4">
                        <Field>
                          <FieldLabel htmlFor="api-automatic-key">
                            API key
                          </FieldLabel>
                          <Input
                            id="api-automatic-key"
                            type="password"
                            placeholder="64 lowercase hex characters"
                            value={automaticKey}
                            onChange={(e) => setAutomaticKey(e.target.value)}
                            autoCapitalize="none"
                            autoComplete="off"
                            spellCheck={false}
                            className={inputClassName}
                          />
                        </Field>
                        <Field
                          orientation="horizontal"
                          className={mutedPanelClassName}
                        >
                          <Switch
                            id="api-automatic-renew"
                            checked={automaticRenew}
                            onCheckedChange={setAutomaticRenew}
                          />
                          <FieldLabel
                            htmlFor="api-automatic-renew"
                            className="cursor-pointer"
                          >
                            Automatic renew
                          </FieldLabel>
                        </Field>
                      </FieldGroup>

                      {automaticResult ? (
                        <div
                          className={cn(
                            mutedPanelClassName,
                            "flex items-center justify-between gap-3",
                          )}
                        >
                          <span className="text-sm text-[var(--text-secondary)]">
                            Current setting
                          </span>
                          <Badge
                            variant="fancy"
                            color={
                              boolFromApi(automaticResult.automatic_renew)
                                ? "sky"
                                : "primary"
                            }
                          >
                            {boolFromApi(automaticResult.automatic_renew)
                              ? "enabled"
                              : "disabled"}
                          </Badge>
                        </div>
                      ) : null}

                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={busyAction === "automatic"}
                        >
                          {busyAction === "automatic" ? (
                            <>
                              <Loader2
                                className={`h-4 w-4 animate-spin ${clickableIconClass}`}
                              />
                              Updating...
                            </>
                          ) : (
                            "Update"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>

                  <TabsContent value="destroy" className="pt-3">
                    <form
                      onSubmit={onDestroyCredentialRequest}
                      className="flex flex-col gap-4"
                    >
                      <FieldGroup className="gap-4">
                        <Field>
                          <FieldLabel htmlFor="api-destroy-key">
                            API key
                          </FieldLabel>
                          <Input
                            id="api-destroy-key"
                            type="password"
                            placeholder="64 lowercase hex characters"
                            value={destroyKey}
                            onChange={(e) => setDestroyKey(e.target.value)}
                            autoCapitalize="none"
                            autoComplete="off"
                            spellCheck={false}
                            className={inputClassName}
                          />
                          <FieldDescription>
                            This action destroys only the key you paste here.
                          </FieldDescription>
                        </Field>
                      </FieldGroup>

                      {destroyResult ? (
                        <div
                          className={cn(
                            mutedPanelClassName,
                            "flex items-center gap-2 text-sm text-[var(--text-secondary)]",
                          )}
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          API key destroyed.
                        </div>
                      ) : null}

                      <DialogFooter>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={busyAction === "destroy"}
                        >
                          <Trash2 className="h-4 w-4" />
                          Destroy key
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>

                  <TabsContent value="destroy-all" className="pt-3">
                    <form
                      onSubmit={onDestroyAllCredentialRequest}
                      className="flex flex-col gap-4"
                    >
                      <FieldGroup className="gap-4">
                        <Field>
                          <FieldLabel htmlFor="api-destroy-all-email">
                            Owner e-mail
                          </FieldLabel>
                          <Input
                            id="api-destroy-all-email"
                            type="email"
                            placeholder="owner@example.com"
                            value={destroyAllEmail}
                            onChange={(e) => setDestroyAllEmail(e.target.value)}
                            autoCapitalize="none"
                            autoComplete="email"
                            spellCheck={false}
                            className={inputClassName}
                          />
                        </Field>
                      </FieldGroup>

                      {destroyAllResult ? (
                        <div
                          className={cn(
                            mutedPanelClassName,
                            "flex items-center justify-between gap-3",
                          )}
                        >
                          <span className="text-sm text-[var(--text-secondary)]">
                            Deleted keys
                          </span>
                          <Badge variant="fancy" color="red">
                            {destroyAllResult.deleted_count ?? 0}
                          </Badge>
                        </div>
                      ) : null}

                      <DialogFooter>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={busyAction === "destroy-all"}
                        >
                          {busyAction === "destroy-all" ? (
                            <>
                              <Loader2
                                className={`h-4 w-4 animate-spin ${clickableIconClass}`}
                              />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Send confirmation
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmationOpen}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setConfirmationOpen(true);
            return;
          }

          closeConfirmationDialog();
        }}
      >
        <DialogContent className="w-[min(92vw,22rem)] overflow-hidden border-[var(--hairline-border)] bg-[var(--surface-elevated)] p-0">
          <div className="space-y-4 px-6 pt-6">
            <DialogHeader>
              <DialogTitle>Confirm email code</DialogTitle>
              <DialogDescription>
                We sent a 6-digit verification code to{" "}
                <span className="font-mono text-[var(--text-secondary)]">
                  {confirmationFlow?.email ?? "your email"}
                </span>
                . Enter it below to finish.
              </DialogDescription>
            </DialogHeader>

            <form
              id="api-confirmation-otp-form"
              onSubmit={onConfirmCredential}
              className="space-y-3"
            >
              <div className="space-y-2">
                <Label htmlFor="api-confirmation-code">Verification code</Label>
                <InputOTP
                  id="api-confirmation-code"
                  maxLength={6}
                  value={confirmationToken}
                  onChange={(value) =>
                    setConfirmationToken(normalizeConfirmationToken(value))
                  }
                  disabled={busyAction === "confirm"}
                  containerClassName="w-full justify-start gap-2"
                >
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-10 *:data-[slot=input-otp-slot]:text-lg">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator className="mx-2 text-[var(--text-muted)]" />
                  <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-10 *:data-[slot=input-otp-slot]:text-lg">
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                {confirmationFeedback?.tone === "error" ? (
                  <p role="alert" className="text-xs font-medium text-rose-300">
                    {confirmationFeedback.message ?? confirmationFeedback.title}
                  </p>
                ) : (
                  <p
                    className={cn(
                      "text-xs",
                      confirmationFlow?.confirmation?.sent === false
                        ? "text-amber-300"
                        : "text-[var(--text-muted)]",
                    )}
                  >
                    {confirmationHelperText}
                  </p>
                )}
              </div>
            </form>
          </div>

          <Separator className="bg-[color:var(--hairline-border)]" />

          <DialogFooter className="flex flex-col gap-2 px-6 pb-6">
            <Button
              form="api-confirmation-otp-form"
              type="submit"
              className="alias-primary neu-btn-green group h-10 w-full rounded-xl font-mono text-sm font-semibold"
              disabled={
                confirmationToken.length !== 6 || busyAction === "confirm"
              }
            >
              {busyAction === "confirm" ? (
                <>
                  <Loader2
                    className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`}
                  />
                  Confirming...
                </>
              ) : (
                "Confirm code"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={destroyConfirmOpen}
        onOpenChange={setDestroyConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Destroy this API key?</AlertDialogTitle>
            <AlertDialogDescription>
              This does not require an e-mail code. The key will stop working
              immediately after confirmation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyAction === "destroy"}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDestroyCredential}
              disabled={busyAction === "destroy"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busyAction === "destroy" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Destroying...
                </>
              ) : (
                "Destroy"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
