"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export function PrivacyMenu() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (pathname === "/privacy") setOpen(true);
  }, [pathname]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="group h-8 border-white/10 bg-white/5 px-2.5 text-zinc-200 hover:bg-white/10"
          aria-label="Privacy policy"
          title="Privacy"
        >
          Privacy
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[min(94vw,920px)] max-w-[920px] overflow-y-auto border-white/10 bg-zinc-950/95 p-0">
        <div className="space-y-5 p-6 sm:p-8">
          <DialogHeader className="space-y-0">
            <DialogTitle className="font-mono text-sm uppercase tracking-[0.08em] text-zinc-100">
              PRIVACY POLICY - WEB BROWSER ADD-ON
            </DialogTitle>
          </DialogHeader>

          <Separator className="bg-white/10" />

          <p className="overflow-x-auto whitespace-nowrap font-mono text-xs uppercase tracking-[0.08em] text-zinc-500">
            MAIL ALIAS MANAGER (FREE) — LAST UPDATED: FEBRUARY 20, 2026
          </p>

          <div className="space-y-3 font-mono text-xs leading-[1.5] text-zinc-500">
            <p>
              THIS POLICY REFERS TO OFFICIAL BROWSER ADD-ONS (MAIN MENU →
              EXTENSIONS). UNOFFICIAL INTEGRATIONS MUST WRITE AND ADAPT THEIR OWN
              POLICIES. COPYING THIS POLICY IS PERMITTED, BUT WE TAKE NO ACTION
              FOR OR AGAINST IT TO GUARANTEE: OUR INTELLECTUAL FREEDOM, OUR
              INDEPENDENCE, OUR IMPARTIALITY, OUR JUDGMENT, AND OUR REPUTATION.
            </p>
            <p className="text-zinc-400">NOTE:</p>
            <p>
              WHAT IS OFFICIAL FROM HALTMAN/THC AND HOW TO IDENTIFY IT? THROUGH
              GITHUB (
              <a
                href="https://github.com/haltman-io"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-zinc-300"
              >
                @HALTMAN-IO
              </a>
              ) AND DISTRIBUTORS IN ADD-ON STORES. FOR QUESTIONS, CONTACT US AT:{" "}
              <a
                href="https://www.thc.org/#contact"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-zinc-300"
              >
                THC.ORG
              </a>
              {" · "}
              <a
                href="mailto:members@proton.thc.org"
                className="underline underline-offset-4 hover:text-zinc-300"
              >
                MEMBERS@PROTON.THC.ORG
              </a>
              {" · "}
              <a
                href="mailto:root@haltman.io"
                className="underline underline-offset-4 hover:text-zinc-300"
              >
                ROOT@HALTMAN.IO
              </a>
            </p>
          </div>

          <Separator className="bg-white/10" />

          <section aria-labelledby="privacy-intro" className="space-y-3 font-mono text-sm leading-[1.4] text-zinc-300">
            <h2 id="privacy-intro" className="sr-only">Introduction</h2>
            <p>
              THIS FIREFOX ADD-ON IS DESIGNED WITH A PRIVACY-FIRST APPROACH. IT
              PROCESSES ONLY THE DATA REQUIRED TO CREATE AND MANAGE EMAIL ALIASES
              AND DOES NOT INCLUDE ANALYTICS, TELEMETRY, OR BEHAVIORAL PROFILING.
            </p>
          </section>

          <Separator className="bg-white/10" />

          {/* Data Stored Locally */}
          <section aria-labelledby="privacy-local-data" className="space-y-3">
            <h2
              id="privacy-local-data"
              className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500"
            >
              DATA STORED LOCALLY
            </h2>
            <div className="space-y-3 font-mono text-sm leading-[1.4] text-zinc-200">
              <p className="text-zinc-300">
                THE ADD-ON STORES DATA IN <span className="text-zinc-100">BROWSER.STORAGE.LOCAL</span> ON YOUR DEVICE.
              </p>
              <ul className="space-y-2 pl-4">
                <li>
                  API CREDENTIALS
                  <ul className="mt-1 space-y-1 pl-4 text-zinc-400">
                    <li>APIKEY (PLAINTEXT ONLY WHEN LOCK IS DISABLED)</li>
                    <li>APIKEYENCPAYLOAD AND LOCKED WHEN PASSWORD LOCK IS ENABLED</li>
                    <li>ENCRYPTION USES PBKDF2 FOR KEY DERIVATION AND AES-GCM FOR ENCRYPTION</li>
                    <li>THE LOCK PASSWORD IS NEVER STORED, TRANSMITTED, OR LOGGED</li>
                  </ul>
                </li>
                <li>
                  ALIAS / DOMAIN PREFERENCES
                  <ul className="mt-1 space-y-1 pl-4 text-zinc-400">
                    <li>DOMAINSCACHE, DEFAULTDOMAIN, LASTDOMAIN, HASSELECTEDDOMAIN, FAVORITEDOMAINS</li>
                  </ul>
                </li>
                <li>
                  UI PREFERENCES
                  <ul className="mt-1 space-y-1 pl-4 text-zinc-400">
                    <li>UIMODE, HANDLESTYLE, SKIPDELETECONFIRM</li>
                  </ul>
                </li>
                <li>
                  OVERLAY CONTROLS
                  <ul className="mt-1 space-y-1 pl-4 text-zinc-400">
                    <li>OVERLAYENABLED, OVERLAYMODE, OVERLAYSITES</li>
                    <li>OVERLAYSITES CONTAINS USER-DEFINED SITE RULES</li>
                  </ul>
                </li>
              </ul>
              <p className="text-zinc-300">
                NO LOCALLY STORED DATA IS SOLD OR SHARED WITH THIRD PARTIES BY
                THE EXTENSION.
              </p>
            </div>
          </section>

          <Separator className="bg-white/10" />

          {/* Local Page Processing */}
          <section aria-labelledby="privacy-page-processing" className="space-y-3">
            <h2
              id="privacy-page-processing"
              className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500"
            >
              LOCAL PAGE PROCESSING
            </h2>
            <p className="font-mono text-sm leading-[1.4] text-zinc-300">
              TO SHOW OR HIDE THE HELPER UI ON A PAGE, THE ADD-ON MAY READ THE
              CURRENT PAGE URL/HOST LOCALLY IN THE BROWSER (FOR OVERLAY
              ALLOWLIST/DENYLIST CHECKS). THIS CHECK STAYS LOCAL AND IS NOT
              TRANSMITTED TO REMOTE SERVERS.
            </p>
          </section>

          <Separator className="bg-white/10" />

          {/* Network Requests */}
          <section aria-labelledby="privacy-network" className="space-y-3">
            <h2
              id="privacy-network"
              className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500"
            >
              NETWORK REQUESTS
            </h2>
            <div className="space-y-3 font-mono text-sm leading-[1.4] text-zinc-200">
              <p className="text-zinc-300">THE ADD-ON COMMUNICATES ONLY WITH:</p>
              <p className="text-zinc-100">HTTPS://MAIL.HALTMAN.IO</p>
              <p className="text-zinc-300">CURRENT OPERATIONS USED BY THE EXTENSION:</p>
              <ul className="space-y-1 pl-4 text-zinc-400">
                <li>GET /DOMAINS</li>
                <li>GET /API/ALIAS/LIST (INCLUDING KEY VERIFICATION)</li>
                <li>POST /API/ALIAS/CREATE</li>
                <li>POST /API/ALIAS/DELETE</li>
                <li>POST /API/CREDENTIALS/CREATE</li>
              </ul>
              <p className="text-zinc-300">
                DEPENDING ON USER ACTION, TRANSMITTED FIELDS CAN INCLUDE:
              </p>
              <ul className="space-y-1 pl-4 text-zinc-400">
                <li>API KEY IN X-API-KEY FOR AUTHENTICATED ALIAS OPERATIONS</li>
                <li>ALIAS FIELDS (ALIAS_HANDLE, ALIAS_DOMAIN, ALIAS)</li>
                <li>CREDENTIAL REQUEST FIELDS (EMAIL, DAYS) WHEN REQUESTING A NEW API KEY</li>
              </ul>
            </div>
          </section>

          <Separator className="bg-white/10" />

          {/* What Is Not Transmitted */}
          <section aria-labelledby="privacy-not-transmitted" className="space-y-3">
            <h2
              id="privacy-not-transmitted"
              className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500"
            >
              WHAT IS NOT TRANSMITTED
            </h2>
            <ul className="space-y-2 font-mono text-sm leading-[1.4] text-zinc-200">
              <li>BROWSING HISTORY</li>
              <li>PAGE CONTENT</li>
              <li>EXISTING VALUES OF EMAIL INPUT FIELDS</li>
              <li>ANALYTICS OR TELEMETRY PAYLOADS</li>
              <li>DATA UNRELATED TO ALIAS OPERATIONS</li>
            </ul>
          </section>

          <Separator className="bg-white/10" />

          {/* Clipboard */}
          <section aria-labelledby="privacy-clipboard" className="space-y-3">
            <h2
              id="privacy-clipboard"
              className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500"
            >
              CLIPBOARD AND USER ACTIONS
            </h2>
            <p className="font-mono text-sm leading-[1.4] text-zinc-300">
              CLIPBOARD WRITES OCCUR ONLY AFTER EXPLICIT USER ACTIONS (SUCH AS
              POPUP ACTIONS OR CONTEXT-MENU ACTIONS) TO COPY ALIASES, WITH
              VISIBLE FEEDBACK WHEN POSSIBLE.
            </p>
          </section>

          <Separator className="bg-white/10" />

          {/* User Data and Tracking */}
          <section aria-labelledby="privacy-tracking" className="space-y-3">
            <h2
              id="privacy-tracking"
              className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500"
            >
              USER DATA AND TRACKING
            </h2>
            <ul className="space-y-2 font-mono text-sm leading-[1.4] text-zinc-200">
              <li>NO ANALYTICS SDKS.</li>
              <li>NO TELEMETRY.</li>
              <li>NO BEHAVIORAL PROFILING.</li>
            </ul>
          </section>

          <Separator className="bg-white/10" />

          {/* Abuse Prevention */}
          <section aria-labelledby="privacy-abuse" className="space-y-3">
            <h2
              id="privacy-abuse"
              className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500"
            >
              ABUSE PREVENTION
            </h2>
            <div className="space-y-3 font-mono text-sm leading-[1.4] text-zinc-300">
              <p>HALTMAN.IO DOES NOT TOLERATE ABUSE OF ITS SERVICES.</p>
              <p>ATTEMPTS TO MISUSE OR EXPLOIT THE INFRASTRUCTURE MAY RESULT IN:</p>
              <ul className="space-y-1 pl-4 text-zinc-200">
                <li>NEUTRALIZATION OF ABUSIVE ACTIONS</li>
                <li>SUSPENSION OR REVOCATION OF API ACCESS</li>
                <li>ADDITIONAL TECHNICAL OR ADMINISTRATIVE COUNTERMEASURES AS REQUIRED</li>
              </ul>
              <p>THE SERVICE MAY BE MONITORED FOR ABUSE PREVENTION AND INFRASTRUCTURE PROTECTION.</p>
            </div>
          </section>

          <Separator className="bg-white/10" />

          {/* Transparency */}
          <section aria-labelledby="privacy-transparency" className="space-y-3">
            <h2
              id="privacy-transparency"
              className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500"
            >
              TRANSPARENCY AND SOURCE CODE
            </h2>
            <p className="font-mono text-sm leading-[1.4] text-zinc-300">
              THIS PROJECT IS OPEN SOURCE AND AUDITABLE. SOURCE CODE AND
              TECHNICAL DOCUMENTATION ARE AVAILABLE VIA LINKS IN THE ADD-ON
              LISTING OR SUPPORT CHANNELS.
            </p>
          </section>

          <Separator className="bg-white/10" />

          {/* Contact */}
          <section aria-labelledby="privacy-contact" className="space-y-3">
            <h2
              id="privacy-contact"
              className="font-mono text-xs uppercase tracking-[0.08em] text-zinc-500"
            >
              CONTACT
            </h2>
            <div className="select-text space-y-3 font-mono text-sm leading-[1.4] text-zinc-200">
              <p>
                GENERAL:{" "}
                <a
                  href="mailto:root@haltman.io"
                  className="underline underline-offset-4 hover:text-zinc-100"
                >
                  root@haltman.io
                </a>
                {" & "}
                <a
                  href="mailto:members@proton.thc.org"
                  className="underline underline-offset-4 hover:text-zinc-100"
                >
                  members@proton.thc.org
                </a>
              </p>
              <p>
                PRIVACY:{" "}
                <a
                  href="mailto:root@haltman.io"
                  className="underline underline-offset-4 hover:text-zinc-100"
                >
                  root@haltman.io
                </a>
                {" & "}
                <a
                  href="mailto:members@proton.thc.org"
                  className="underline underline-offset-4 hover:text-zinc-100"
                >
                  members@proton.thc.org
                </a>
              </p>
              <p>
                ABUSE:{" "}
                <a
                  href="mailto:root@haltman.io"
                  className="underline underline-offset-4 hover:text-zinc-100"
                >
                  root@haltman.io
                </a>
                {" & "}
                <a
                  href="mailto:members@proton.thc.org"
                  className="underline underline-offset-4 hover:text-zinc-100"
                >
                  members@proton.thc.org
                </a>
              </p>
            </div>
          </section>

          <Separator className="bg-white/10" />

          <p className="font-mono text-xs leading-[1.4] text-zinc-500">
            BY USING THIS ADD-ON, YOU AGREE TO THIS PRIVACY POLICY.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
