"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="font-mono text-sm uppercase tracking-[0.04em] text-[var(--neu-green)]">
              Web Browser Add-On
            </p>
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Mail Alias Manager (Free) — Last Updated: February 20, 2026
            </p>
          </header>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Disclaimer */}
          <div className="space-y-4 font-mono text-sm leading-[1.6] text-[var(--text-muted)]">
            <p>
              This policy refers to official browser add-ons (Main Menu →
              Extensions). Unofficial integrations must write and adapt their own
              policies. Copying this policy is permitted, but we take no action
              for or against it to guarantee: our intellectual freedom, our
              independence, our impartiality, our judgment, and our reputation.
            </p>
            <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Note</p>
              <p className="text-sm leading-[1.6] text-[var(--text-muted)]">
                What is official from Haltman/THC and how to identify it? Through
                GitHub (
                <a
                  href="https://github.com/haltman-io"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  @haltman-io
                </a>
                ) and distributors in add-on stores. For questions, contact us at:{" "}
                <a
                  href="https://www.thc.org/#contact"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  thc.org
                </a>
                {" · "}
                <a
                  href="mailto:members@proton.thc.org"
                  className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  members@proton.thc.org
                </a>
                {" · "}
                <a
                  href="mailto:root@haltman.io"
                  className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  root@haltman.io
                </a>
              </p>
            </div>
          </div>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Introduction */}
          <section className="space-y-4">
            <p className="font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              This Firefox add-on is designed with a privacy-first approach. It
              processes only the data required to create and manage email aliases
              and does not include analytics, telemetry, or behavioral profiling.
            </p>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Data Stored Locally */}
          <section className="space-y-5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Data Stored Locally
            </h2>
            <p className="font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              The add-on stores data in{" "}
              <code className="rounded bg-[var(--hover-state)] px-1.5 py-0.5 text-xs text-[var(--neu-green)]">
                browser.storage.local
              </code>{" "}
              on your device.
            </p>
            <ul className="space-y-4 font-mono text-sm leading-[1.6]">
              <li className="space-y-2">
                <p className="font-semibold text-[var(--text-primary)]">API Credentials</p>
                <ul className="space-y-1 pl-5 text-[var(--text-secondary)]">
                  <li className="list-disc">apiKey (plaintext only when lock is disabled)</li>
                  <li className="list-disc">apiKeyEncPayload and locked when password lock is enabled</li>
                  <li className="list-disc">Encryption uses PBKDF2 for key derivation and AES-GCM for encryption</li>
                  <li className="list-disc">The lock password is never stored, transmitted, or logged</li>
                </ul>
              </li>
              <li className="space-y-2">
                <p className="font-semibold text-[var(--text-primary)]">Alias / Domain Preferences</p>
                <ul className="space-y-1 pl-5 text-[var(--text-secondary)]">
                  <li className="list-disc">domainsCache, defaultDomain, lastDomain, hasSelectedDomain, favoriteDomains</li>
                </ul>
              </li>
              <li className="space-y-2">
                <p className="font-semibold text-[var(--text-primary)]">UI Preferences</p>
                <ul className="space-y-1 pl-5 text-[var(--text-secondary)]">
                  <li className="list-disc">uiMode, handleStyle, skipDeleteConfirm</li>
                </ul>
              </li>
              <li className="space-y-2">
                <p className="font-semibold text-[var(--text-primary)]">Overlay Controls</p>
                <ul className="space-y-1 pl-5 text-[var(--text-secondary)]">
                  <li className="list-disc">overlayEnabled, overlayMode, overlaySites</li>
                  <li className="list-disc">overlaySites contains user-defined site rules</li>
                </ul>
              </li>
            </ul>
            <p className="font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              No locally stored data is sold or shared with third parties by the extension.
            </p>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Local Page Processing */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Local Page Processing
            </h2>
            <p className="font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              To show or hide the helper UI on a page, the add-on may read the
              current page URL/host locally in the browser (for overlay
              allowlist/denylist checks). This check stays local and is not
              transmitted to remote servers.
            </p>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Network Requests */}
          <section className="space-y-5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Network Requests
            </h2>
            <p className="font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              The add-on communicates only with:
            </p>
            <p className="inline-block rounded bg-[var(--hover-state)] px-3 py-1.5 font-mono text-sm font-semibold text-[var(--neu-green)]">
              https://mail.haltman.io
            </p>
            <div className="space-y-3">
              <p className="font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
                Current operations used by the extension:
              </p>
              <ul className="space-y-1.5 pl-5 font-mono text-sm text-[var(--text-muted)]">
                <li className="list-disc"><code className="text-[var(--text-secondary)]">GET</code> /domains</li>
                <li className="list-disc"><code className="text-[var(--text-secondary)]">GET</code> /api/alias/list (including key verification)</li>
                <li className="list-disc"><code className="text-[var(--text-secondary)]">POST</code> /api/alias/create</li>
                <li className="list-disc"><code className="text-[var(--text-secondary)]">POST</code> /api/alias/delete</li>
                <li className="list-disc"><code className="text-[var(--text-secondary)]">POST</code> /api/credentials/create</li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
                Depending on user action, transmitted fields can include:
              </p>
              <ul className="space-y-1.5 pl-5 font-mono text-sm text-[var(--text-muted)]">
                <li className="list-disc">API key in <code className="text-[var(--text-secondary)]">X-API-KEY</code> for authenticated alias operations</li>
                <li className="list-disc">Alias fields (alias_handle, alias_domain, alias)</li>
                <li className="list-disc">Credential request fields (email, days) when requesting a new API key</li>
              </ul>
            </div>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* What Is Not Transmitted */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              What Is Not Transmitted
            </h2>
            <ul className="space-y-2 pl-5 font-mono text-sm leading-[1.6] text-[var(--text-primary)]">
              <li className="list-disc">Browsing history</li>
              <li className="list-disc">Page content</li>
              <li className="list-disc">Existing values of email input fields</li>
              <li className="list-disc">Analytics or telemetry payloads</li>
              <li className="list-disc">Data unrelated to alias operations</li>
            </ul>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Clipboard */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Clipboard and User Actions
            </h2>
            <p className="font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              Clipboard writes occur only after explicit user actions (such as
              popup actions or context-menu actions) to copy aliases, with
              visible feedback when possible.
            </p>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* User Data and Tracking */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              User Data and Tracking
            </h2>
            <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
              <ul className="space-y-2 font-mono text-sm leading-[1.6] text-[var(--text-primary)]">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--neu-green)]" />
                  No analytics SDKs.
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--neu-green)]" />
                  No telemetry.
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--neu-green)]" />
                  No behavioral profiling.
                </li>
              </ul>
            </div>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Abuse Prevention */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Abuse Prevention
            </h2>
            <div className="space-y-3 font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              <p>Haltman.io does not tolerate abuse of its services.</p>
              <p>Attempts to misuse or exploit the infrastructure may result in:</p>
              <ul className="space-y-1.5 pl-5 text-[var(--text-primary)]">
                <li className="list-disc">Neutralization of abusive actions</li>
                <li className="list-disc">Suspension or revocation of API access</li>
                <li className="list-disc">Additional technical or administrative countermeasures as required</li>
              </ul>
              <p>
                The service may be monitored for abuse prevention and infrastructure protection.
              </p>
            </div>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Transparency */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Transparency and Source Code
            </h2>
            <p className="font-mono text-sm leading-[1.6] text-[var(--text-secondary)]">
              This project is open source and auditable. Source code and
              technical documentation are available via links in the add-on
              listing or support channels.
            </p>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          {/* Contact */}
          <section className="space-y-5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
              Contact
            </h2>
            <div className="select-text space-y-3 font-mono text-sm leading-[1.6]">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[var(--text-muted)]">General:</span>
                <a href="mailto:root@haltman.io" className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)]">root@haltman.io</a>
                <span className="text-[var(--text-muted)]">&amp;</span>
                <a href="mailto:members@proton.thc.org" className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)]">members@proton.thc.org</a>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[var(--text-muted)]">Privacy:</span>
                <a href="mailto:root@haltman.io" className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)]">root@haltman.io</a>
                <span className="text-[var(--text-muted)]">&amp;</span>
                <a href="mailto:members@proton.thc.org" className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)]">members@proton.thc.org</a>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[var(--text-muted)]">Abuse:</span>
                <a href="mailto:root@haltman.io" className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)]">root@haltman.io</a>
                <span className="text-[var(--text-muted)]">&amp;</span>
                <a href="mailto:members@proton.thc.org" className="text-[var(--neu-green)] underline underline-offset-4 hover:text-[var(--text-primary)]">members@proton.thc.org</a>
              </div>
            </div>
          </section>

          <Separator className="my-8 bg-[var(--hover-state)]" />

          <p className="font-mono text-xs leading-[1.6] text-[var(--text-muted)]">
            By using this add-on, you agree to this privacy policy.
          </p>

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
