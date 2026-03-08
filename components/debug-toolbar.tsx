"use client";

import * as React from "react";
import { Bug, X, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { AbuseMenu } from "@/components/abuse-menu";
import { PrivacyMenu } from "@/components/privacy-menu";
import { ApiTokenDialog } from "@/components/api-token-dialog";
import { BrowserAddonMenu } from "@/components/browser-addon-menu";
import { DnsSetupMenu } from "@/components/dns-setup-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* ── helpers ── */

const noop = () => {};

const sectionBtn =
  "inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[11px] font-medium tracking-wide transition-colors duration-150 border whitespace-nowrap";
const btnDefault =
  `${sectionBtn} border-[var(--hairline-border)] bg-[var(--surface-pressed)] text-[var(--text-secondary)] hover:bg-[var(--hover-state)] hover:text-[var(--text-primary)]`;
const btnAccent =
  `${sectionBtn} border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20`;
const btnWarn =
  `${sectionBtn} border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20`;
const btnDanger =
  `${sectionBtn} border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20`;

/* ── section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
      {children}
    </span>
  );
}

/* ── mock dialogs ── */

function MockAboutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--hairline-border)] bg-[var(--surface-elevated)]">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-[0.08em]">
            About
          </DialogTitle>
          <DialogDescription className="text-[var(--text-secondary)]">
            Free Mail Forwarding — Privacy-first alias forwarding by THC /
            Haltman.
          </DialogDescription>
        </DialogHeader>
        <Separator className="bg-[var(--hover-state)]" />
        <p className="text-xs text-[var(--text-muted)]">
          [Debug mock] This is a mockup of the About dialog for visual testing.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function MockConfirmCodeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [code, setCode] = React.useState("");
  const [guardOpen, setGuardOpen] = React.useState(false);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) {
            setGuardOpen(true);
            return;
          }
          onOpenChange(v);
        }}
      >
        <DialogContent className="border-[var(--hairline-border)] bg-[var(--surface-elevated)]">
          <DialogHeader>
            <DialogTitle>Enter confirmation code</DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              [Debug mock] A 6-digit OTP would have been sent to your email.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
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
          <Alert
            variant="destructive"
            className="border-[var(--hairline-border)] bg-[var(--surface-pressed)]"
          >
            <AlertTitle>Mock error</AlertTitle>
            <AlertDescription className="text-[var(--text-secondary)]">
              This is a simulated error for visual testing purposes.
            </AlertDescription>
          </Alert>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Confirm (mock)
          </Button>
        </DialogContent>
      </Dialog>

      <AlertDialog open={guardOpen} onOpenChange={setGuardOpen}>
        <AlertDialogContent className="border-[var(--hairline-border)] bg-[var(--surface-elevated)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Close confirmation?</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--text-secondary)]">
              [Debug mock] You have an unfinished confirmation flow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setGuardOpen(false);
                onOpenChange(false);
              }}
            >
              Close anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function MockAlertDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-[var(--hairline-border)] bg-[var(--surface-elevated)]">
        <AlertDialogHeader>
          <AlertDialogTitle>Mock confirmation</AlertDialogTitle>
          <AlertDialogDescription className="text-[var(--text-secondary)]">
            [Debug mock] This is a mock alert dialog for visual testing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ── main toolbar ── */

export function DebugToolbar() {
  const [expanded, setExpanded] = React.useState(false);
  const [visible, setVisible] = React.useState(true);

  /* mock dialog states */
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [confirmCodeOpen, setConfirmCodeOpen] = React.useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = React.useState(false);

  if (!visible) {
    return (
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="fixed bottom-4 right-4 z-[9999] inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-400 shadow-lg backdrop-blur-md transition-opacity hover:bg-amber-500/25"
        aria-label="Show debug toolbar"
        title="Show debug toolbar"
      >
        <Bug className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <>
      {/* mock dialogs (rendered always so they can be opened) */}
      <MockAboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
      <MockConfirmCodeDialog
        open={confirmCodeOpen}
        onOpenChange={setConfirmCodeOpen}
      />
      <MockAlertDialog
        open={alertDialogOpen}
        onOpenChange={setAlertDialogOpen}
      />

      {/* floating footer */}
      <div className="fixed inset-x-0 bottom-0 z-[9999] pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-5xl px-3 pb-3">
          <div className="rounded-xl border border-amber-500/25 bg-[var(--surface-base-translucent)] shadow-[0_-4px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            {/* toolbar header */}
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <Bug className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-400">
                  Debug Toolbar
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  DEV ONLY
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--hover-state)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={expanded ? "Collapse toolbar" : "Expand toolbar"}
                >
                  {expanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setVisible(false)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--hover-state)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="Hide debug toolbar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* expanded panel */}
            {expanded && (
              <>
                <Separator className="bg-amber-500/15" />
                <div className="space-y-3 px-4 py-3">
                  {/* ── Dialogs ── */}
                  <div className="flex flex-wrap items-center gap-2">
                    <SectionLabel>Dialogs</SectionLabel>
                    <button
                      type="button"
                      className={btnAccent}
                      onClick={() => setAboutOpen(true)}
                    >
                      About
                    </button>
                    <ApiTokenDialog
                      onApiStatusChange={noop}
                      triggerClassName={btnAccent}
                      triggerIconClassName="h-3 w-3 text-blue-400"
                    />
                    <button
                      type="button"
                      className={btnAccent}
                      onClick={() => setConfirmCodeOpen(true)}
                    >
                      OTP Confirm
                    </button>
                    <button
                      type="button"
                      className={btnWarn}
                      onClick={() => setAlertDialogOpen(true)}
                    >
                      Alert Dialog
                    </button>
                    <DnsSetupMenu
                      triggerClassName={btnAccent}
                      triggerIconClassName="h-3 w-3 text-blue-400"
                    />
                  </div>

                  {/* ── Menus / Popups ── */}
                  <div className="flex flex-wrap items-center gap-2">
                    <SectionLabel>Menus</SectionLabel>
                    <BrowserAddonMenu
                      triggerClassName={btnDefault}
                      triggerIconClassName="h-3 w-3 text-[var(--text-muted)]"
                    />
                    <AbuseMenu />
                    <PrivacyMenu />
                  </div>

                  {/* ── Toasts ── */}
                  <div className="flex flex-wrap items-center gap-2">
                    <SectionLabel>Toasts</SectionLabel>
                    <button
                      type="button"
                      className={btnDefault}
                      onClick={() =>
                        toast.success("Mock success", {
                          description: "This is a debug success toast.",
                        })
                      }
                    >
                      Success
                    </button>
                    <button
                      type="button"
                      className={btnDanger}
                      onClick={() =>
                        toast.error("Mock error", {
                          description: "This is a debug error toast.",
                        })
                      }
                    >
                      Error
                    </button>
                    <button
                      type="button"
                      className={btnDefault}
                      onClick={() =>
                        toast.info("Mock info", {
                          description: "This is a debug info toast.",
                        })
                      }
                    >
                      Info
                    </button>
                    <button
                      type="button"
                      className={btnWarn}
                      onClick={() =>
                        toast.warning("Mock warning", {
                          description: "This is a debug warning toast.",
                        })
                      }
                    >
                      Warning
                    </button>
                    <button
                      type="button"
                      className={btnDefault}
                      onClick={() =>
                        toast.loading("Mock loading…", {
                          description: "Simulating a loading state.",
                        })
                      }
                    >
                      Loading
                    </button>
                    <button
                      type="button"
                      className={btnDefault}
                      onClick={() =>
                        toast("Copied to clipboard", {
                          description: "mock@alias.example.com",
                        })
                      }
                    >
                      Copy feedback
                    </button>
                  </div>

                  {/* ── Alerts (inline) ── */}
                  <div className="space-y-2">
                    <SectionLabel>Inline Alerts</SectionLabel>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Alert className="border-[var(--hairline-border)] bg-[var(--surface-pressed)]">
                        <AlertTitle>Default alert</AlertTitle>
                        <AlertDescription className="text-[var(--text-secondary)]">
                          Mock default alert for visual testing.
                        </AlertDescription>
                      </Alert>
                      <Alert
                        variant="destructive"
                        className="border-[var(--hairline-border)] bg-[var(--surface-pressed)]"
                      >
                        <AlertTitle>Destructive alert</AlertTitle>
                        <AlertDescription className="text-[var(--text-secondary)]">
                          Mock destructive alert for visual testing.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
