import type { FormEvent, ReactNode } from "react";
import { Check, ChevronsUpDown, MailX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";

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
  subscribeAliasReady: boolean;
  previewAlias: string;
  subscribeTarget: string;
  curlSubscribe: string;
  codeBlockClass: string;
  clickableIconClass: string;
  onNameChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  onDomainComboboxOpenChange: (open: boolean) => void;
  onToChange: (value: string) => void;
  onIsCustomAddressChange: (value: boolean) => void;
  onCustomAddressChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onGoToDeleteAlias: () => void;
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
  curlSubscribe,
  codeBlockClass,
  clickableIconClass,
  onNameChange,
  onDomainChange,
  onDomainComboboxOpenChange,
  onToChange,
  onIsCustomAddressChange,
  onCustomAddressChange,
  onSubmit,
  onGoToDeleteAlias,
}: SubscribeTabPanelProps) {
  const customAddressToggle = (
    <Label
      htmlFor="custom-address-toggle"
      className="inline-flex h-7 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 text-[11px] text-zinc-300"
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
              <div className="flex-1 space-y-2 ">
                <div className="flex items-center justify-between gap-2 min-h-[28px]">
                  <Label htmlFor="custom-address">Custom address</Label>
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
                  className="bg-black/30"
                />
                <p className="text-xs text-zinc-400">
                  NOTE: The domain <span className="font-mono text-zinc-300">{customAddressDomain || "…"}</span> must
                  have a MX record to <span className="font-mono text-zinc-300">mail.abin.lat</span>, or your emails
                  won&apos;t be forwarded.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2 min-h-[28px]">
                    <Label htmlFor="name">Handle</Label>
                  </div>

                  <Input
                    id="name"
                    placeholder="extencil"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    autoCapitalize="none"
                    spellCheck={false}
                    className="bg-black/30"
                  />
                </div>

                <div className="space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2 min-h-[28px]">
                    <Label>Domain</Label>
                    {customAddressToggle}
                  </div>
                  <Popover open={domainComboboxOpen} onOpenChange={onDomainComboboxOpenChange}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={domainComboboxOpen}
                        className="w-full min-w-0 justify-between border-white/10 bg-black/30 text-zinc-200 hover:bg-white/10"
                      >
                        <span className="truncate">{domain || "Select a domain"}</span>
                        <ChevronsUpDown className={`ml-2 h-4 w-4 shrink-0 opacity-50 ${clickableIconClass}`} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-[var(--radix-popover-trigger-width)] border-white/10 bg-zinc-950/95 p-0 text-zinc-200"
                    >
                      <Command className="bg-transparent">
                        <CommandInput placeholder="Search domain..." />
                        <CommandList>
                          <CommandEmpty>No domains found.</CommandEmpty>
                          <CommandGroup>
                            {domains.length ? (
                              domains.map((domainOption) => (
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
                                  <span className="truncate">{domainOption}</span>
                                </CommandItem>
                              ))
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
            <Label htmlFor="to">Destination email address</Label>
            <Input
              id="to"
              type="email"
              placeholder="extencil@proton.me"
              value={to}
              onChange={(e) => onToChange(e.target.value)}
              autoCapitalize="none"
              spellCheck={false}
              className="bg-black/30"
            />
            <p className="text-xs text-zinc-400">Must be a valid mailbox.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="group w-full sm:w-auto" disabled={requestBusy || (!domains.length && !isCustomAddress)}>
              {subscribeButtonContent}
            </Button>
          </div>
        </form>

        <div className="space-y-3 lg:col-span-2">
          <div className="hidden rounded-xl border border-white/10 bg-black/30 p-4 sm:block">
            <p className="text-sm font-medium text-zinc-200">REQUEST PREVIEW</p>
            <Separator className="my-3 bg-white/10" />
            {showConfirmedPanel ? (
              <div className="space-y-2 text-sm text-zinc-300">
                <p>Confirmed. Alias is active.</p>
                {confirmedMapping?.alias ? (
                  <p className="font-mono text-xs text-zinc-200">
                    {confirmedMapping.alias} <span className="text-zinc-500">→</span> {confirmedMapping.to || "destination"}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400">Confirmation received.</p>
                )}
              </div>
            ) : subscribeAwaiting ? (
              <div className="space-y-1 text-sm text-zinc-300">
                <p>Awaiting confirmation email.</p>
                <p className="text-xs text-zinc-400">Check your inbox to finish creating the alias.</p>
              </div>
            ) : !subscribeHasInput ? (
              <p className="text-sm text-zinc-400">Fill the form to preview your alias.</p>
            ) : (
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  • Alias: <span className="font-mono text-zinc-200">{subscribeAliasReady ? previewAlias : "alias@domain.tld"}</span>
                </li>
                <li>
                  • Destination: <span className="font-mono text-zinc-200">{subscribeTarget || "Fill destination email to preview"}</span>
                </li>
              </ul>
            )}

            <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3">
              <pre className={`mt-1 ${codeBlockClass}`}>{curlSubscribe}</pre>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="group w-full border-white/10 bg-white/5 hover:bg-white/10"
            onClick={onGoToDeleteAlias}
          >
            <MailX className={`mr-2 h-4 w-4 ${clickableIconClass}`} />
            CLICK TO DELETE ALIAS
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}
