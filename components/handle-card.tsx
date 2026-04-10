"use client";

import { HandleConsoleCard } from "@/features/handle-console/components/handle-console-card";
import type { HandleConsoleCardProps } from "@/features/handle-console/types/handle-console.types";

export function HandleCard(props: HandleConsoleCardProps = {}) {
  return <HandleConsoleCard {...props} />;
}
