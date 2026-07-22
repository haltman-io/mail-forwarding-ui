"use client";

import { AdminPageChrome } from "@/features/dashboard/components/admin-page-chrome";
import { ApiTokensContent } from "@/features/dashboard/components/api-tokens-content";

export default function Page() {
  return (
    <AdminPageChrome title="API Tokens">
      <ApiTokensContent />
    </AdminPageChrome>
  );
}
