import { Check, Copy, ArrowUpRight, ArrowDownLeft, ShieldOff, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

import { CopyLabel } from "@/features/alias-console/components/copy-label";

type HandleCurlTabPanelProps = {
  copiedId: string | null;
  curlClaim: string;
  curlRemove: string;
  curlDomainDisable: string;
  curlDomainEnable: string;
  codeBlockClass: string;
  clickableIconClass: string;
  canCopyClaim: boolean;
  canCopyRemove: boolean;
  canCopyDomain: boolean;
  onCopyClaim: () => void;
  onCopyRemove: () => void;
  onCopyDomainDisable: () => void;
  onCopyDomainEnable: () => void;
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
}: {
  label: string;
  icon: typeof ArrowUpRight;
  command: string;
  copied: boolean;
  canCopy: boolean;
  onCopy: () => void;
  clickableIconClass: string;
  codeBlockClass: string;
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

export function HandleCurlTabPanel({
  copiedId,
  curlClaim,
  curlRemove,
  curlDomainDisable,
  curlDomainEnable,
  codeBlockClass,
  clickableIconClass,
  canCopyClaim,
  canCopyRemove,
  canCopyDomain,
  onCopyClaim,
  onCopyRemove,
  onCopyDomainDisable,
  onCopyDomainEnable,
}: HandleCurlTabPanelProps) {
  return (
    <TabsContent value="curl" className="mt-6 hidden space-y-3 sm:block">
      <div className="mb-4">
        <p className="text-xs leading-relaxed text-[var(--text-muted)]">
          Raw commands ready to paste into your terminal.
        </p>
      </div>

      <CurlBlock
        label="Claim handle"
        icon={ArrowUpRight}
        command={curlClaim}
        copied={copiedId === "curl-claim"}
        canCopy={canCopyClaim}
        onCopy={onCopyClaim}
        clickableIconClass={clickableIconClass}
        codeBlockClass={codeBlockClass}
      />

      <CurlBlock
        label="Remove handle"
        icon={ArrowDownLeft}
        command={curlRemove}
        copied={copiedId === "curl-remove"}
        canCopy={canCopyRemove}
        onCopy={onCopyRemove}
        clickableIconClass={clickableIconClass}
        codeBlockClass={codeBlockClass}
      />

      <CurlBlock
        label="Disable domain"
        icon={ShieldOff}
        command={curlDomainDisable}
        copied={copiedId === "curl-domain-disable"}
        canCopy={canCopyDomain}
        onCopy={onCopyDomainDisable}
        clickableIconClass={clickableIconClass}
        codeBlockClass={codeBlockClass}
      />

      <CurlBlock
        label="Enable domain"
        icon={ShieldCheck}
        command={curlDomainEnable}
        copied={copiedId === "curl-domain-enable"}
        canCopy={canCopyDomain}
        onCopy={onCopyDomainEnable}
        clickableIconClass={clickableIconClass}
        codeBlockClass={codeBlockClass}
      />
    </TabsContent>
  );
}
