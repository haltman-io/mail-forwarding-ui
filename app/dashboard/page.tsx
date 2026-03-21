"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardUserMenu } from "@/features/dashboard/components/dashboard-user-menu"

export default function DashboardPage() {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-5">
        <SidebarTrigger className="-ml-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
        <div className="h-4 w-px bg-[rgba(255,255,255,0.08)]" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-mono text-[12px] tracking-[0.06em] text-[var(--text-secondary)]">
                Dashboard
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <DashboardUserMenu />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div
            className="aspect-video rounded-2xl"
            style={{
              background: "var(--neu-surface-lo)",
              border: "1px solid rgba(255, 255, 255, 0.03)",
              boxShadow: "var(--neu-shadow-in)",
            }}
          />
          <div
            className="aspect-video rounded-2xl"
            style={{
              background: "var(--neu-surface-lo)",
              border: "1px solid rgba(255, 255, 255, 0.03)",
              boxShadow: "var(--neu-shadow-in)",
            }}
          />
          <div
            className="aspect-video rounded-2xl"
            style={{
              background: "var(--neu-surface-lo)",
              border: "1px solid rgba(255, 255, 255, 0.03)",
              boxShadow: "var(--neu-shadow-in)",
            }}
          />
        </div>
        <div
          className="min-h-[100vh] flex-1 rounded-2xl md:min-h-min"
          style={{
            background: "var(--neu-surface-lo)",
            border: "1px solid rgba(255, 255, 255, 0.03)",
            boxShadow: "var(--neu-shadow-in)",
          }}
        />
      </div>
    </>
  )
}
