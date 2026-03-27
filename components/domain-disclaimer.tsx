"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Info } from "lucide-react";

const DISCLAIMER_CONTENT: Record<string, { appName: string; owner: string; url: string }> = {
  "metasploit.io": {
    appName: "Metasploit Framework",
    owner: "Rapid7",
    url: "https://www.metasploit.com/",
  },
  "polkit.org": {
    appName: "Polkit",
    owner: "freedesktop.org",
    url: "https://gitlab.freedesktop.org/polkit/polkit",
  },
  "cobaltstrike.org": {
    appName: "Cobalt Strike",
    owner: "Fortra",
    url: "https://www.cobaltstrike.com/",
  },
  "johntheripper.org": {
    appName: "John the Ripper",
    owner: "Openwall",
    url: "https://www.openwall.com/john/",
  }
};

export function DomainDisclaimer() {
  const [hostSpec, setHostSpec] = useState<(typeof DISCLAIMER_CONTENT)[string] | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (sessionStorage.getItem("domain-disclaimer-dismissed") === "true") {
      return;
    }

    const currentHost = window.location.hostname;

    // Check if current host strictly equals or ends with a dot + the pinned domain
    const match = Object.keys(DISCLAIMER_CONTENT).find((domain) =>
      currentHost === domain || currentHost.endsWith(`.${domain}`)
    );

    if (match) {
      setHostSpec(DISCLAIMER_CONTENT[match]);
      setIsVisible(true);
    }
  }, []);

  if (!isVisible || !hostSpec) return null;

  const handleDismiss = () => {
    sessionStorage.setItem("domain-disclaimer-dismissed", "true");
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500 w-[calc(100%-2rem)] max-w-sm sm:max-w-md md:bottom-6 md:left-6">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_8px_32px_-4px_rgba(0,0,0,0.50)] backdrop-blur-[24px] backdrop-saturate-[1.3]">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--hover-state)] hover:text-[var(--text-primary)]"
          title="Dismiss"
          aria-label="Dismiss disclaimer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-4">
          <div className="mt-0.5 shrink-0 rounded-full bg-[rgba(var(--neu-green-rgb)/0.10)] p-2 text-[var(--neu-green)]">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-3.5 pr-4">
            <h3 className="font-sans text-[15.5px] font-semibold tracking-tight text-[var(--text-primary)]">
              Looking for {hostSpec.appName} from {hostSpec.owner}?
            </h3>
            <p className="font-sans text-[13px] leading-relaxed text-[var(--text-secondary)]">
              This domain is not owned by {hostSpec.owner} ({hostSpec.appName} owner), but we admire them. We found this domain available for registration and decided to integrate it into our mail forwarder so you can have a cool alias domain for free.
            </p>
            <p className="font-sans text-xs text-[var(--text-muted)]">
              This is a non-profit, open-source project created and sustained by the community.
            </p>
            <div className="pt-1.5">
              <a
                href={hostSpec.url}
                target="_blank"
                rel="noreferrer"
                className="alias-primary neu-btn-green inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[13px] font-medium no-underline transition-all"
              >
                Go to official site
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
