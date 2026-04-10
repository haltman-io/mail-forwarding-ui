import type { FormEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";

import { HandleRequestPreviewPanel } from "@/features/handle-console/components/handle-request-preview-panel";
import type {
  HandleSnapshot,
  PreviewSummaryItem,
  RequestPreviewState,
} from "@/features/handle-console/types/handle-console.types";

type ClaimTabPanelProps = {
  handle: string;
  to: string;
  requestBusy: boolean;
  claimButtonContent: ReactNode;
  showConfirmedPanel: boolean;
  confirmedSnapshot: HandleSnapshot | null;
  claimAwaiting: boolean;
  claimHasInput: boolean;
  claimReady: boolean;
  onHandleChange: (value: string) => void;
  onToChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onViewCurl: () => void;
};

export function ClaimTabPanel({
  handle,
  to,
  requestBusy,
  claimButtonContent,
  showConfirmedPanel,
  confirmedSnapshot,
  claimAwaiting,
  claimHasInput,
  claimReady,
  onHandleChange,
  onToChange,
  onSubmit,
  onViewCurl,
}: ClaimTabPanelProps) {
  const previewState: RequestPreviewState = showConfirmedPanel
    ? "confirmed"
    : claimAwaiting
      ? "awaiting_confirmation"
      : claimHasInput
        ? "draft"
        : "empty";

  const previewSummaryItems: PreviewSummaryItem[] = [
    {
      label: "Action",
      value: "Claim handle",
      tone: "accent",
    },
    {
      label: "Handle",
      value:
        showConfirmedPanel && confirmedSnapshot?.handle
          ? confirmedSnapshot.handle
          : handle.trim() || "{handle}",
      mono: true,
      tone:
        showConfirmedPanel && confirmedSnapshot?.handle
          ? "accent"
          : handle.trim()
            ? "accent"
            : "muted",
    },
    {
      label: "Destination",
      value:
        showConfirmedPanel && confirmedSnapshot?.to
          ? confirmedSnapshot.to
          : to.trim() || "destination@mailbox.tld",
      mono: true,
      tone:
        showConfirmedPanel && confirmedSnapshot?.to
          ? "default"
          : to.trim()
            ? "default"
            : "muted",
    },
  ];

  return (
    <TabsContent value="claim" className="mt-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={onSubmit} className="space-y-5 lg:col-span-3 min-w-0">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="handle-claim" className="text-[13px] font-medium text-[var(--text-secondary)]">
              Handle
            </Label>
            <Input
              id="handle-claim"
              placeholder="extencil"
              value={handle}
              onChange={(e) => onHandleChange(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              className="neu-inset"
            />
            <p className="text-xs text-[var(--text-muted)]">
              Your unique username across all domains. Once claimed, nobody else can use it.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="handle-to" className="text-[13px] font-medium text-[var(--text-secondary)]">
              Destination email address
            </Label>
            <Input
              id="handle-to"
              type="email"
              placeholder="extencil@proton.me"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              className="neu-inset"
            />
            <p className="text-xs text-[var(--text-muted)]">Must be a valid mailbox.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              className="alias-primary neu-btn-green group w-full sm:w-auto"
              disabled={requestBusy}
            >
              {claimButtonContent}
            </Button>
          </div>
        </form>

        <div className="hidden space-y-3 lg:col-span-2 lg:block lg:self-start">
          <HandleRequestPreviewPanel
            intent="subscribe"
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
