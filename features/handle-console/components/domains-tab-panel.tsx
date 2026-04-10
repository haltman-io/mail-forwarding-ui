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

type DomainsTabPanelProps = {
  handle: string;
  domain: string;
  domainAction: "disable" | "enable";
  requestBusy: boolean;
  domainButtonContent: ReactNode;
  onHandleChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  onDomainActionChange: (value: "disable" | "enable") => void;
  onSubmit: (e: FormEvent) => void;
  onViewCurl: () => void;
};

export function DomainsTabPanel({
  handle,
  domain,
  domainAction,
  requestBusy,
  domainButtonContent,
  onHandleChange,
  onDomainChange,
  onDomainActionChange,
  onSubmit,
  onViewCurl,
}: DomainsTabPanelProps) {
  const trimmedHandle = handle.trim();
  const trimmedDomain = domain.trim();
  const hasInput = Boolean(trimmedHandle || trimmedDomain);
  const previewState: RequestPreviewState = hasInput ? "draft" : "empty";

  const isDisable = domainAction === "disable";

  const previewSummaryItems: PreviewSummaryItem[] = [
    {
      label: "Action",
      value: isDisable ? "Disable domain" : "Enable domain",
      tone: isDisable ? "danger" : "accent",
    },
    {
      label: "Handle",
      value: trimmedHandle || "{handle}",
      mono: true,
      tone: trimmedHandle ? "default" : "muted",
    },
    {
      label: "Domain",
      value: trimmedDomain || "{domain}",
      mono: true,
      tone: trimmedDomain
        ? isDisable ? "danger" : "accent"
        : "muted",
    },
  ];

  return (
    <TabsContent value="domains" className="mt-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={onSubmit} className="space-y-5 lg:col-span-3 min-w-0">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="domain-handle" className="text-[13px] font-medium text-[var(--text-secondary)]">
              Handle
            </Label>
            <Input
              id="domain-handle"
              placeholder="extencil"
              value={handle}
              onChange={(e) => onHandleChange(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              className="neu-inset"
            />
          </div>

          <div className="space-y-2 min-w-0">
            <Label htmlFor="domain-value" className="text-[13px] font-medium text-[var(--text-secondary)]">
              Domain
            </Label>
            <Input
              id="domain-value"
              placeholder="spam.example.com"
              value={domain}
              onChange={(e) => onDomainChange(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              className="neu-inset"
            />
            <p className="text-xs text-[var(--text-muted)]">
              {isDisable
                ? "Emails to your handle on this domain will be rejected."
                : "Re-enable a previously blocked domain for your handle."}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onDomainActionChange("disable")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  isDisable
                    ? "border-rose-400/30 bg-rose-400/12 text-rose-200"
                    : "border-[var(--hairline-border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Disable
              </button>
              <button
                type="button"
                onClick={() => onDomainActionChange("enable")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  !isDisable
                    ? "border-emerald-400/30 bg-emerald-400/12 text-emerald-200"
                    : "border-[var(--hairline-border)] bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Enable
              </button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                className={`group w-full sm:w-auto ${isDisable ? "neu-btn-destructive" : "alias-primary neu-btn-green"}`}
                variant={isDisable ? "destructive" : "default"}
                disabled={requestBusy}
              >
                {domainButtonContent}
              </Button>
            </div>
          </div>
        </form>

        <div className="hidden space-y-3 lg:col-span-2 lg:block lg:self-start">
          <HandleRequestPreviewPanel
            intent={isDisable ? "domain_disable" : "domain_enable"}
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
