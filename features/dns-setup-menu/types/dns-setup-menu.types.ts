import type * as React from "react";

export type StatusKind = "ok" | "bad" | "idle";

export type CopyableInputRowProps = {
  id: string;
  value: string;
  label?: string;
  inputLabel: string;
  copyLabel: string;
  copiedId: string | null;
  onCopy: (id: string, value: string, label: string) => void;
};

export type FoundEntry = {
  value: string;
  isCorrect: boolean;
};

export type RecordTone = "ok" | "bad";

export type DnsValidationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  closeGuard?: boolean;
};
