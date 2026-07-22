"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { DashboardUserMenu } from "@/features/dashboard/components/dashboard-user-menu";
import { OverviewContent } from "@/features/dashboard/components/overview-content";
import { GetStartedContent } from "@/features/dashboard/components/get-started-content";

export default function DashboardPage() {
  const router = useRouter();
  const { user, status } = useAuth();

  React.useEffect(() => {
    if (status === "authenticated" && user && !user.is_admin) {
      router.replace("/dashboard/get-started");
    }
  }, [status, user, router]);

  if (status === "checking") {
    return null;
  }

  // Non-admins: show get-started while redirect settles
  if (!user?.is_admin) {
    return (
      <>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-5">
          <SidebarTrigger className="-ml-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
          <div className="h-4 w-px bg-[rgba(255,255,255,0.08)]" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-mono text-[12px] tracking-[0.06em] text-[var(--text-secondary)]">
                  Get Started
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <DashboardUserMenu />
          </div>
        </header>
        <div className="flex flex-1 flex-col pt-6">
          <GetStartedContent />
        </div>
      </>
    );
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-5">
        <SidebarTrigger className="-ml-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
        <div className="h-4 w-px bg-[rgba(255,255,255,0.08)]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[12px] tracking-[0.06em] text-[var(--text-secondary)]">
                Overview
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <DashboardUserMenu />
        </div>
      </header>
      <div className="flex flex-1 flex-col pt-6">
        <OverviewContent />
      </div>
    </>
  );
}
