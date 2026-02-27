import * as React from "react";
import { Loader2 } from "lucide-react";

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type ConfirmCodeDialogProps = {
  open: boolean;
  closeGuardOpen: boolean;
  confirmCode: string;
  confirmLoading: boolean;
  confirmErrorText: string | null;
  clickableIconClass: string;
  onDialogOpenChange: (open: boolean) => void;
  onCloseGuardOpenChange: (open: boolean) => void;
  onCloseAnyway: () => void;
  onConfirmCodeSubmit: (e: React.FormEvent) => void;
  onConfirmCodeChange: (value: string) => void;
};

export function ConfirmCodeDialog({
  open,
  closeGuardOpen,
  confirmCode,
  confirmLoading,
  confirmErrorText,
  clickableIconClass,
  onDialogOpenChange,
  onCloseGuardOpenChange,
  onCloseAnyway,
  onConfirmCodeSubmit,
  onConfirmCodeChange,
}: ConfirmCodeDialogProps) {
  return (
    <>
      <Dialog open={open} onOpenChange={onDialogOpenChange}>
        <DialogContent className="max-w-[22rem] p-0">
          <div className="space-y-4 px-6 pt-6">
            <DialogHeader>
              <DialogTitle>Confirm email code</DialogTitle>
              <DialogDescription>
                We sent a 6-digit verification code to your email. Enter it below to finish.
              </DialogDescription>
            </DialogHeader>

            <form id="confirm-otp-form" onSubmit={onConfirmCodeSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label>Verification code</Label>
                <InputOTP
                  maxLength={6}
                  value={confirmCode}
                  className="w-full"
                  containerClassName="w-full justify-start gap-2"
                  onChange={onConfirmCodeChange}
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
                <p className="text-xs text-[var(--text-muted)]">Enter the 6-digit code from your email.</p>
              </div>

              {confirmErrorText && (
                <Alert variant="destructive">
                  <AlertTitle>Confirmation failed</AlertTitle>
                  <AlertDescription className="text-[var(--text-secondary)]">{confirmErrorText}</AlertDescription>
                </Alert>
              )}
            </form>
          </div>

          <Separator className="bg-[color:var(--hairline-border)]" />

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

      <AlertDialog open={closeGuardOpen} onOpenChange={onCloseGuardOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close confirmation?</AlertDialogTitle>
            <AlertDialogDescription>
              If you close now, your confirmation progress may be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={onCloseAnyway}>Close anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
