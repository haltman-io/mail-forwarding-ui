"use client";

import { Clock } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";
import { EmptyState } from "@/features/dashboard/components/empty-state";

export default function ComingSoonPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Account</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Coming Soon</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col pt-0">
        <AdminPageLayout>
          <div className="space-y-6">
            <AdminPageHeader
              icon={<Clock className="h-4 w-4" />}
              title="Coming Soon"
              description="We are working on new features for your account. Stay tuned!"
            />

            <AdminDataCard>
              <EmptyState
                icon={<Clock className="h-5 w-5" />}
                title="Your personal dashboard is being built"
                description="New tools to manage your mail forwarding, view activity, and configure preferences are on the way."
              />
            </AdminDataCard>
          </div>
        </AdminPageLayout>
      </div>
    </>
  );
}
