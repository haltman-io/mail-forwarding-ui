import type { HandleIntent, PreviewSummaryItem, RequestPreviewState } from "@/features/handle-console/types/handle-console.types";
import { Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type HandleRequestPreviewPanelProps = {
  intent: HandleIntent;
  state: RequestPreviewState;
  summaryItems?: PreviewSummaryItem[];
  onViewCurl: () => void;
  viewCurlLabel: string;
};

const PREVIEW_CONTENT: Record<
  HandleIntent,
  {
    statusLabels: Record<RequestPreviewState, string>;
    messages: Record<RequestPreviewState, string>;
  }
> = {
  subscribe: {
    statusLabels: {
      empty: "Waiting for input",
      draft: "Ready",
      awaiting_confirmation: "Email pending",
      confirmed: "Confirmed",
    },
    messages: {
      empty: "",
      draft: "Review the handle claim request assembled from the current form values.",
      awaiting_confirmation: "A confirmation email is required before the handle becomes active.",
      confirmed: "Handle is confirmed and forwarding emails to the selected mailbox.",
    },
  },
  unsubscribe: {
    statusLabels: {
      empty: "Waiting for handle",
      draft: "Ready to remove",
      awaiting_confirmation: "Pending",
      confirmed: "Confirmed",
    },
    messages: {
      empty: "",
      draft: "Review the handle before sending the removal request.",
      awaiting_confirmation: "The removal request is being prepared.",
      confirmed: "This handle has been deactivated.",
    },
  },
  domain_disable: {
    statusLabels: {
      empty: "Waiting for input",
      draft: "Ready to disable",
      awaiting_confirmation: "Pending",
      confirmed: "Confirmed",
    },
    messages: {
      empty: "",
      draft: "Review the domain to block for this handle.",
      awaiting_confirmation: "A confirmation email has been sent to the handle owner.",
      confirmed: "Domain has been disabled for this handle.",
    },
  },
  domain_enable: {
    statusLabels: {
      empty: "Waiting for input",
      draft: "Ready to enable",
      awaiting_confirmation: "Pending",
      confirmed: "Confirmed",
    },
    messages: {
      empty: "",
      draft: "Review the domain to re-enable for this handle.",
      awaiting_confirmation: "A confirmation email has been sent to the handle owner.",
      confirmed: "Domain has been re-enabled for this handle.",
    },
  },
};

export function HandleRequestPreviewPanel({
  intent,
  state,
  summaryItems,
  onViewCurl,
  viewCurlLabel,
}: HandleRequestPreviewPanelProps) {
  const content = PREVIEW_CONTENT[intent];

  return (
    <div
      className="neu-preview-panel flex flex-col rounded-xl p-4"
      data-preview-intent={intent}
      data-preview-state={state}
    >
      <div className="neu-preview-header space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="neu-preview-heading">Request Preview</p>
          </div>
          <span className="neu-preview-status shrink-0">{content.statusLabels[state]}</span>
        </div>
        <p className="neu-preview-message">{content.messages[state]}</p>
      </div>

      <Separator className="bg-[color:var(--hairline-border)]" />

      {summaryItems?.length ? (
        <div className="neu-preview-summary">
          {summaryItems.map((item) => (
            <div key={`${item.label}-${item.value}`} className="neu-preview-summary-item">
              <p className="neu-preview-summary-label">{item.label}</p>
              <p
                className={cn("neu-preview-summary-value", item.mono && "font-mono tabular-nums")}
                data-tone={item.tone ?? "default"}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="neu-preview-copy mt-4 w-full text-[13px] font-medium"
        onClick={onViewCurl}
      >
        <Terminal className="mr-1.5 h-3.5 w-3.5 opacity-70" />
        {viewCurlLabel}
      </Button>
    </div>
  );
}
