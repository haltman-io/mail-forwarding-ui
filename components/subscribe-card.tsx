"use client";

import { AliasConsoleCard } from "@/features/alias-console/components/alias-console-card";
import type { SubscribeCardProps } from "@/features/alias-console/types/alias-console.types";

export function SubscribeCard(props: SubscribeCardProps = {}) {
  return <AliasConsoleCard {...props} />;
}
