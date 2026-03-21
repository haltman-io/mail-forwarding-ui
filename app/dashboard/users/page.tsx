"use client";

import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardUserMenu } from "@/features/dashboard/components/dashboard-user-menu";
import { UsersContent } from "@/features/dashboard/components/users-content";
import { useAdminAuth } from "@/features/dashboard/hooks/use-admin-auth";

export default function UsersPage() {
  const { token } = useAdminAuth();

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-5">
        <SidebarTrigger className="-ml-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
        <div className="h-4 w-px bg-[rgba(255,255,255,0.08)]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard" className="font-mono text-[12px] tracking-[0.06em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]">
                Administration
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden text-[var(--text-muted)] md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[12px] tracking-[0.06em] text-[var(--text-secondary)]">
                Admin Users
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <DashboardUserMenu />
        </div>
      </header>
      <div className="flex flex-1 flex-col pt-6">
        <UsersContent token={token} />
      </div>
    </>
  );
}
