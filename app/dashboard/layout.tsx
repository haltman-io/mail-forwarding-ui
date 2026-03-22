"use client";

import { AuthProvider } from "@/features/auth/hooks/use-auth"
import { DashboardAuthGuard } from "@/features/dashboard/components/dashboard-auth-guard"
import { AppSidebar } from "@/features/dashboard/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <DashboardAuthGuard>
        <SidebarProvider className="bg-[rgba(255,255,255,0.03)]">
          <AppSidebar />
          <SidebarInset>
            {children}
          </SidebarInset>
        </SidebarProvider>
      </DashboardAuthGuard>
    </AuthProvider>
  )
}
