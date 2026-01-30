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
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="w-full sm:w-auto">
              <BrowserAddonMenu />
            </div>
            <div className="w-full sm:w-auto">
              <ApiTokenDialog onApiStatusChange={setApiStatus} />
            </div>
            <div className="w-full sm:w-auto">
              <DnsSetupMenu />
            </div>
          </div>

          <SubscribeCard apiStatus={apiStatus} onApiStatusChange={setApiStatus} />

          <footer className="mt-10 text-center text-xs text-zinc-500 sm:mt-12">
            Made in Brazil 🇧🇷
          </footer>
        </section>
      </main>
    </>
  );
}
