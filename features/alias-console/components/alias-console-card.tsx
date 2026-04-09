"use client";

import { Loader2, MailPlus, MailX, ShieldAlert, ShieldCheck, Terminal } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { badgeClasses } from "@/lib/utils-mail";

import { ConfirmCodeDialog } from "@/features/alias-console/components/confirm-code-dialog";
import { CurlTabPanel } from "@/features/alias-console/components/curl-tab-panel";
import { SuccessDialog } from "@/features/alias-console/components/success-dialog";
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

  const goToCurlTab = () => controller.onTabChange("curl");

  return (
    <Card className="alias-console-surface neu-accent-bar relative overflow-hidden -mx-4 rounded-none border-x-0 sm:mx-0 sm:rounded-2xl sm:border-x">
      <SuccessDialog
        open={controller.successDialogOpen}
        onOpenChange={controller.onSuccessDialogOpenChange}
        intent={controller.lastIntent}
        mapping={controller.confirmedMapping}
        copiedId={controller.copiedId}
        onCopyAlias={controller.copySuccessAlias}
      />

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

      <CardHeader className="relative" data-tour-step-id="console-welcome">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Forward Console</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <div className={`neu-status-badge shrink-0 rounded-full border px-3 py-1 text-xs ${badgeClasses(controller.statusKind)}`}>
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
          <TabsList className="neu-tab-track relative grid w-full grid-cols-2 rounded-lg p-0.5 sm:grid-cols-3">
            <span
              className="neu-tab-pill pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc((100%-0.25rem)/2)] rounded-md transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:hidden"
              style={{ transform: `translateX(${mobileTabPillIndex * 100}%)` }}
            />
            <span
              className="neu-tab-pill pointer-events-none absolute inset-y-0.5 left-0.5 hidden w-[calc((100%-0.25rem)/3)] rounded-md transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:block"
              style={{ transform: `translateX(${desktopTabPillIndex * 100}%)` }}
            />
            <TabsTrigger
              value="subscribe"
              className="group z-10 gap-1.5 border-transparent bg-transparent text-[var(--text-muted)] text-[13px] font-medium after:hidden data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:border-transparent data-[state=inactive]:hover:text-[var(--text-secondary)]"
            >
              <MailPlus className={`h-3.5 w-3.5 ${clickableIconClass}`} />
              Create
            </TabsTrigger>
            <TabsTrigger
              value="unsubscribe"
              data-tour-step-id="delete-tab"
              className="group z-10 gap-1.5 border-transparent bg-transparent text-[var(--text-muted)] text-[13px] font-medium after:hidden data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:border-transparent data-[state=inactive]:hover:text-[var(--text-secondary)]"
            >
              <MailX className={`h-3.5 w-3.5 ${clickableIconClass}`} />
              Delete
            </TabsTrigger>
            <TabsTrigger
              value="curl"
              className="group z-10 hidden gap-1.5 border-transparent bg-transparent text-[var(--text-muted)] text-[13px] font-medium after:hidden data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:border-transparent data-[state=inactive]:hover:text-[var(--text-secondary)] sm:inline-flex"
            >
              <Terminal className={`h-3.5 w-3.5 ${clickableIconClass}`} />
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
            subscribeAliasReady={controller.subscribeAliasReady}
            previewAlias={controller.previewAlias}
            subscribeTarget={controller.subscribeTarget}
            clickableIconClass={clickableIconClass}
            onNameChange={controller.onNameChange}
            onDomainChange={controller.onDomainChange}
            onDomainComboboxOpenChange={controller.onDomainComboboxOpenChange}
            onToChange={controller.onToChange}
            onIsCustomAddressChange={controller.onIsCustomAddressChange}
            onCustomAddressChange={controller.onCustomAddressChange}
            onSubmit={controller.onSubscribe}
            onViewCurl={goToCurlTab}
          />

          <UnsubscribeTabPanel
            alias={controller.alias}
            requestBusy={controller.requestBusy}
            unsubscribeButtonContent={unsubscribeButtonContent}
            onAliasChange={controller.onAliasChange}
            onSubmit={controller.onUnsubscribe}
            onViewCurl={goToCurlTab}
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
