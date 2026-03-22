"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/use-auth";

export function DashboardAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status } = useAuth();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "checking") {
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center gap-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--neu-green)]" />
        </div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)] uppercase">
          Verifying session...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
