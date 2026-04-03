import type { FormEvent, ReactNode } from "react";
import { Check, ChevronsUpDown, Dices } from "lucide-react";

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
import type {
  MappingSnapshot,
  PreviewSummaryItem,
  RequestPreviewState,
} from "@/features/alias-console/types/alias-console.types";

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
  subscribeAliasReady: boolean;
  previewAlias: string;
  subscribeTarget: string;
  clickableIconClass: string;
  onNameChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  onDomainComboboxOpenChange: (open: boolean) => void;
  onToChange: (value: string) => void;
  onIsCustomAddressChange: (value: boolean) => void;
  onCustomAddressChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onViewCurl: () => void;
};

const PINNED_BADGES: Record<string, { text: string; color?: "amber" | "sky" | "orange" | "primary"; className?: string }> = {
  "reads.phrack.org": { text: "📚 Raised on Phrack", color: "primary", className: "!bg-black !from-black !to-zinc-900 !border-zinc-800 !text-zinc-300" },
  "smokes.thc.org": { text: "👑 Since '95, Still Breaking ", color: "amber" },
  "free.team-teso.net": { text: "🛜 Blue Box Kings", color: "sky" },
  "segfault.net": { text: "💨 Hackers Live Here", color: "orange" },
  "ghetto.eurocompton.net": { text: "⚔️ Snort IDS hate US ", color: "amber" },
  "lulz.antisec.net": { text: "💀 Antisec Never Died", color: "primary" },
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
  subscribeAliasReady,
  previewAlias,
  subscribeTarget,
  clickableIconClass,
  onNameChange,
  onDomainChange,
  onDomainComboboxOpenChange,
  onToChange,
  onIsCustomAddressChange,
  onCustomAddressChange,
  onSubmit,
  onViewCurl,
}: SubscribeTabPanelProps) {
  const previewState: RequestPreviewState = showConfirmedPanel
    ? "confirmed"
    : subscribeAwaiting
      ? "awaiting_confirmation"
      : subscribeHasInput
        ? "draft"
        : "empty";

  const aliasPlaceholder = isCustomAddress ? "user@example.com" : "alias@domain.tld";
  const destinationPlaceholder = "destination@mailbox.tld";
  const previewSummaryItems: PreviewSummaryItem[] = [
    {
      label: "Action",
      value: isCustomAddress ? "Create custom alias" : "Create alias",
      tone: "accent",
    },
    {
      label: "Alias",
      value:
        showConfirmedPanel && confirmedMapping?.alias
          ? confirmedMapping.alias
          : subscribeAliasReady
            ? previewAlias
            : aliasPlaceholder,
      mono: true,
      tone:
        showConfirmedPanel && confirmedMapping?.alias
          ? "accent"
          : subscribeAliasReady
            ? "accent"
            : "muted",
    },
    {
      label: "Destination",
      value:
        showConfirmedPanel && confirmedMapping?.to
          ? confirmedMapping.to
          : subscribeTarget || destinationPlaceholder,
      mono: true,
      tone:
        showConfirmedPanel && confirmedMapping?.to
          ? "default"
          : subscribeTarget
            ? "default"
            : "muted",
    },
  ];

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
                  spellCheck={false}
                  className="neu-inset"
                />
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
                <div className="space-y-2 min-w-0" data-tour-step-id="handle-input">
                  <div className="flex items-center justify-between gap-2 min-h-[28px]">
                    <Label htmlFor="name" className="text-[13px] font-medium text-[var(--text-secondary)]">
                      Handle
                    </Label>
                  </div>

                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="extencil"
                      value={name}
                      onChange={(e) => onNameChange(e.target.value)}
                      autoCapitalize="none"
                      spellCheck={false}
                      className="neu-inset pr-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      onClick={() => {
                        const adj = ["cool","fast","dark","red","wild","neo","hex","old","raw","mad","dry","sly","dim","hot","icy","odd","shy","wry","apt","big"];
                        const noun = ["fox","owl","cat","elk","ant","ray","ram","jay","bat","yak","eel","gnu","koi","emu","pug","cod","asp","orb","bit","ion"];
                        const a = adj[Math.floor(Math.random() * adj.length)];
                        const n = noun[Math.floor(Math.random() * noun.length)];
                        const d = Math.floor(Math.random() * 900 + 100);
                        onNameChange(`${a}${n}${d}`);
                      }}
                      aria-label="Generate random handle"
                      title="Generate random handle"
                    >
                      <Dices className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 min-w-0" data-tour-step-id="domain-input">
                  <div className="flex items-center justify-between gap-2 min-h-[28px]">
                    <Label className="text-[13px] font-medium text-[var(--text-secondary)]">Domain</Label>
                    {customAddressToggle}
                  </div>
                  <div className="relative">
                  <Popover open={domainComboboxOpen} onOpenChange={onDomainComboboxOpenChange}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={domainComboboxOpen}
                        className="neu-inset w-full min-w-0 justify-between pr-16 font-sans text-sm"
                      >
                        <span className="truncate">{domain ? `@${domain}` : "Select a domain"}</span>
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
                  <button
                    type="button"
                    className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors duration-150 disabled:opacity-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (domains.length) {
                        const random = domains[Math.floor(Math.random() * domains.length)];
                        onDomainChange(random);
                      }
                    }}
                    disabled={!domains.length}
                    aria-label="Pick random domain"
                    title="Pick random domain"
                  >
                    <Dices className="h-3.5 w-3.5" />
                  </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2" data-tour-step-id="destination-input">
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

          <div className="flex flex-col gap-2 sm:flex-row" data-tour-step-id="submit-button">
            <Button
              type="submit"
              className="alias-primary neu-btn-green group w-full sm:w-auto"
              disabled={requestBusy || (!domains.length && !isCustomAddress)}
            >
              {subscribeButtonContent}
            </Button>
          </div>
        </form>

        <div className="hidden space-y-3 lg:col-span-2 lg:block lg:self-start">
          <RequestPreviewPanel
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
