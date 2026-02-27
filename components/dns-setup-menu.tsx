"use client";

import * as React from "react";
import { AtSign, Check, Loader2 } from "lucide-react";

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
  getEmailFoundEntries,
  getRecordCardToneClass,
  getRecordTone,
} from "@/features/dns-setup-menu/utils/dns-setup-menu.utils";
import type {
  DnsValidationDialogProps,
} from "@/features/dns-setup-menu/types/dns-setup-menu.types";

function DnsValidationDialog({
  open,
  onOpenChange,
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
    prioritizedEmailMissing,
    showResults,
    submitDisabled,
    defaultRecordName,
    pendingRecordsViewportClass,
  } = useDnsValidationController({
    open,
    onOpenChange,
    closeGuard,
  });

  const { copiedId, copyWithFeedback } = useCopyFeedback();

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
            <Label htmlFor={`EMAIL-target`}>Domain</Label>
            <Input
              id={`EMAIL-target`}
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
            <Label htmlFor={`EMAIL-token`}>API token (optional)</Label>
            <Input
              id={`EMAIL-token`}
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

            {prioritizedEmailMissing.length ? (
                  <div className={pendingRecordsViewportClass}>
                    <div className="grid gap-3">
                      {prioritizedEmailMissing.map((item, index) => {
                        const recordType = formatCopyValue(item.type, item.key);
                        const recordName = formatCopyValue(item.name, defaultRecordName);

                        if (item.key === "MX") {
                          const foundEntries = getEmailFoundEntries(item);
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
                              <p className="text-xs uppercase tracking-wide text-zinc-500">
                                MX
                              </p>
                              <div className="mt-2 space-y-2">
                                <CopyableInputRow
                                  id={`EMAIL-mx-type-${index}`}
                                  value={recordType}
                                  label="Type"
                                  inputLabel="MX record type"
                                  copyLabel="MX record type"
                                  copiedId={copiedId}
                                  onCopy={copyWithFeedback}
                                />
                                <CopyableInputRow
                                  id={`EMAIL-mx-name-${index}`}
                                  value={recordName}
                                  label="Name"
                                  inputLabel="MX record name"
                                  copyLabel="MX record name"
                                  copiedId={copiedId}
                                  onCopy={copyWithFeedback}
                                />
                                <CopyableInputRow
                                  id={`EMAIL-mx-host-${index}`}
                                  value={item.expected.host}
                                  label="Host"
                                  inputLabel="MX host"
                                  copyLabel="MX host"
                                  copiedId={copiedId}
                                  onCopy={copyWithFeedback}
                                />
                                <CopyableInputRow
                                  id={`EMAIL-mx-priority-${index}`}
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

                        const foundEntries = getEmailFoundEntries(item);
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
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                              {item.key}
                            </p>
                            <div className="mt-2 space-y-2">
                              <CopyableInputRow
                                id={`EMAIL-${item.key.toLowerCase()}-type-${index}`}
                                value={recordType}
                                label="Type"
                                inputLabel={`${item.key} record type`}
                                copyLabel={`${item.key} record type`}
                                copiedId={copiedId}
                                onCopy={copyWithFeedback}
                              />
                              <CopyableInputRow
                                id={`EMAIL-${item.key.toLowerCase()}-name-${index}`}
                                value={recordName}
                                label="Name"
                                inputLabel={`${item.key} record name`}
                                copyLabel={`${item.key} record name`}
                                copiedId={copiedId}
                                onCopy={copyWithFeedback}
                              />
                              <CopyableInputRow
                                id={`EMAIL-${item.key.toLowerCase()}-${index}`}
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
                              <p className="mt-2 text-[11px] leading-snug text-zinc-500">
                                An <span className="font-mono text-zinc-400">A</span> record pointing to{" "}
                                <span className="font-mono text-zinc-400">161.97.146.91</span> is also accepted.
                                If your domain already resolves to this IP it will be approved automatically.
                              </p>
                            )}
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

            {status === "ACTIVE" && (
              <>
                <Separator className="my-3 bg-white/10" />
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

export function DnsSetupMenu({ triggerClassName, triggerIconClassName }: DnsSetupMenuProps = {}) {
  const [emailOpen, setEmailOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(
          "group relative inline-flex h-8 items-center justify-center gap-2 overflow-visible rounded-lg px-2.5 text-sm font-medium",
          triggerClassName ?? "border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
        )}
        aria-label="Add domain"
        title="Use your domain for aliases"
        onClick={() => setEmailOpen(true)}
      >
        <AtSign className={cn(`h-4 w-4 ${clickableIconClass}`, triggerIconClassName ?? "text-zinc-300")} />
        Add Domain
      </button>

      <DnsValidationDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        title="Use your domain for aliases"
        description="Add MX/SPF/DMARC records so we can forward mail for your domain."
        icon={AtSign}
        closeGuard
      />
    </>
  );
}
