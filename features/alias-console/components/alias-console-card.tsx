"use client";

import { Loader2, MailPlus, MailX, ShieldAlert, ShieldCheck, Terminal } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { badgeClasses } from "@/lib/utils-mail";

import { ConfirmCodeDialog } from "@/features/alias-console/components/confirm-code-dialog";
import { CurlTabPanel } from "@/features/alias-console/components/curl-tab-panel";
import { SubscribeTabPanel } from "@/features/alias-console/components/subscribe-tab-panel";
import { UnsubscribeTabPanel } from "@/features/alias-console/components/unsubscribe-tab-panel";
import { useAliasConsoleController } from "@/features/alias-console/hooks/use-alias-console-controller";
import type { SubscribeCardProps } from "@/features/alias-console/types/alias-console.types";
import {
  clickableIconClass,
  codeBlockClass,
  staticIconClass,
} from "@/features/alias-console/utils/alias-console.utils";

export function AliasConsoleCard(props: SubscribeCardProps = {}) {
  const controller = useAliasConsoleController(props);
  const mobileTabPillIndex = controller.activeTab === "subscribe" ? 0 : 1;
  const desktopTabPillIndex =
    controller.activeTab === "subscribe" ? 0 : controller.activeTab === "unsubscribe" ? 1 : 2;

  const subscribeButtonContent = controller.subscribeButtonBusy ? (
    <>
      <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
      Creating...
    </>
  ) : (
    "Create Alias"
  );

  const unsubscribeButtonContent = controller.unsubscribeButtonBusy ? (
    <>
      <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
      Deleting...
    </>
  ) : (
    "Delete Alias"
  );

  return (
    <Card className="alias-console-surface relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[color:var(--atmospheric-glow)] blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[color:var(--atmospheric-glow)] blur-3xl" />
      </div>

      <ConfirmCodeDialog
        open={controller.confirmDialogOpen}
        closeGuardOpen={controller.confirmCloseOpen}
        confirmCode={controller.confirmCode}
        confirmLoading={controller.confirmLoading}
        confirmErrorText={controller.confirmErrorText}
        clickableIconClass={clickableIconClass}
        onDialogOpenChange={controller.onConfirmDialogOpenChange}
        onCloseGuardOpenChange={controller.onConfirmGuardOpenChange}
        onCloseAnyway={controller.onCloseConfirmDialog}
        onConfirmCodeSubmit={controller.onConfirmCodeSubmit}
        onConfirmCodeChange={controller.onConfirmCodeChange}
      />

      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="tracking-tight text-[var(--text-primary)]">ALIAS CONSOLE</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <div className={`shrink-0 rounded-full border px-3 py-1 text-xs ${badgeClasses(controller.statusKind)}`}>
              <span className="inline-flex items-center gap-2">
                {controller.statusKind === "ok" ? (
                  <ShieldCheck className={`h-3.5 w-3.5 ${staticIconClass}`} />
                ) : controller.statusKind === "bad" ? (
                  <ShieldAlert className={`h-3.5 w-3.5 ${staticIconClass}`} />
                ) : (
                  <Terminal className={`h-3.5 w-3.5 ${staticIconClass}`} />
                )}
                {controller.statusPillText}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        <Tabs value={controller.activeTab} onValueChange={controller.onTabChange}>
          <TabsList className="relative grid w-full grid-cols-2 p-1 sm:grid-cols-3">
            <span
              className="pointer-events-none absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/2)] rounded-lg border-[0.125px] border-[color:color-mix(in_oklch,var(--hairline-border)_44%,white_56%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0.04)_100%)] shadow-[0_14px_30px_-20px_rgba(0,0,0,0.82),inset_0_0.5px_0_rgba(255,255,255,0.12)] transition-transform duration-150 ease-out sm:hidden"
              style={{ transform: `translateX(${mobileTabPillIndex * 100}%)` }}
            />
            <span
              className="pointer-events-none absolute top-1 bottom-1 left-1 hidden w-[calc((100%-0.5rem)/3)] rounded-lg border-[0.125px] border-[color:color-mix(in_oklch,var(--hairline-border)_44%,white_56%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.13)_0%,rgba(255,255,255,0.04)_100%)] shadow-[0_14px_30px_-20px_rgba(0,0,0,0.82),inset_0_0.5px_0_rgba(255,255,255,0.12)] transition-transform duration-150 ease-out sm:block"
              style={{ transform: `translateX(${desktopTabPillIndex * 100}%)` }}
            />
            <TabsTrigger
              value="subscribe"
              className="group z-10 gap-2 border-transparent bg-transparent text-[var(--text-muted)] after:hidden data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:border-transparent data-[state=inactive]:hover:text-[var(--text-secondary)]"
            >
              <MailPlus className={`h-4 w-4 ${clickableIconClass}`} />
              Create
            </TabsTrigger>
            <TabsTrigger
              value="unsubscribe"
              className="group z-10 gap-2 border-transparent bg-transparent text-[var(--text-muted)] after:hidden data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:border-transparent data-[state=inactive]:hover:text-[var(--text-secondary)]"
            >
              <MailX className={`h-4 w-4 ${clickableIconClass}`} />
              Delete
            </TabsTrigger>
            <TabsTrigger
              value="curl"
              className="group z-10 hidden gap-2 border-transparent bg-transparent text-[var(--text-muted)] after:hidden data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:border-transparent data-[state=inactive]:hover:text-[var(--text-secondary)] sm:inline-flex"
            >
              <Terminal className={`h-4 w-4 ${clickableIconClass}`} />
              cURL
            </TabsTrigger>
          </TabsList>

          <SubscribeTabPanel
            name={controller.name}
            domain={controller.domain}
            domains={controller.domains}
            domainComboboxOpen={controller.domainComboboxOpen}
            to={controller.to}
            isCustomAddress={controller.isCustomAddress}
            customAddress={controller.customAddress}
            customAddressDomain={controller.customAddressParts.domain}
            requestBusy={controller.requestBusy}
            subscribeButtonContent={subscribeButtonContent}
            showConfirmedPanel={controller.showConfirmedPanel}
            confirmedMapping={controller.confirmedMapping}
            subscribeAwaiting={controller.subscribeAwaiting}
            subscribeHasInput={controller.subscribeHasInput}
            subscribePreviewPulseSource={controller.subscribePreviewPulseSource}
            subscribeAliasReady={controller.subscribeAliasReady}
            previewAlias={controller.previewAlias}
            subscribeTarget={controller.subscribeTarget}
            curlSubscribe={controller.curlSubscribe}
            copiedId={controller.copiedId}
            codeBlockClass={codeBlockClass}
            clickableIconClass={clickableIconClass}
            onNameChange={controller.onNameChange}
            onDomainChange={controller.onDomainChange}
            onDomainComboboxOpenChange={controller.onDomainComboboxOpenChange}
            onToChange={controller.onToChange}
            onIsCustomAddressChange={controller.onIsCustomAddressChange}
            onCustomAddressChange={controller.onCustomAddressChange}
            onSubmit={controller.onSubscribe}
            onCopySubscribePreview={controller.copySubscribePreviewCurl}
          />

          <UnsubscribeTabPanel
            alias={controller.alias}
            requestBusy={controller.requestBusy}
            unsubscribeButtonContent={unsubscribeButtonContent}
            copiedId={controller.copiedId}
            unsubscribePreviewPulseSource={controller.unsubscribePreviewPulseSource}
            curlUnsubscribe={controller.curlUnsubscribe}
            codeBlockClass={codeBlockClass}
            clickableIconClass={clickableIconClass}
            onAliasChange={controller.onAliasChange}
            onSubmit={controller.onUnsubscribe}
            onCopyUnsubscribePreview={controller.copyUnsubscribePreviewCurl}
          />

          <CurlTabPanel
            copiedId={controller.copiedId}
            curlSubscribe={controller.curlSubscribe}
            curlUnsubscribe={controller.curlUnsubscribe}
            codeBlockClass={codeBlockClass}
            clickableIconClass={clickableIconClass}
            canCopySubscribe={controller.canCopySubscribeCurl}
            canCopyUnsubscribe={controller.canCopyUnsubscribeCurl}
            onCopySubscribe={controller.copySubscribeCurl}
            onCopyUnsubscribe={controller.copyUnsubscribeCurl}
          />
        </Tabs>
      </CardContent>
    </Card>
  );
}
