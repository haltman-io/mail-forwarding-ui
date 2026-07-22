"use client";

import { AdminPageChrome } from "@/features/dashboard/components/admin-page-chrome";
import { BansContent } from "@/features/dashboard/components/bans-content";

export default function Page() {
  return (
    <AdminPageChrome title="Bans">
      <BansContent />
    </AdminPageChrome>
  );
}
