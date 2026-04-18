import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrivacyPolicyContent } from "@/components/privacy-policy-content";
import { SiteHeader } from "@/components/site-header";
import { privacyPolicyDocument } from "@/lib/privacy-policy";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main className="relative mx-auto max-w-[960px] px-4 pt-24 pb-28 sm:px-6 sm:pt-36 sm:pb-32">
        <article className="mx-auto max-w-[740px]">
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>

          <PrivacyPolicyContent document={privacyPolicyDocument} />

          <footer className="mt-12 flex justify-center pb-8 sm:mt-16 sm:pb-12">
            <a
              href="https://haltman.io"
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex items-center gap-3 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_16px_-4px_rgba(0,0,0,0.30)] backdrop-blur-[24px] backdrop-saturate-[1.3] transition-all duration-300 ease-[var(--motion-ease-standard)] hover:scale-[1.02] hover:bg-[var(--hover-state)]"
            >
              <div className="pointer-events-none absolute inset-0 rounded-full" />
              <div className="relative flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neu-green)] opacity-30"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--neu-green)] opacity-70 shadow-[0_0_6px_rgba(var(--neu-green-rgb)/0.5)]"></span>
                </span>
                <p className="m-0 font-sans text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Powered by{" "}
                  <strong className="font-bold text-[color:var(--text-primary)] transition-colors group-hover:text-[var(--neu-green)]">
                    Haltman.io
                  </strong>
                  <span className="mx-1.5 text-[color:var(--text-muted)]">&amp;</span>
                  <strong className="font-bold text-[color:var(--text-primary)] transition-colors group-hover:text-[var(--neu-green)]">
                    The Hacker&apos;s Choice
                  </strong>
                </p>
              </div>
            </a>
          </footer>
        </article>
      </main>
    </>
  );
}
