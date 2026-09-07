"use client";

import { AdminPageChrome } from "@/features/dashboard/components/admin-page-chrome";
import { RateLimitsContent } from "@/features/dashboard/components/rate-limits-content";

export default function Page() {
  return (
    <AdminPageChrome title="Rate Limits">
      <RateLimitsContent />
    </AdminPageChrome>
  );
}
