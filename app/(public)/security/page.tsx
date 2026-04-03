"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Separator } from "@/components/ui/separator";

export default function SecurityPage() {
  return (
    <>
      <SiteHeader />

      <main className="relative mx-auto max-w-[960px] px-4 pt-24 pb-28 sm:px-6 sm:pt-36 sm:pb-32">
        <article className="mx-auto max-w-[740px]">
          {/* Back link */}
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </Link>

          {/* Page header */}
          <header className="space-y-4">
            <h1 className="font-mono text-lg font-semibold uppercase tracking-[0.06em] text-[var(--text-primary)] sm:text-xl">
              Security Policy
            </h1>
            <p className="font-mono text-sm uppercase tracking-[0.04em] text-[var(--neu-green)]">
              Hack us if you can.
            </p>
          </header>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Mission */}
          <section className="space-y-4">
            <div className="space-y-3 font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              <p>This is a free, open-source software built for the community.</p>
              <p>We believe we have built strong security controls, but let&apos;s be real: <strong className="text-[var(--text-primary)]">everything is considered secure until someone hacks it for the first time.</strong></p>
              <p>We actively encourage security research and testing on this tool. Besides thanking you immensely for your efforts, you are completely free to evaluate the security through your own tests and exploits.</p>
            </div>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Infrastructure */}
          <section className="space-y-5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Open-Source Infrastructure
            </h2>
            <div className="space-y-4 font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              <p>To make your life easier, our entire architecture is open-source and can be inspected at the <a href="https://github.com/haltman-io" target="_blank" rel="noreferrer" className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)] transition-colors">Haltman.IO GitHub</a>. Here is the breakdown of our core components:</p>
              
              <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
                <ul className="space-y-6">
                  <li>
                    <a href="https://github.com/haltman-io/mail-forwarding-ui" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold text-[var(--text-primary)] transition-colors hover:text-[var(--neu-green)]">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--neu-green)]" />
                      Front-end
                    </a>
                    <p className="mt-1.5 pl-3.5 text-xs text-[var(--text-muted)]">The UI you are currently reading.</p>
                    <a href="https://github.com/haltman-io/mail-forwarding-ui" target="_blank" rel="noreferrer" className="mt-1 ml-3.5 block font-mono text-[10px] text-[var(--neu-green)] opacity-70 transition-opacity hover:opacity-100 hover:underline break-all">
                      https://github.com/haltman-io/mail-forwarding-ui
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/haltman-io/mail-forwarding-api" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold text-[var(--text-primary)] transition-colors hover:text-[var(--neu-green)]">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--neu-green)]" />
                      Back-end API
                    </a>
                    <p className="mt-1.5 pl-3.5 text-xs text-[var(--text-muted)]">The API consumed by this UI.</p>
                    <a href="https://github.com/haltman-io/mail-forwarding-api" target="_blank" rel="noreferrer" className="mt-1 ml-3.5 block font-mono text-[10px] text-[var(--neu-green)] opacity-70 transition-opacity hover:opacity-100 hover:underline break-all">
                      https://github.com/haltman-io/mail-forwarding-api
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/haltman-io/mail-forwarding-core" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold text-[var(--text-primary)] transition-colors hover:text-[var(--neu-green)]">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--neu-green)]" />
                      Back-end Core
                    </a>
                    <p className="mt-1.5 pl-3.5 text-xs text-[var(--text-muted)]">The core email routing engine.</p>
                    <a href="https://github.com/haltman-io/mail-forwarding-core" target="_blank" rel="noreferrer" className="mt-1 ml-3.5 block font-mono text-[10px] text-[var(--neu-green)] opacity-70 transition-opacity hover:opacity-100 hover:underline break-all">
                      https://github.com/haltman-io/mail-forwarding-core
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/haltman-io/mail-forwarding-dns-checker" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold text-[var(--text-primary)] transition-colors hover:text-[var(--neu-green)]">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--neu-green)]" />
                      Back-end DNS Checker
                    </a>
                    <p className="mt-1.5 pl-3.5 text-xs text-[var(--text-muted)]">Allows users to add domains to the mail forwarder interactively.</p>
                    <a href="https://github.com/haltman-io/mail-forwarding-dns-checker" target="_blank" rel="noreferrer" className="mt-1 ml-3.5 block font-mono text-[10px] text-[var(--neu-green)] opacity-70 transition-opacity hover:opacity-100 hover:underline break-all">
                      https://github.com/haltman-io/mail-forwarding-dns-checker
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/haltman-io/mail-forwarding-dkim-sync" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold text-[var(--text-primary)] transition-colors hover:text-[var(--neu-green)]">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--neu-green)]" />
                      Back-end DKIM Sync
                    </a>
                    <p className="mt-1.5 pl-3.5 text-xs text-[var(--text-muted)]">Identifies new domains in the database and adds them to the opendkim table for signing.</p>
                    <a href="https://github.com/haltman-io/mail-forwarding-dkim-sync" target="_blank" rel="noreferrer" className="mt-1 ml-3.5 block font-mono text-[10px] text-[var(--neu-green)] opacity-70 transition-opacity hover:opacity-100 hover:underline break-all">
                      https://github.com/haltman-io/mail-forwarding-dkim-sync
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/haltman-io/mail-forwarding-ui-saas" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold text-[var(--text-primary)] transition-colors hover:text-[var(--neu-green)]">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--neu-green)]" />
                      Back-end UI SaaS
                    </a>
                    <p className="mt-1.5 pl-3.5 text-xs leading-relaxed text-[var(--text-muted)]">
                      Caddy configuration with on-demand TLS and a custom NodeJS + ExpressJS API for the ASK endpoint. Enables users to replicate the Front-end UI by pointing a CNAME to <code className="rounded bg-[var(--active-state)] px-1 py-0.5 text-[var(--neu-green)]">forward.haltman.io</code> (endpoint returns HTTP 200 OK after DNS validation, triggering Caddy to emit an on-demand TLS certificate).
                    </p>
                    <a href="https://github.com/haltman-io/mail-forwarding-ui-saas" target="_blank" rel="noreferrer" className="mt-1 ml-3.5 block font-mono text-[10px] text-[var(--neu-green)] opacity-70 transition-opacity hover:opacity-100 hover:underline break-all">
                      https://github.com/haltman-io/mail-forwarding-ui-saas
                    </a>
                  </li>
                  <li>
                    <a href="https://addons.mozilla.org/pt-BR/firefox/addon/email-alias-manager/" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold text-[var(--text-primary)] transition-colors hover:text-[var(--neu-green)]">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--neu-green)]" />
                      Browser Extension (Mozilla Firefox)
                    </a>
                    <p className="mt-1.5 pl-3.5 text-xs text-[var(--text-muted)]">Mozilla Firefox add-on.</p>
                    <a href="https://addons.mozilla.org/pt-BR/firefox/addon/email-alias-manager/" target="_blank" rel="noreferrer" className="mt-1 ml-3.5 block font-mono text-[10px] text-[var(--text-secondary)] opacity-70 transition-opacity hover:opacity-100 hover:underline break-all">
                      https://addons.mozilla.org/pt-BR/firefox/addon/email-alias-manager/
                    </a>
                    <a href="https://github.com/haltman-io/mail-forwarding-addon-mozilla-firefox" target="_blank" rel="noreferrer" className="mt-0.5 ml-3.5 block font-mono text-[10px] text-[var(--neu-green)] opacity-70 transition-opacity hover:opacity-100 hover:underline break-all">
                      [Source]: https://github.com/haltman-io/mail-forwarding-addon-mozilla-firefox
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Reporting */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Bug Bounty & Reporting
            </h2>
            <div className="space-y-4 font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              <p>Vulnerabilities must be reported via email. Please send your report to both <a href="mailto:security@haltman.io" className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)] transition-colors">security@haltman.io</a> and <a href="mailto:members@proton.thc.org" className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)] transition-colors">members@proton.thc.org</a>. Sending to either one is fine (we sync up internally), but copying both ensures the fastest response time.</p>
              
              <p>We appreciate clarity. Please provide a detailed step-by-step reproduction path and attach actionable evidence (PoC). You can use the following template to speed up the triage process:</p>

              <div className="relative mt-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--neu-green)] rounded-r opacity-50" />
                <pre className="overflow-x-auto whitespace-pre rounded-lg border border-[var(--glass-border)] bg-[rgba(0,0,0,0.3)] p-4 pl-6 font-mono text-[11px] leading-[1.7] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
{`[TITLE] Type of vulnerability (e.g. RCE, xss, sqli) in [Component Name]

--- VULNERABILITY DETAILS ---
Type: (E.g. Stored XSS, Authentication Bypass, etc)
Impact: (What does an attacker gain access to?)
Component/URL: (E.g. /api/v1/auth or mail-forwarding-api)

--- STEPS TO REPRODUCE ---
1. Execute the following cURL request...
2. Observe the payload being triggered at...
3. ...

--- EVIDENCE / POC ---
(Attach logs, screenshots, terminal outputs, or a script)

--- RESEARCHER ALIAS ---
(How you want to be listed in our Hall of Fame)
`}
                </pre>
              </div>

              <p className="mt-4">Confirmed vulnerabilities will be generously rewarded, and your alias will be immortalized in our Hall of Fame! We strongly value hackers who communicate responsibly.</p>
            </div>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Contact */}
          <section className="space-y-5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Contact & Support
            </h2>
            <div className="space-y-3 font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              <p>If you have questions, feel free to ask via email. However, we hang out and reply much faster on Telegram:</p>
              <ul className="mt-3 space-y-2 pl-2">
                <li><a href="https://t.me/thcorg" target="_blank" rel="noreferrer" className="text-[var(--text-primary)] underline underline-offset-4 hover:text-[var(--neu-green)] transition-colors">t.me/thcorg</a></li>
                <li><a href="https://t.me/haltman_group" target="_blank" rel="noreferrer" className="text-[var(--text-primary)] underline underline-offset-4 hover:text-[var(--neu-green)] transition-colors">t.me/haltman_group</a></li>
              </ul>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 flex justify-center pb-8 sm:mt-16 sm:pb-12">
            <a
              href="https://haltman.io"
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex items-center gap-3 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_16px_-4px_rgba(0,0,0,0.30)] backdrop-blur-[24px] backdrop-saturate-[1.3] transition-all duration-300 ease-[var(--motion-ease-standard)] hover:scale-[1.02] hover:bg-[var(--hover-state)]"
            >
              <div className="absolute inset-0 pointer-events-none rounded-full" />
              <div className="relative flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--neu-green)] opacity-30"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--neu-green)] opacity-70 shadow-[0_0_6px_rgba(var(--neu-green-rgb)/0.5)]"></span>
                </span>
                <p className="m-0 font-sans text-[11px] font-medium tracking-wider text-[var(--text-secondary)] uppercase">
                  Powered by{" "}
                  <strong className="font-bold text-[color:var(--text-primary)] transition-colors group-hover:text-[var(--neu-green)]">Haltman.io</strong>
                  <span className="mx-1.5 text-[color:var(--text-muted)]">&amp;</span>
                  <strong className="font-bold text-[color:var(--text-primary)] transition-colors group-hover:text-[var(--neu-green)]">The Hacker&apos;s Choice</strong>
                </p>
              </div>
            </a>
          </footer>
        </article>
      </main>
    </>
  );
}
