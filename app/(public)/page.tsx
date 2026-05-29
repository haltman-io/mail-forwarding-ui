"use client";

import * as React from "react";
import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { useStats } from "@/hooks/use-stats";

export default function Page() {
  const stats = useStats();

  return (
    <>
      <SiteHeader />

      <main className="relative mx-auto max-w-[960px] px-4 pt-24 pb-20 sm:px-6 sm:pt-36 sm:pb-24">
        <section className="mx-auto max-w-[840px] space-y-6 sm:space-y-8">
          <HeroSection stats={stats} />
        </section>
      </main>
    </>
  );
}
