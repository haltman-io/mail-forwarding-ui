import type { FormEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { RequestPreviewPanel } from "@/features/alias-console/components/request-preview-panel";
import type {
  PreviewSummaryItem,
  RequestPreviewState,
} from "@/features/alias-console/types/alias-console.types";

type UnsubscribeTabPanelProps = {
  alias: string;
  requestBusy: boolean;
  unsubscribeButtonContent: ReactNode;
  onAliasChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onViewCurl: () => void;
};

export function UnsubscribeTabPanel({
  alias,
  requestBusy,
  unsubscribeButtonContent,
  onAliasChange,
  onSubmit,
  onViewCurl,
}: UnsubscribeTabPanelProps) {
  const trimmedAlias = alias.trim();
  const previewState: RequestPreviewState = trimmedAlias ? "draft" : "empty";
  const previewSummaryItems: PreviewSummaryItem[] = [
    {
      label: "Action",
      value: "Delete alias",
      tone: "danger",
    },
    {
      label: "Alias",
      value: trimmedAlias || "alias@domain.tld",
      mono: true,
      tone: trimmedAlias ? "danger" : "muted",
    },
  ];

  return (
    <TabsContent value="unsubscribe" className="mt-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={onSubmit} className="space-y-5 lg:col-span-3">
          <div className="space-y-2">
            <Label htmlFor="alias" className="text-[13px] font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Alias
            </Label>
            <Input
              id="alias"
              type="email"
              placeholder="docs.curl@fwd.haltman.io"
              value={alias}
              onChange={(e) => onAliasChange(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              className="neu-inset"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button type="submit" className="neu-btn-destructive group w-full sm:w-auto" variant="destructive" disabled={requestBusy}>
              {unsubscribeButtonContent}
            </Button>
          </div>
        </form>

        <div className="hidden space-y-3 lg:col-span-2 lg:block lg:self-start">
          <RequestPreviewPanel
            intent="unsubscribe"
            state={previewState}
            summaryItems={previewSummaryItems}
            onViewCurl={onViewCurl}
            viewCurlLabel="View cURL command"
          />
        </div>
      </div>
    </TabsContent>
  );
}
