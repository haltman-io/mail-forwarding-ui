import type { ReactNode } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type RequestPreviewPanelProps = {
  message: ReactNode;
  details?: ReactNode;
  curlCommand: string;
  codeBlockClass: string;
  clickableIconClass: string;
  copied: boolean;
  onCopy: () => void;
  copyDisabled?: boolean;
  pulseKey?: string;
  pulseActive?: boolean;
};

export function RequestPreviewPanel({
  message,
  details,
  curlCommand,
  codeBlockClass,
  clickableIconClass,
  copied,
  onCopy,
  copyDisabled,
  pulseKey,
  pulseActive,
}: RequestPreviewPanelProps) {
  return (
    <div className="ui-surface-pressed flex flex-col rounded-xl p-4">
      <p className="text-sm font-medium tracking-[0.02em] text-[var(--text-secondary)]">REQUEST PREVIEW</p>
      <Separator className="my-3 bg-[color:var(--hairline-border)]" />

      <div className="text-sm text-[var(--text-muted)]">{message}</div>
      {details ? <div className="mt-2 text-sm text-[var(--text-muted)]">{details}</div> : null}

      <div
        key={pulseKey ? `preview-curl-${pulseKey}` : undefined}
        className={cn(
          "ui-surface-pressed mt-5 rounded-lg p-3",
          pulseActive && "alias-preview-pulse"
        )}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">curl</p>
        <pre className={`mt-2 ${codeBlockClass}`}>{curlCommand}</pre>
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-4 w-full font-medium"
        onClick={onCopy}
        disabled={copyDisabled}
      >
        {copied ? (
          <Check className={`mr-2 h-4 w-4 text-emerald-300 ${clickableIconClass}`} />
        ) : (
          <Copy className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
        )}
        {copied ? "Copied!" : "COPY TO CLIPBOARD"}
      </Button>
    </div>
  );
}
