import type { FormEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { RequestPreviewPanel } from "@/features/alias-console/components/request-preview-panel";

type UnsubscribeTabPanelProps = {
  alias: string;
  requestBusy: boolean;
  unsubscribeButtonContent: ReactNode;
  copiedId: string | null;
  unsubscribePreviewPulseSource: string;
  curlUnsubscribe: string;
  codeBlockClass: string;
  clickableIconClass: string;
  onAliasChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCopyUnsubscribePreview: () => void;
};

export function UnsubscribeTabPanel({
  alias,
  requestBusy,
  unsubscribeButtonContent,
  copiedId,
  unsubscribePreviewPulseSource,
  curlUnsubscribe,
  codeBlockClass,
  clickableIconClass,
  onAliasChange,
  onSubmit,
  onCopyUnsubscribePreview,
}: UnsubscribeTabPanelProps) {
  const previewMessage = alias.trim()
    ? "Review before removing the alias."
    : "Fill the form to preview your alias.";

  const previewDetails = alias.trim() ? (
    <p className="font-mono text-xs text-[var(--text-secondary)]">Alias: {alias.trim()}</p>
  ) : null;

  return (
    <TabsContent value="unsubscribe" className="mt-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={onSubmit} className="space-y-5 lg:col-span-3">
          <div className="space-y-2">
            <Label htmlFor="alias" className="text-[13px] font-medium text-[var(--text-secondary)]">
              ALIAS
            </Label>
            <Input
              id="alias"
              type="email"
              placeholder="docs.curl@fwd.haltman.io"
              value={alias}
              onChange={(e) => onAliasChange(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button type="submit" className="group w-full sm:w-auto" variant="destructive" disabled={requestBusy}>
              {unsubscribeButtonContent}
            </Button>
          </div>
        </form>

        <div className="hidden space-y-3 lg:col-span-2 lg:block">
          <RequestPreviewPanel
            message={previewMessage}
            details={previewDetails}
            curlCommand={curlUnsubscribe}
            codeBlockClass={codeBlockClass}
            clickableIconClass={clickableIconClass}
            copied={copiedId === "preview-unsubscribe-curl"}
            onCopy={onCopyUnsubscribePreview}
            pulseKey={unsubscribePreviewPulseSource}
            pulseActive={Boolean(alias.trim())}
          />
        </div>
      </div>
    </TabsContent>
  );
}
