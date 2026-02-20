"use client";

import * as React from "react";
import { SiteHeader } from "@/components/site-header";
import { SubscribeCard } from "@/components/subscribe-card";
import { DnsSetupMenu } from "@/components/dns-setup-menu";
import { ApiTokenDialog } from "@/components/api-token-dialog";
import { BrowserAddonMenu } from "@/components/browser-addon-menu";

type ApiStatus = "idle" | "connected" | "error";

export default function Page() {
  const [apiStatus, setApiStatus] = React.useState<ApiStatus>("idle");

  return (
    <>
      <SiteHeader />

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:py-14">
        <section className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden w-full sm:block sm:w-auto">
              <BrowserAddonMenu />
            </div>
            <div className="w-auto">
              <ApiTokenDialog onApiStatusChange={setApiStatus} />
            </div>
            <div className="w-auto">
              <DnsSetupMenu />
            </div>
          </div>

          <SubscribeCard apiStatus={apiStatus} onApiStatusChange={setApiStatus} />

          <footer className="mt-10 text-center sm:mt-12">
            <p className="m-0 font-sans text-[11px] leading-[1.6] text-white/40">
              POWERED BY{" "}
              <strong className="font-semibold text-white/80">HALTMAN.IO</strong> &amp;{" "}
              <strong className="font-semibold text-white/80">THE HACKER&apos;S CHOICE</strong>
            </p>
          </footer>
        </section>
      </main>
    </>
  );
}
