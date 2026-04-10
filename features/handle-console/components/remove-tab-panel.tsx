import type { FormEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";

import { HandleRequestPreviewPanel } from "@/features/handle-console/components/handle-request-preview-panel";
import type {
  PreviewSummaryItem,
  RequestPreviewState,
} from "@/features/handle-console/types/handle-console.types";

type RemoveTabPanelProps = {
  handle: string;
  requestBusy: boolean;
  removeButtonContent: ReactNode;
  onHandleChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onViewCurl: () => void;
};

export function RemoveTabPanel({
  handle,
  requestBusy,
  removeButtonContent,
  onHandleChange,
  onSubmit,
  onViewCurl,
}: RemoveTabPanelProps) {
  const trimmedHandle = handle.trim();
  const previewState: RequestPreviewState = trimmedHandle ? "draft" : "empty";
  const previewSummaryItems: PreviewSummaryItem[] = [
    {
      label: "Action",
      value: "Remove handle",
      tone: "danger",
    },
    {
      label: "Handle",
      value: trimmedHandle || "{handle}",
      mono: true,
      tone: trimmedHandle ? "danger" : "muted",
    },
  ];

  return (
    <TabsContent value="remove" className="mt-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={onSubmit} className="space-y-5 lg:col-span-3">
          <div className="space-y-2">
            <Label htmlFor="handle-remove" className="text-[13px] font-medium text-[var(--text-secondary)]">
              Handle
            </Label>
            <Input
              id="handle-remove"
              placeholder="extencil"
              value={handle}
              onChange={(e) => onHandleChange(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              className="neu-inset"
            />
            <p className="text-xs text-[var(--text-muted)]">
              The handle will stop routing, but the name stays permanently reserved.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button type="submit" className="neu-btn-destructive group w-full sm:w-auto" variant="destructive" disabled={requestBusy}>
              {removeButtonContent}
            </Button>
          </div>
        </form>

        <div className="hidden space-y-3 lg:col-span-2 lg:block lg:self-start">
          <HandleRequestPreviewPanel
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
