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

  const subscribeButtonContent = controller.subscribeButtonBusy ? (
    <>
      <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
      Saving...
    </>
  ) : (
    "SAVE"
  );

  const unsubscribeButtonContent = controller.unsubscribeButtonBusy ? (
    <>
      <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
      Deleting
    </>
  ) : (
    "DELETE"
  );

  return (
    <Card className="relative overflow-hidden border-white/10 bg-gradient-to-b from-zinc-950 to-zinc-950/60">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
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
            <CardTitle className="tracking-tight">ALIAS CONSOLE</CardTitle>
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
          <TabsList className="grid w-full grid-cols-2 border border-white/10 bg-black/30 sm:grid-cols-3">
            <TabsTrigger
              value="subscribe"
              className="group gap-2 data-[state=active]:bg-white/5 data-[state=active]:text-zinc-100 data-[state=active]:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.25)]"
            >
              <MailPlus className={`h-4 w-4 ${clickableIconClass}`} />
              CREATE
            </TabsTrigger>
            <TabsTrigger
              value="unsubscribe"
              className="group gap-2 data-[state=active]:bg-white/5 data-[state=active]:text-zinc-100 data-[state=active]:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.25)]"
            >
              <MailX className={`h-4 w-4 ${clickableIconClass}`} />
              DELETE
            </TabsTrigger>
            <TabsTrigger
              value="curl"
              className="group hidden gap-2 data-[state=active]:bg-white/5 data-[state=active]:text-zinc-100 data-[state=active]:shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.25)] sm:inline-flex"
            >
              <Terminal className={`h-4 w-4 ${clickableIconClass}`} />
              CURL
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
            subscribeAliasReady={controller.subscribeAliasReady}
            previewAlias={controller.previewAlias}
            subscribeTarget={controller.subscribeTarget}
            curlSubscribe={controller.curlSubscribe}
            codeBlockClass={codeBlockClass}
            clickableIconClass={clickableIconClass}
            onNameChange={controller.onNameChange}
            onDomainChange={controller.onDomainChange}
            onDomainComboboxOpenChange={controller.onDomainComboboxOpenChange}
            onToChange={controller.onToChange}
            onIsCustomAddressChange={controller.onIsCustomAddressChange}
            onCustomAddressChange={controller.onCustomAddressChange}
            onSubmit={controller.onSubscribe}
            onGoToDeleteAlias={controller.goToUnsubscribeTab}
          />

          <UnsubscribeTabPanel
            alias={controller.alias}
            requestBusy={controller.requestBusy}
            unsubscribeButtonContent={unsubscribeButtonContent}
            curlUnsubscribe={controller.curlUnsubscribe}
            codeBlockClass={codeBlockClass}
            clickableIconClass={clickableIconClass}
            onAliasChange={controller.onAliasChange}
            onSubmit={controller.onUnsubscribe}
            onGoToCreateAlias={controller.goToSubscribeTab}
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
