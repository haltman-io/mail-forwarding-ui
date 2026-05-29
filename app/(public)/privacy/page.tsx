import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrivacyPolicyContent } from "@/components/privacy-policy-content";
import { SiteHeader } from "@/components/site-header";
import { privacyPolicyDocument } from "@/lib/privacy-policy";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main className="relative mx-auto max-w-[960px] px-4 pt-24 pb-20 sm:px-6 sm:pt-36 sm:pb-24">
        <article className="mx-auto max-w-[740px]">
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>

          <PrivacyPolicyContent document={privacyPolicyDocument} />
        </article>
      </main>
    </>
  );
}
