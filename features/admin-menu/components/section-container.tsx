import * as React from "react";

import { Separator } from "@/components/ui/separator";

type SectionContainerProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function SectionContainer({
  title,
  description,
  children,
}: SectionContainerProps) {
  return (
    <section className="space-y-3 rounded-lg border border-white/10 bg-black/25 p-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        <p className="text-xs text-zinc-400">{description}</p>
      </div>
      <Separator className="bg-white/10" />
      {children}
    </section>
  );
}
