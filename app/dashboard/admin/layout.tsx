"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, status } = useAuth();

  React.useEffect(() => {
    if (status === "authenticated" && !user?.is_admin) {
      router.replace("/dashboard/get-started");
    }
  }, [status, user, router]);

  if (status === "checking") {
    return null;
  }

  if (!user?.is_admin) {
    return null;
  }

  return <>{children}</>;
}
