"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type PrivacyMenuProps = {
  triggerClassName?: string;
};

export function PrivacyMenu({ triggerClassName }: PrivacyMenuProps = {}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (pathname === "/privacy") setOpen(true);
  }, [pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "group ui-focus-ring inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-sm font-medium",
            triggerClassName ?? "ui-smooth ui-surface-pressed text-[var(--text-muted)] hover:border-[color:color-mix(in_oklch,var(--hairline-border)_58%,white_42%)]"
          )}
          aria-label="Privacy policy"
          title="Privacy"
        >
          Privacy
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[min(94vw,920px)] max-w-[920px] overflow-y-auto border-[var(--hairline-border)] bg-[var(--surface-elevated)] p-0">
        <div className="space-y-5 p-6 sm:p-8">
          <DialogHeader className="space-y-0">
            <DialogTitle className="font-mono text-sm uppercase tracking-[0.08em] text-[var(--text-primary)]">
              PRIVACY POLICY - WEB BROWSER ADD-ON
            </DialogTitle>
          </DialogHeader>

          <Separator className="bg-[var(--hover-state)]" />

          <p className="overflow-x-auto whitespace-nowrap font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
            MAIL ALIAS MANAGER (FREE) — LAST UPDATED: FEBRUARY 20, 2026
          </p>

          <div className="space-y-3 font-mono text-xs leading-[1.5] text-[var(--text-muted)]">
            <p>
              THIS POLICY REFERS TO OFFICIAL BROWSER ADD-ONS (MAIN MENU →
              EXTENSIONS). UNOFFICIAL INTEGRATIONS MUST WRITE AND ADAPT THEIR OWN
              POLICIES. COPYING THIS POLICY IS PERMITTED, BUT WE TAKE NO ACTION
              FOR OR AGAINST IT TO GUARANTEE: OUR INTELLECTUAL FREEDOM, OUR
              INDEPENDENCE, OUR IMPARTIALITY, OUR JUDGMENT, AND OUR REPUTATION.
            </p>
            <p className="text-[var(--text-secondary)]">NOTE:</p>
            <p>
              WHAT IS OFFICIAL FROM HALTMAN/THC AND HOW TO IDENTIFY IT? THROUGH
              GITHUB (
              <a
                href="https://github.com/haltman-io"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-[var(--text-secondary)]"
              >
                @HALTMAN-IO
              </a>
              ) AND DISTRIBUTORS IN ADD-ON STORES. FOR QUESTIONS, CONTACT US AT:{" "}
              <a
                href="https://www.thc.org/#contact"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-[var(--text-secondary)]"
              >
                THC.ORG
              </a>
              {" · "}
              <a
                href="mailto:members@proton.thc.org"
                className="underline underline-offset-4 hover:text-[var(--text-secondary)]"
              >
                MEMBERS@PROTON.THC.ORG
              </a>
              {" · "}
              <a
                href="mailto:root@haltman.io"
                className="underline underline-offset-4 hover:text-[var(--text-secondary)]"
              >
                ROOT@HALTMAN.IO
              </a>
            </p>
          </div>

          <Separator className="bg-[var(--hover-state)]" />

          <section aria-labelledby="privacy-intro" className="space-y-3 font-mono text-sm leading-[1.4] text-[var(--text-secondary)]">
            <h2 id="privacy-intro" className="sr-only">Introduction</h2>
            <p>
              THIS FIREFOX ADD-ON IS DESIGNED WITH A PRIVACY-FIRST APPROACH. IT
              PROCESSES ONLY THE DATA REQUIRED TO CREATE AND MANAGE EMAIL ALIASES
              AND DOES NOT INCLUDE ANALYTICS, TELEMETRY, OR BEHAVIORAL PROFILING.
            </p>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          {/* Data Stored Locally */}
          <section aria-labelledby="privacy-local-data" className="space-y-3">
            <h2
              id="privacy-local-data"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]"
            >
              DATA STORED LOCALLY
            </h2>
            <div className="space-y-3 font-mono text-sm leading-[1.4] text-[var(--text-primary)]">
              <p className="text-[var(--text-secondary)]">
                THE ADD-ON STORES DATA IN <span className="text-[var(--text-primary)]">BROWSER.STORAGE.LOCAL</span> ON YOUR DEVICE.
              </p>
              <ul className="space-y-2 pl-4">
                <li>
                  API CREDENTIALS
                  <ul className="mt-1 space-y-1 pl-4 text-[var(--text-secondary)]">
                    <li>APIKEY (PLAINTEXT ONLY WHEN LOCK IS DISABLED)</li>
                    <li>APIKEYENCPAYLOAD AND LOCKED WHEN PASSWORD LOCK IS ENABLED</li>
                    <li>ENCRYPTION USES PBKDF2 FOR KEY DERIVATION AND AES-GCM FOR ENCRYPTION</li>
                    <li>THE LOCK PASSWORD IS NEVER STORED, TRANSMITTED, OR LOGGED</li>
                  </ul>
                </li>
                <li>
                  ALIAS / DOMAIN PREFERENCES
                  <ul className="mt-1 space-y-1 pl-4 text-[var(--text-secondary)]">
                    <li>DOMAINSCACHE, DEFAULTDOMAIN, LASTDOMAIN, HASSELECTEDDOMAIN, FAVORITEDOMAINS</li>
                  </ul>
                </li>
                <li>
                  UI PREFERENCES
                  <ul className="mt-1 space-y-1 pl-4 text-[var(--text-secondary)]">
                    <li>UIMODE, HANDLESTYLE, SKIPDELETECONFIRM</li>
                  </ul>
                </li>
                <li>
                  OVERLAY CONTROLS
                  <ul className="mt-1 space-y-1 pl-4 text-[var(--text-secondary)]">
                    <li>OVERLAYENABLED, OVERLAYMODE, OVERLAYSITES</li>
                    <li>OVERLAYSITES CONTAINS USER-DEFINED SITE RULES</li>
                  </ul>
                </li>
              </ul>
              <p className="text-[var(--text-secondary)]">
                NO LOCALLY STORED DATA IS SOLD OR SHARED WITH THIRD PARTIES BY
                THE EXTENSION.
              </p>
            </div>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          {/* Local Page Processing */}
          <section aria-labelledby="privacy-page-processing" className="space-y-3">
            <h2
              id="privacy-page-processing"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]"
            >
              LOCAL PAGE PROCESSING
            </h2>
            <p className="font-mono text-sm leading-[1.4] text-[var(--text-secondary)]">
              TO SHOW OR HIDE THE HELPER UI ON A PAGE, THE ADD-ON MAY READ THE
              CURRENT PAGE URL/HOST LOCALLY IN THE BROWSER (FOR OVERLAY
              ALLOWLIST/DENYLIST CHECKS). THIS CHECK STAYS LOCAL AND IS NOT
              TRANSMITTED TO REMOTE SERVERS.
            </p>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          {/* Network Requests */}
          <section aria-labelledby="privacy-network" className="space-y-3">
            <h2
              id="privacy-network"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]"
            >
              NETWORK REQUESTS
            </h2>
            <div className="space-y-3 font-mono text-sm leading-[1.4] text-[var(--text-primary)]">
              <p className="text-[var(--text-secondary)]">THE ADD-ON COMMUNICATES ONLY WITH:</p>
              <p className="text-[var(--text-primary)]">HTTPS://MAIL.HALTMAN.IO</p>
              <p className="text-[var(--text-secondary)]">CURRENT OPERATIONS USED BY THE EXTENSION:</p>
              <ul className="space-y-1 pl-4 text-[var(--text-secondary)]">
                <li>GET /DOMAINS</li>
                <li>GET /API/ALIAS/LIST (INCLUDING KEY VERIFICATION)</li>
                <li>POST /API/ALIAS/CREATE</li>
                <li>POST /API/ALIAS/DELETE</li>
                <li>POST /API/CREDENTIALS/CREATE</li>
              </ul>
              <p className="text-[var(--text-secondary)]">
                DEPENDING ON USER ACTION, TRANSMITTED FIELDS CAN INCLUDE:
              </p>
              <ul className="space-y-1 pl-4 text-[var(--text-secondary)]">
                <li>API KEY IN X-API-KEY FOR AUTHENTICATED ALIAS OPERATIONS</li>
                <li>ALIAS FIELDS (ALIAS_HANDLE, ALIAS_DOMAIN, ALIAS)</li>
                <li>CREDENTIAL REQUEST FIELDS (EMAIL, DAYS) WHEN REQUESTING A NEW API KEY</li>
              </ul>
            </div>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          {/* What Is Not Transmitted */}
          <section aria-labelledby="privacy-not-transmitted" className="space-y-3">
            <h2
              id="privacy-not-transmitted"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]"
            >
              WHAT IS NOT TRANSMITTED
            </h2>
            <ul className="space-y-2 font-mono text-sm leading-[1.4] text-[var(--text-primary)]">
              <li>BROWSING HISTORY</li>
              <li>PAGE CONTENT</li>
              <li>EXISTING VALUES OF EMAIL INPUT FIELDS</li>
              <li>ANALYTICS OR TELEMETRY PAYLOADS</li>
              <li>DATA UNRELATED TO ALIAS OPERATIONS</li>
            </ul>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          {/* Clipboard */}
          <section aria-labelledby="privacy-clipboard" className="space-y-3">
            <h2
              id="privacy-clipboard"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]"
            >
              CLIPBOARD AND USER ACTIONS
            </h2>
            <p className="font-mono text-sm leading-[1.4] text-[var(--text-secondary)]">
              CLIPBOARD WRITES OCCUR ONLY AFTER EXPLICIT USER ACTIONS (SUCH AS
              POPUP ACTIONS OR CONTEXT-MENU ACTIONS) TO COPY ALIASES, WITH
              VISIBLE FEEDBACK WHEN POSSIBLE.
            </p>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          {/* User Data and Tracking */}
          <section aria-labelledby="privacy-tracking" className="space-y-3">
            <h2
              id="privacy-tracking"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]"
            >
              USER DATA AND TRACKING
            </h2>
            <ul className="space-y-2 font-mono text-sm leading-[1.4] text-[var(--text-primary)]">
              <li>NO ANALYTICS SDKS.</li>
              <li>NO TELEMETRY.</li>
              <li>NO BEHAVIORAL PROFILING.</li>
            </ul>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          {/* Abuse Prevention */}
          <section aria-labelledby="privacy-abuse" className="space-y-3">
            <h2
              id="privacy-abuse"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]"
            >
              ABUSE PREVENTION
            </h2>
            <div className="space-y-3 font-mono text-sm leading-[1.4] text-[var(--text-secondary)]">
              <p>HALTMAN.IO DOES NOT TOLERATE ABUSE OF ITS SERVICES.</p>
              <p>ATTEMPTS TO MISUSE OR EXPLOIT THE INFRASTRUCTURE MAY RESULT IN:</p>
              <ul className="space-y-1 pl-4 text-[var(--text-primary)]">
                <li>NEUTRALIZATION OF ABUSIVE ACTIONS</li>
                <li>SUSPENSION OR REVOCATION OF API ACCESS</li>
                <li>ADDITIONAL TECHNICAL OR ADMINISTRATIVE COUNTERMEASURES AS REQUIRED</li>
              </ul>
              <p>THE SERVICE MAY BE MONITORED FOR ABUSE PREVENTION AND INFRASTRUCTURE PROTECTION.</p>
            </div>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          {/* Transparency */}
          <section aria-labelledby="privacy-transparency" className="space-y-3">
            <h2
              id="privacy-transparency"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]"
            >
              TRANSPARENCY AND SOURCE CODE
            </h2>
            <p className="font-mono text-sm leading-[1.4] text-[var(--text-secondary)]">
              THIS PROJECT IS OPEN SOURCE AND AUDITABLE. SOURCE CODE AND
              TECHNICAL DOCUMENTATION ARE AVAILABLE VIA LINKS IN THE ADD-ON
              LISTING OR SUPPORT CHANNELS.
            </p>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          {/* Contact */}
          <section aria-labelledby="privacy-contact" className="space-y-3">
            <h2
              id="privacy-contact"
              className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]"
            >
              CONTACT
            </h2>
            <div className="select-text space-y-3 font-mono text-sm leading-[1.4] text-[var(--text-primary)]">
              <p>
                GENERAL:{" "}
                <a
                  href="mailto:root@haltman.io"
                  className="underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  root@haltman.io
                </a>
                {" & "}
                <a
                  href="mailto:members@proton.thc.org"
                  className="underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  members@proton.thc.org
                </a>
              </p>
              <p>
                PRIVACY:{" "}
                <a
                  href="mailto:root@haltman.io"
                  className="underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  root@haltman.io
                </a>
                {" & "}
                <a
                  href="mailto:members@proton.thc.org"
                  className="underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  members@proton.thc.org
                </a>
              </p>
              <p>
                ABUSE:{" "}
                <a
                  href="mailto:root@haltman.io"
                  className="underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  root@haltman.io
                </a>
                {" & "}
                <a
                  href="mailto:members@proton.thc.org"
                  className="underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  members@proton.thc.org
                </a>
              </p>
            </div>
          </section>

          <Separator className="bg-[var(--hover-state)]" />

          <p className="font-mono text-xs leading-[1.4] text-[var(--text-muted)]">
            BY USING THIS ADD-ON, YOU AGREE TO THIS PRIVACY POLICY.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
