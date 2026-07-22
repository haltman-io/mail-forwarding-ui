"use client";

import { AdminPageChrome } from "@/features/dashboard/components/admin-page-chrome";
import { AliasesContent } from "@/features/dashboard/components/aliases-content";

export default function Page() {
  return (
    <AdminPageChrome title="Aliases">
      <AliasesContent />
    </AdminPageChrome>
  );
}
