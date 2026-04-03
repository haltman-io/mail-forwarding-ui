import { Check, Copy, ArrowUpRight, ArrowDownLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

import { CopyLabel } from "@/features/alias-console/components/copy-label";

type CurlTabPanelProps = {
  copiedId: string | null;
  curlSubscribe: string;
  curlUnsubscribe: string;
  codeBlockClass: string;
  clickableIconClass: string;
  canCopySubscribe: boolean;
  canCopyUnsubscribe: boolean;
  onCopySubscribe: () => void;
  onCopyUnsubscribe: () => void;
};

function CurlBlock({
  label,
  icon: Icon,
  command,
  copied,
  canCopy,
  onCopy,
  clickableIconClass,
  codeBlockClass,
  copyId,
}: {
  label: string;
  icon: typeof ArrowUpRight;
  command: string;
  copied: boolean;
  canCopy: boolean;
  onCopy: () => void;
  clickableIconClass: string;
  codeBlockClass: string;
  copyId: string;
}) {
  return (
    <div className="ui-surface-pressed overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-[var(--hairline-border)] px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
          <Icon className="h-3 w-3 text-[var(--alias-accent)] opacity-60" />
          {label}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="group -mr-1.5 h-7 gap-1.5 px-2 text-[11px]"
          onClick={onCopy}
          disabled={!canCopy}
        >
          {copied ? (
            <Check className={`h-3.5 w-3.5 text-emerald-400 ${clickableIconClass}`} />
          ) : (
            <Copy className={`h-3.5 w-3.5 ${clickableIconClass}`} />
          )}
          <CopyLabel copied={copied} label="Copy" />
        </Button>
      </div>
      <div className="p-3">
        <pre className={codeBlockClass}>{command}</pre>
      </div>
    </div>
  );
}

export function CurlTabPanel({
  copiedId,
  curlSubscribe,
  curlUnsubscribe,
  codeBlockClass,
  clickableIconClass,
  canCopySubscribe,
  canCopyUnsubscribe,
  onCopySubscribe,
  onCopyUnsubscribe,
}: CurlTabPanelProps) {
  return (
    <TabsContent value="curl" className="mt-6 hidden space-y-3 sm:block">
      <div className="mb-4">
        <p className="text-xs leading-relaxed text-[var(--text-muted)]">
          Raw commands ready to paste into your terminal.
        </p>
      </div>

      <CurlBlock
        label="Create alias"
        icon={ArrowUpRight}
        command={curlSubscribe}
        copied={copiedId === "curl-subscribe-tab"}
        canCopy={canCopySubscribe}
        onCopy={onCopySubscribe}
        clickableIconClass={clickableIconClass}
        codeBlockClass={codeBlockClass}
        copyId="curl-subscribe-tab"
      />

      <CurlBlock
        label="Delete alias"
        icon={ArrowDownLeft}
        command={curlUnsubscribe}
        copied={copiedId === "curl-unsubscribe-tab"}
        canCopy={canCopyUnsubscribe}
        onCopy={onCopyUnsubscribe}
        clickableIconClass={clickableIconClass}
        codeBlockClass={codeBlockClass}
        copyId="curl-unsubscribe-tab"
      />
    </TabsContent>
  );
}
