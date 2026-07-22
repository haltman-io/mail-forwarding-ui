"use client";

import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardUserMenu } from "@/features/dashboard/components/dashboard-user-menu";

interface AdminPageChromeProps {
  title: string;
  sectionHref?: string;
  sectionLabel?: string;
  children: React.ReactNode;
}

export function AdminPageChrome({
  title,
  sectionHref = "/dashboard",
  sectionLabel = "Dashboard",
  children,
}: AdminPageChromeProps) {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-5">
        <SidebarTrigger className="-ml-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
        <div className="h-4 w-px bg-[rgba(255,255,255,0.08)]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink
                href={sectionHref}
                className="font-mono text-[12px] tracking-[0.06em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
              >
                {sectionLabel}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden text-[var(--text-muted)] md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[12px] tracking-[0.06em] text-[var(--text-secondary)]">
                {title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <DashboardUserMenu />
        </div>
      </header>
      <div className="flex flex-1 flex-col pt-6">
        <React.Suspense
          fallback={
            <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          }
        >
          {children}
        </React.Suspense>
      </div>
    </>
  );
}
