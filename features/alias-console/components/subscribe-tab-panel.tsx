import type { FormEvent, ReactNode } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";

import { PINNED_DOMAINS } from "@/features/alias-console/hooks/use-alias-console-controller";
import { RequestPreviewPanel } from "@/features/alias-console/components/request-preview-panel";
import type { MappingSnapshot } from "@/features/alias-console/types/alias-console.types";

type SubscribeTabPanelProps = {
  name: string;
  domain: string;
  domains: string[];
  domainComboboxOpen: boolean;
  to: string;
  isCustomAddress: boolean;
  customAddress: string;
  customAddressDomain: string;
  requestBusy: boolean;
  subscribeButtonContent: ReactNode;
  showConfirmedPanel: boolean;
  confirmedMapping: MappingSnapshot | null;
  subscribeAwaiting: boolean;
  subscribeHasInput: boolean;
  subscribePreviewPulseSource: string;
  subscribeAliasReady: boolean;
  previewAlias: string;
  subscribeTarget: string;
  curlSubscribe: string;
  copiedId: string | null;
  canCopyPreview: boolean;
  codeBlockClass: string;
  clickableIconClass: string;
  onNameChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  onDomainComboboxOpenChange: (open: boolean) => void;
  onToChange: (value: string) => void;
  onIsCustomAddressChange: (value: boolean) => void;
  onCustomAddressChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCopySubscribePreview: () => void;
};

const PINNED_BADGES: Record<string, { text: string; color?: "amber" | "sky" | "orange" | "primary"; className?: string }> = {
  "reads.phrack.org": { text: "📚 PHRACK MAGAZINE", color: "primary", className: "!bg-black !from-black !to-zinc-900 !border-zinc-800 !text-zinc-300" },
  "smokes.thc.org": { text: "👑 SINCE 1995", color: "amber" },
  "free.team-teso.net": { text: "🛜 Blue-Boxed", color: "sky" },
  "segfault.net": { text: "💨 DISPOSABLE", color: "orange" },
  "ghetto.eurocompton.net": { text: "⚔️ Oldest IDS Enemy", color: "amber" },
  "lulz.antisec.net": { text: "💀💀💀💀💀", color: "amber" },
};

export function SubscribeTabPanel({
  name,
  domain,
  domains,
  domainComboboxOpen,
  to,
  isCustomAddress,
  customAddress,
  customAddressDomain,
  requestBusy,
  subscribeButtonContent,
  showConfirmedPanel,
  confirmedMapping,
  subscribeAwaiting,
  subscribeHasInput,
  subscribePreviewPulseSource,
  subscribeAliasReady,
  previewAlias,
  subscribeTarget,
  curlSubscribe,
  copiedId,
  canCopyPreview,
  codeBlockClass,
  clickableIconClass,
  onNameChange,
  onDomainChange,
  onDomainComboboxOpenChange,
  onToChange,
  onIsCustomAddressChange,
  onCustomAddressChange,
  onSubmit,
  onCopySubscribePreview,
}: SubscribeTabPanelProps) {
  const previewMessage = showConfirmedPanel
    ? "Confirmed. Alias is active."
    : subscribeAwaiting
      ? "Awaiting confirmation email."
      : !subscribeHasInput
        ? "Fill the form to preview your alias."
        : "Generated in real time from your current values.";

  const previewDetails =
    showConfirmedPanel && confirmedMapping?.alias ? (
      <p className="font-mono text-xs text-[var(--text-secondary)]">
        {confirmedMapping.alias} <span className="text-[var(--text-muted)]">→</span> {confirmedMapping.to || "destination"}
      </p>
    ) : subscribeAwaiting ? (
      <p className="text-xs text-[var(--text-muted)]">Check your inbox to finish creating the alias.</p>
    ) : subscribeHasInput ? (
      <ul key={subscribePreviewPulseSource} className="space-y-1 text-sm text-[var(--text-muted)]">
        <li>
          Alias:{" "}
          <span className="font-mono text-[var(--text-secondary)]">
            {subscribeAliasReady ? previewAlias : "alias@domain.tld"}
          </span>
        </li>
        <li>
          Destination:{" "}
          <span className="font-mono text-[var(--text-secondary)]">
            {subscribeTarget || "Fill destination email to preview"}
          </span>
        </li>
      </ul>
    ) : null;

  const customAddressToggle = (
    <Label
      htmlFor="custom-address-toggle"
      className="inline-flex h-7 items-center gap-2 rounded-lg px-2 text-[11px] text-[var(--text-muted)] cursor-pointer hover:bg-[var(--hover-state)] transition-colors duration-150"
    >
      <Switch
        id="custom-address-toggle"
        checked={isCustomAddress}
        onCheckedChange={onIsCustomAddressChange}
        aria-label="Toggle custom address"
      />
      <span>Custom Address</span>
    </Label>
  );

  return (
    <TabsContent value="subscribe" className="mt-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={onSubmit} className="space-y-5 lg:col-span-3 min-w-0">
          <div className="grid grid-cols-1 gap-4 items-start min-w-0">
            {isCustomAddress ? (
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2 min-h-[28px]">
                  <Label htmlFor="custom-address" className="text-[13px] font-medium text-[var(--text-secondary)]">
                    Custom address
                  </Label>
                  {customAddressToggle}
                </div>
                <Input
                  id="custom-address"
                  type="email"
                  placeholder="user@example.com"
                  value={customAddress}
                  onChange={(e) => onCustomAddressChange(e.target.value)}
                  autoCapitalize="none"
                  spellCheck={false}                  className="neu-inset"                />
                <p className="text-xs text-[var(--text-muted)]">
                  NOTE: The domain{" "}
                  <span className="font-mono text-[var(--text-secondary)]">{customAddressDomain || "…"}</span> must
                  have a MX record to <span className="font-mono text-[var(--text-secondary)]">mail.abin.lat</span>,
                  or your emails
                  won&apos;t be forwarded.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2 min-h-[28px]">
                    <Label htmlFor="name" className="text-[13px] font-medium text-[var(--text-secondary)]">
                      Handle
                    </Label>
                  </div>

                  <Input
                    id="name"
                    placeholder="extencil"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    autoCapitalize="none"
                    spellCheck={false}
                    className="neu-inset"
                  />
                </div>

                <div className="space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2 min-h-[28px]">
                    <Label className="text-[13px] font-medium text-[var(--text-secondary)]">Domain</Label>
                    {customAddressToggle}
                  </div>
                  <Popover open={domainComboboxOpen} onOpenChange={onDomainComboboxOpenChange}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={domainComboboxOpen}
                        className="neu-inset w-full min-w-0 justify-between font-sans text-sm"
                      >
                        <span className="truncate">{domain || "Select a domain"}</span>
                        <ChevronsUpDown className={`ml-2 h-4 w-4 shrink-0 opacity-50 ${clickableIconClass}`} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command className="bg-transparent">
                        <CommandInput placeholder="Search domain..." />
                        <CommandList>
                          <CommandEmpty>No domains found.</CommandEmpty>
                          <CommandGroup>
                            {domains.length ? (
                              domains.map((domainOption) => {
                                const badgeInfo = PINNED_BADGES[domainOption as keyof typeof PINNED_BADGES];
                                return (
                                  <CommandItem
                                    key={domainOption}
                                    value={domainOption}
                                    onSelect={() => {
                                      onDomainChange(domainOption);
                                      onDomainComboboxOpenChange(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${domain === domainOption ? "text-emerald-300 opacity-100" : "opacity-0"}`}
                                    />
                                    <span className="truncate font-sans text-sm flex-1">{domainOption}</span>
                                    {badgeInfo && (
                                      <Badge variant="fancy" color={badgeInfo.color || "primary"} className={`ml-2 px-1 text-[9px] uppercase tracking-wider ${badgeInfo.className || ""}`}>
                                        {badgeInfo.text}
                                      </Badge>
                                    )}
                                  </CommandItem>
                                );
                              })
                            ) : (
                              <CommandItem value="no-domains" disabled>
                                No domains available (API /domains failed)
                              </CommandItem>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="to" className="text-[13px] font-medium text-[var(--text-secondary)]">
              Destination email address
            </Label>
            <Input
              id="to"
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
              disabled={requestBusy || (!domains.length && !isCustomAddress)}
            >
              {subscribeButtonContent}
            </Button>
          </div>
        </form>

        <div className="hidden space-y-3 lg:col-span-2 lg:block">
          <RequestPreviewPanel
            message={previewMessage}
            details={previewDetails}
            curlCommand={curlSubscribe}
            codeBlockClass={codeBlockClass}
            clickableIconClass={clickableIconClass}
            copied={copiedId === "preview-subscribe-curl"}
            onCopy={onCopySubscribePreview}
            copyDisabled={!canCopyPreview}
            pulseKey={subscribePreviewPulseSource}
            pulseActive={subscribeHasInput}
          />
        </div>
      </div>
    </TabsContent>
  );
}
