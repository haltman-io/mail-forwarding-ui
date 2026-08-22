"use client";
"use client";

import * as React from "react";
import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { useStats } from "@/hooks/use-stats";

export default function Page() {
  const stats = useStats();

  return (
    <div className="relative flex min-h-[100dvh] flex-col justify-center">
      <SiteHeader />

      <main className="relative mx-auto flex w-full max-w-[960px] flex-1 flex-col justify-center px-4 pt-20 pb-12 sm:px-6 sm:pt-24 sm:pb-16">
        <section className="mx-auto w-full max-w-[840px]">
          <HeroSection stats={stats} />
        </section>
      </main>
    </div>
  );
}
