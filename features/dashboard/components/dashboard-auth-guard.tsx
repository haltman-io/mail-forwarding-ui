"use client";

import type { ReactNode } from "react";

export function DashboardAuthGuard({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
