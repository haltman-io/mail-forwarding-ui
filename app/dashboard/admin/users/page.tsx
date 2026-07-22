"use client";

import { AdminPageChrome } from "@/features/dashboard/components/admin-page-chrome";
import { UsersContent } from "@/features/dashboard/components/users-content";

export default function Page() {
  return (
    <AdminPageChrome title="Users">
      <UsersContent />
    </AdminPageChrome>
  );
}
