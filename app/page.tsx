"use client";

import * as React from "react";
import { SiteHeader } from "@/components/site-header";
import { SubscribeCard } from "@/components/subscribe-card";

type ApiStatus = "idle" | "connected" | "error";

export default function Page() {
  const [apiStatus, setApiStatus] = React.useState<ApiStatus>("idle");

  return (
    <>
      <SiteHeader onApiStatusChange={setApiStatus} />

      <main className="relative mx-auto max-w-6xl px-4 pt-8 pb-28 sm:pt-10 sm:pb-32 lg:pt-14">
        <section className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
          <SubscribeCard apiStatus={apiStatus} onApiStatusChange={setApiStatus} />

          <footer className="mt-10 text-center sm:mt-12">
            <p className="m-0 font-sans text-[11px] leading-[1.6] text-[color:var(--text-muted)]">
              POWERED BY{" "}
              <strong className="font-semibold text-[color:var(--text-secondary)]">HALTMAN.IO</strong> &amp;{" "}
              <strong className="font-semibold text-[color:var(--text-secondary)]">THE HACKER&apos;S CHOICE</strong>
            </p>
          </footer>
        </section>
      </main>
    </>
  );
}
