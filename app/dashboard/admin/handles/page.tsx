"use client";

import { AdminPageChrome } from "@/features/dashboard/components/admin-page-chrome";
import { HandlesContent } from "@/features/dashboard/components/handles-content";

export default function Page() {
  return (
    <AdminPageChrome title="Handles">
      <HandlesContent />
    </AdminPageChrome>
  );
}
