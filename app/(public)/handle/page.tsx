"use client";

import * as React from "react";
import { SiteHeader } from "@/components/site-header";
import { HandleCard } from "@/components/handle-card";
import { DonateCallout } from "@/components/donate-callout";

type ApiStatus = "idle" | "connected" | "error";

export default function HandlePage() {
  const [apiStatus, setApiStatus] = React.useState<ApiStatus>("idle");

  return (
    <>
      <SiteHeader onApiStatusChange={setApiStatus} />

      <main className="relative mx-auto max-w-[960px] px-4 pt-24 pb-20 sm:px-6 sm:pt-36 sm:pb-24">
        <section className="mx-auto max-w-[840px] space-y-6 sm:space-y-8">
          <HandleCard apiStatus={apiStatus} onApiStatusChange={setApiStatus} />
          <DonateCallout variant="compact" />
        </section>
      </main>
    </>
  );
}
