"use client";

import { AdminPageChrome } from "@/features/dashboard/components/admin-page-chrome";
import { DomainsContent } from "@/features/dashboard/components/domains-content";

export default function Page() {
  return (
    <AdminPageChrome title="Domains">
      <DomainsContent />
    </AdminPageChrome>
  );
}
