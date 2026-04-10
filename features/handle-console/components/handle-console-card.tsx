"use client";

import { Fingerprint, Globe, Loader2, ShieldAlert, ShieldCheck, Terminal, Trash2, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { badgeClasses } from "@/lib/utils-mail";

import { ConfirmCodeDialog } from "@/features/alias-console/components/confirm-code-dialog";
import { ClaimTabPanel } from "@/features/handle-console/components/claim-tab-panel";
import { RemoveTabPanel } from "@/features/handle-console/components/remove-tab-panel";
import { DomainsTabPanel } from "@/features/handle-console/components/domains-tab-panel";
import { HandleCurlTabPanel } from "@/features/handle-console/components/handle-curl-tab-panel";
import { HandleSuccessDialog } from "@/features/handle-console/components/handle-success-dialog";
import { useHandleConsoleController } from "@/features/handle-console/hooks/use-handle-console-controller";
import type { HandleConsoleCardProps } from "@/features/handle-console/types/handle-console.types";
import {
  clickableIconClass,
  codeBlockClass,
  staticIconClass,
} from "@/features/handle-console/utils/handle-console.utils";

const TAB_INDEX: Record<string, number> = { claim: 0, remove: 1, domains: 2, curl: 3 };

export function HandleConsoleCard(props: HandleConsoleCardProps = {}) {
  const controller = useHandleConsoleController(props);

  const mobileTabIndex = TAB_INDEX[controller.activeTab] ?? 0;
  const desktopTabIndex = TAB_INDEX[controller.activeTab] ?? 0;
  const mobileTabCount = 3;
  const desktopTabCount = 4;

  const claimButtonContent = controller.claimButtonBusy ? (
    <>
      <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
      Claiming...
    </>
  ) : (
    "Claim Handle"
  );

  const removeButtonContent = controller.removeButtonBusy ? (
    <>
      <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
      Removing...
    </>
  ) : (
    "Remove Handle"
  );

  const domainButtonContent = controller.domainButtonBusy ? (
    <>
      <Loader2 className={`mr-2 h-4 w-4 animate-spin ${clickableIconClass}`} />
      {controller.domainAction === "disable" ? "Disabling..." : "Enabling..."}
    </>
  ) : controller.domainAction === "disable" ? (
    "Disable Domain"
  ) : (
    "Enable Domain"
  );

  const goToCurlTab = () => controller.onTabChange("curl");

  return (
    <Card className="alias-console-surface neu-accent-bar relative overflow-hidden -mx-4 rounded-none border-x-0 sm:mx-0 sm:rounded-2xl sm:border-x">
      <HandleSuccessDialog
        open={controller.successDialogOpen}
        onOpenChange={controller.onSuccessDialogOpenChange}
        intent={controller.lastIntent}
        snapshot={controller.confirmedSnapshot}
        copiedId={controller.copiedId}
        onCopyHandle={controller.copySuccessHandle}
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

      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
              <span className="inline-flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-[var(--alias-accent)] opacity-70" />
                Handle Console
              </span>
            </CardTitle>
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
          <TabsList className="neu-tab-track relative grid w-full grid-cols-3 rounded-lg p-0.5 sm:grid-cols-4">
            <span
              className="neu-tab-pill pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc((100%-0.25rem)/3)] rounded-md transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:hidden"
              style={{ transform: `translateX(${Math.min(mobileTabIndex, mobileTabCount - 1) * 100}%)` }}
            />
            <span
              className="neu-tab-pill pointer-events-none absolute inset-y-0.5 left-0.5 hidden w-[calc((100%-0.25rem)/4)] rounded-md transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:block"
              style={{ transform: `translateX(${desktopTabIndex * 100}%)` }}
            />
            <TabsTrigger
              value="claim"
              className="group z-10 gap-1.5 border-transparent bg-transparent text-[var(--text-muted)] text-[13px] font-medium after:hidden data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:border-transparent data-[state=inactive]:hover:text-[var(--text-secondary)]"
            >
              <UserPlus className={`h-3.5 w-3.5 ${clickableIconClass}`} />
              Claim
            </TabsTrigger>
            <TabsTrigger
              value="remove"
              className="group z-10 gap-1.5 border-transparent bg-transparent text-[var(--text-muted)] text-[13px] font-medium after:hidden data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:border-transparent data-[state=inactive]:hover:text-[var(--text-secondary)]"
            >
              <Trash2 className={`h-3.5 w-3.5 ${clickableIconClass}`} />
              Remove
            </TabsTrigger>
            <TabsTrigger
              value="domains"
              className="group z-10 gap-1.5 border-transparent bg-transparent text-[var(--text-muted)] text-[13px] font-medium after:hidden data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:border-transparent data-[state=inactive]:hover:text-[var(--text-secondary)]"
            >
              <Globe className={`h-3.5 w-3.5 ${clickableIconClass}`} />
              Domains
            </TabsTrigger>
            <TabsTrigger
              value="curl"
              className="group z-10 hidden gap-1.5 border-transparent bg-transparent text-[var(--text-muted)] text-[13px] font-medium after:hidden data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none data-[state=inactive]:hover:bg-transparent data-[state=inactive]:hover:border-transparent data-[state=inactive]:hover:text-[var(--text-secondary)] sm:inline-flex"
            >
              <Terminal className={`h-3.5 w-3.5 ${clickableIconClass}`} />
              cURL
            </TabsTrigger>
          </TabsList>

          <ClaimTabPanel
            handle={controller.handle}
            to={controller.to}
            requestBusy={controller.requestBusy}
            claimButtonContent={claimButtonContent}
            showConfirmedPanel={controller.showConfirmedPanel}
            confirmedSnapshot={controller.confirmedSnapshot}
            claimAwaiting={controller.claimAwaiting}
            claimHasInput={controller.claimHasInput}
            claimReady={controller.claimReady}
            onHandleChange={controller.onHandleChange}
            onToChange={controller.onToChange}
            onSubmit={controller.onClaim}
            onViewCurl={goToCurlTab}
          />

          <RemoveTabPanel
            handle={controller.removeHandle}
            requestBusy={controller.requestBusy}
            removeButtonContent={removeButtonContent}
            onHandleChange={controller.onRemoveHandleChange}
            onSubmit={controller.onRemove}
            onViewCurl={goToCurlTab}
          />

          <DomainsTabPanel
            handle={controller.domainHandle}
            domain={controller.domainValue}
            domainAction={controller.domainAction}
            requestBusy={controller.requestBusy}
            domainButtonContent={domainButtonContent}
            onHandleChange={controller.onDomainHandleChange}
            onDomainChange={controller.onDomainValueChange}
            onDomainActionChange={controller.onDomainActionChange}
            onSubmit={controller.onDomainSubmit}
            onViewCurl={goToCurlTab}
          />

          <HandleCurlTabPanel
            copiedId={controller.copiedId}
            curlClaim={controller.curlClaim}
            curlRemove={controller.curlRemove}
            curlDomainDisable={controller.curlDomainDisable}
            curlDomainEnable={controller.curlDomainEnable}
            codeBlockClass={codeBlockClass}
            clickableIconClass={clickableIconClass}
            canCopyClaim={controller.canCopyClaimCurl}
            canCopyRemove={controller.canCopyRemoveCurl}
            canCopyDomain={controller.canCopyDomainCurl}
            onCopyClaim={controller.copyClaimCurl}
            onCopyRemove={controller.copyRemoveCurl}
            onCopyDomainDisable={controller.copyDomainDisableCurl}
            onCopyDomainEnable={controller.copyDomainEnableCurl}
          />
        </Tabs>
      </CardContent>
    </Card>
  );
}
