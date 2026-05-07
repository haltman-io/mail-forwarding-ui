"use client";

import * as React from "react";
import { AtSign, Check, Globe2, Loader2, Mail } from "lucide-react";

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
import { badgeClasses } from "@/lib/utils-mail";
import { useCopyFeedback } from "@/lib/use-copy-feedback";
import { cn } from "@/lib/utils";
import { CollapsedOkRecord } from "@/features/dns-setup-menu/components/collapsed-ok-record";
import { CopyableInputRow } from "@/features/dns-setup-menu/components/copyable-input-row";
import { FoundEntries } from "@/features/dns-setup-menu/components/found-entries";
import { useDnsValidationController } from "@/features/dns-setup-menu/hooks/use-dns-validation-controller";
import {
  clickableIconClass,
  formatCopyValue,
  getDnsFoundEntries,
  getRecordCardToneClass,
  getRecordTone,
} from "@/features/dns-setup-menu/utils/dns-setup-menu.utils";
import type {
  DnsValidationDialogProps,
} from "@/features/dns-setup-menu/types/dns-setup-menu.types";
import type { DnsRequestType } from "@/lib/dns-validation";

const DNS_REQUEST_OPTIONS: {
  type: DnsRequestType;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  tldr: string;
}[] = [
  {
    type: "UI",
    icon: Globe2,
    title: "Replicate this website on my hostname",
    description:
      "Create a CNAME (or A) DNS record to replicate this front-end on a hostname you control.",
    tldr: "Users were able to access this website at https://your-domain.com",
  },
  {
    type: "EMAIL",
    icon: Mail,
    title: "Provide forwardings to my hostname",
    description:
      "Create DNS records for MX, SPF, DMARC, and DKIM to enable email forwarding using your hostname.",
    tldr:
      "Users will be able to create email addresses such as user@your-domain.com to receive emails.",
  },
];

function RequestTypeCard({
  option,
  selected,
  disabled,
  onSelect,
}: {
  option: (typeof DNS_REQUEST_OPTIONS)[number];
  selected: boolean;
  disabled: boolean;
  onSelect: (type: DnsRequestType) => void;
}) {
  const Icon = option.icon;
  const inputId = `dns-request-type-${option.type.toLowerCase()}`;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "group relative flex min-h-0 cursor-pointer flex-col rounded-xl border p-3 text-left transition-all duration-200 ease-[var(--motion-ease-standard)] sm:min-h-[208px] sm:p-4",
        "focus-within:ring-2 focus-within:ring-[var(--focus-ring)] focus-within:ring-offset-0",
        disabled && "cursor-not-allowed opacity-60",
        selected
          ? "border-[rgb(var(--alias-accent-rgb)_/_0.72)] bg-[rgb(var(--alias-accent-rgb)_/_0.08)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_0_1px_rgb(var(--alias-accent-rgb)_/_0.12),0_16px_34px_-24px_rgb(var(--alias-accent-rgb)_/_0.55)]"
          : "border-[var(--hairline-border)] bg-[var(--surface-pressed)] hover:border-[rgb(var(--alias-accent-rgb)_/_0.28)] hover:bg-[var(--hover-state)]"
      )}
    >
      <input
        id={inputId}
        type="radio"
        name="dns-request-type"
        value={option.type}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(option.type)}
        className="sr-only"
      />
      <span
        className={cn(
          "absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border transition-colors duration-200",
          selected
            ? "border-[var(--alias-accent)] bg-[var(--alias-accent)] text-[var(--alias-accent-fg)]"
            : "border-[var(--hairline-border)] bg-[var(--surface-elevated)] text-transparent"
        )}
        aria-hidden="true"
      >
        <Check className="h-3 w-3" />
      </span>

      <span
        className={cn(
          "mb-3 flex size-9 items-center justify-center rounded-xl border transition-colors duration-200 sm:mb-4 sm:size-10",
          selected
            ? "border-[rgb(var(--alias-accent-rgb)_/_0.28)] bg-[rgb(var(--alias-accent-rgb)_/_0.12)] text-[var(--alias-accent)]"
            : "border-[var(--hairline-border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]"
        )}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>

      <span className="pr-7 text-[14px] font-semibold leading-snug tracking-tight text-[var(--text-primary)] sm:text-[15px]">
        {option.title}
      </span>
      <span className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
        {option.description}
      </span>
      <span className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
        <span className="font-semibold text-[var(--text-secondary)]">
          TL;DR:
        </span>{" "}
        {option.tldr}
      </span>
    </label>
  );
}

function DnsValidationDialog({
  open,
  onOpenChange,
  requestType,
  onRequestTypeChange,
  title,
  description,
  icon: Icon,
  closeGuard = false,
}: DnsValidationDialogProps) {
  const {
    target,
    setTarget,
    errorText,
    isSubmitting,
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
    prioritizedMissingRecords,
    showResults,
    submitDisabled,
    defaultRecordName,
    pendingRecordsViewportClass,
  } = useDnsValidationController({
    open,
    onOpenChange,
    requestType,
    closeGuard,
  });

  const { copiedId, copyWithFeedback } = useCopyFeedback();

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-[760px] flex-col overflow-hidden border-[var(--hairline-border)] bg-[var(--surface-elevated)] p-0 sm:max-h-[min(90dvh,760px)] sm:w-full"
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
        <DialogHeader className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${clickableIconClass}`} />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onStartValidation} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4">
              <fieldset className="flex flex-col">
                <legend className="mb-4 text-sm font-medium text-[var(--text-primary)]">
                  Setup type
                </legend>
                <div
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  role="radiogroup"
                  aria-label="Domain setup type"
                >
                  {DNS_REQUEST_OPTIONS.map((option) => (
                    <RequestTypeCard
                      key={option.type}
                      option={option}
                      selected={requestType === option.type}
                      disabled={isSubmitting}
                      onSelect={onRequestTypeChange}
                    />
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`${requestType}-target`}>Hostname</Label>
                <Input
                  id={`${requestType}-target`}
                  placeholder="example.com"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  autoCapitalize="none"
                  spellCheck={false}
                  className="bg-[var(--surface-pressed)]"
                />
                <p className="text-xs text-[var(--text-secondary)]">
                  Plain hostname only (no scheme or path).
                </p>
              </div>

              {errorText && (
                <Alert variant="destructive" className="border-[var(--hairline-border)] bg-[var(--surface-pressed)]">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="text-[var(--text-secondary)]">
                    {errorText}
                  </AlertDescription>
                </Alert>
              )}

              {showResults && (
                <div className="rounded-xl border border-[var(--hairline-border)] bg-[var(--surface-pressed)] p-4">
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
                      <span className="text-xs text-[var(--text-secondary)]">
                        Next check: {nextCheckLabel}
                      </span>
                    )}
                  </div>

                  <Separator className="my-3 bg-[var(--hover-state)]" />

                  {prioritizedMissingRecords.length ? (
                    <div className={pendingRecordsViewportClass}>
                      <div className="grid gap-3">
                        {prioritizedMissingRecords.map((item, index) => {
                          const recordType = formatCopyValue(item.type, item.key);
                          const recordName = formatCopyValue(item.name, defaultRecordName);

                          if (item.key === "MX") {
                            const foundEntries = getDnsFoundEntries(item);
                            const recordTone = getRecordTone(item.ok, foundEntries);

                            if (recordTone === "ok") {
                              return (
                                <CollapsedOkRecord
                                  key={`${item.key}-${index}`}
                                  recordKey="MX"
                                  name={recordName}
                                />
                              );
                            }

                            const cardToneClass = getRecordCardToneClass(recordTone);
                            return (
                              <div
                                key={`${item.key}-${index}`}
                                className={`min-w-0 rounded-lg border p-3 ${cardToneClass}`}
                              >
                                <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                                  MX
                                </p>
                                <div className="mt-2 space-y-2">
                                  <CopyableInputRow
                                    id={`${requestType}-mx-type-${index}`}
                                    value={recordType}
                                    label="Type"
                                    inputLabel="MX record type"
                                    copyLabel="MX record type"
                                    copiedId={copiedId}
                                    onCopy={copyWithFeedback}
                                  />
                                  <CopyableInputRow
                                    id={`${requestType}-mx-name-${index}`}
                                    value={recordName}
                                    label="Name"
                                    inputLabel="MX record name"
                                    copyLabel="MX record name"
                                    copiedId={copiedId}
                                    onCopy={copyWithFeedback}
                                  />
                                  <CopyableInputRow
                                    id={`${requestType}-mx-host-${index}`}
                                    value={item.expected.host}
                                    label="Host"
                                    inputLabel="MX host"
                                    copyLabel="MX host"
                                    copiedId={copiedId}
                                    onCopy={copyWithFeedback}
                                  />
                                  <CopyableInputRow
                                    id={`${requestType}-mx-priority-${index}`}
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
                                  tone={recordTone}
                                />
                              </div>
                            );
                          }

                          const foundEntries = getDnsFoundEntries(item);
                          const recordTone = getRecordTone(item.ok, foundEntries);

                          if (recordTone === "ok") {
                            return (
                              <CollapsedOkRecord
                                key={`${item.key}-${index}`}
                                recordKey={item.key}
                                name={recordName}
                              />
                            );
                          }

                          const cardToneClass = getRecordCardToneClass(recordTone);

                          return (
                            <div
                              key={`${item.key}-${index}`}
                              className={`min-w-0 rounded-lg border p-3 ${cardToneClass}`}
                            >
                              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                                {item.key}
                              </p>
                              <div className="mt-2 space-y-2">
                                <CopyableInputRow
                                  id={`${requestType}-${item.key.toLowerCase()}-type-${index}`}
                                  value={recordType}
                                  label="Type"
                                  inputLabel={`${item.key} record type`}
                                  copyLabel={`${item.key} record type`}
                                  copiedId={copiedId}
                                  onCopy={copyWithFeedback}
                                />
                                <CopyableInputRow
                                  id={`${requestType}-${item.key.toLowerCase()}-name-${index}`}
                                  value={recordName}
                                  label="Name"
                                  inputLabel={`${item.key} record name`}
                                  copyLabel={`${item.key} record name`}
                                  copiedId={copiedId}
                                  onCopy={copyWithFeedback}
                                />
                                <CopyableInputRow
                                  id={`${requestType}-${item.key.toLowerCase()}-${index}`}
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
                                tone={recordTone}
                              />
                              {(item.key as string) === "CNAME" && recordTone === "bad" && (
                                <p className="mt-2 text-[11px] leading-snug text-[var(--text-muted)]">
                                  An <span className="font-mono text-[var(--text-secondary)]">A</span> record pointing to{" "}
                                  <span className="font-mono text-[var(--text-secondary)]">137.74.118.86</span> is also accepted.
                                  If your domain already resolves to this IP it will be approved automatically.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-secondary)]">
                      No missing records reported yet.
                    </p>
                  )}

                  {status === "ACTIVE" && (
                    <>
                      <Separator className="my-3 bg-[var(--hover-state)]" />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          className="group bg-emerald-600 text-white hover:bg-emerald-500"
                          onClick={handleDone}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Done
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/*
          <div className="space-y-2">
            <Label htmlFor={`EMAIL-token`}>API token (optional)</Label>
            <Input
              id={`EMAIL-token`}
              placeholder="x-api-key"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              className="bg-[var(--surface-pressed)]"
            />
            <p className="text-xs text-[var(--text-secondary)]">
              Only needed when your server requires an API key for checkdns.
            </p>
          </div>
          */}

          <DialogFooter className="shrink-0 border-t border-[var(--hairline-border)] bg-[var(--surface-elevated)] px-4 py-3 sm:justify-between sm:px-6">
            <Button
              type="submit"
              className="group"
              disabled={submitDisabled}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
                  Proceeding...
                </>
              ) : (
                "Proceed"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="group border-[var(--hairline-border)] bg-[var(--hover-state)] hover:bg-[var(--hover-state)]"
              onClick={requestClose}
            >
              Close
            </Button>
          </DialogFooter>
        </form>
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

type DnsSetupMenuProps = {
  triggerClassName?: string;
  triggerIconClassName?: string;
};

export function DnsSetupMenu({
  triggerClassName,
  triggerIconClassName,
}: DnsSetupMenuProps = {}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [requestType, setRequestType] = React.useState<DnsRequestType>("EMAIL");

  return (
    <>
      <button
        type="button"
        className={cn(
          "group relative inline-flex items-center gap-2 overflow-visible rounded-lg text-sm font-medium",
          triggerClassName ?? "h-8 justify-center px-2.5 border border-[var(--hairline-border)] bg-[var(--hover-state)] text-[var(--text-primary)] hover:bg-[var(--hover-state)]"
        )}
        aria-label="Add domain"
        title="Add domain"
        onClick={() => setDialogOpen(true)}
      >
        <AtSign className={cn(`h-4 w-4 ${clickableIconClass}`, triggerIconClassName ?? "text-[var(--text-secondary)]")} />
        Add Domain
      </button>

      <DnsValidationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        requestType={requestType}
        onRequestTypeChange={setRequestType}
        title="Add domain"
        description="Select what this hostname should provide, then validate the DNS records."
        icon={AtSign}
        closeGuard
      />
    </>
  );
}
