"use client";

import { AdminPageChrome } from "@/features/dashboard/components/admin-page-chrome";
import { PasswordContent } from "@/features/dashboard/components/password-content";

export default function Page() {
  return (
    <AdminPageChrome title="My Password">
      <PasswordContent />
    </AdminPageChrome>
  );
}
