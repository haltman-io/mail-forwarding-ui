"use client";

import { AdminPageChrome } from "@/features/dashboard/components/admin-page-chrome";
import { SmtpCredentialsContent } from "@/features/dashboard/components/smtp-credentials-content";

export default function Page() {
  return (
    <AdminPageChrome title="SMTP Submission">
      <SmtpCredentialsContent />
    </AdminPageChrome>
  );
}
