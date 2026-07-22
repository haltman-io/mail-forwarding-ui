"use client";

import { AdminPageChrome } from "@/features/dashboard/components/admin-page-chrome";
import { DnsRequestsContent } from "@/features/dashboard/components/dns-requests-content";

export default function Page() {
  return (
    <AdminPageChrome title="DNS Requests">
      <DnsRequestsContent />
    </AdminPageChrome>
  );
}
