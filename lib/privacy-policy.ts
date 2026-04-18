export type PrivacyListItem = {
  text: string;
  children: PrivacyListItem[];
};

export type PrivacyBlock =
  | {
      type: "heading";
      level: number;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: PrivacyListItem[];
    };

export type PrivacySection = {
  heading: string;
  blocks: PrivacyBlock[];
};

export type PrivacyDocument = {
  title: string;
  lastUpdated: string | null;
  introBlocks: PrivacyBlock[];
  sections: PrivacySection[];
  agreement: string | null;
};

export const privacyPolicyDocument: PrivacyDocument = {
  title: "Privacy Policy - Email Alias Manager (Free)",
  lastUpdated: "Last updated: April 18, 2026",
  introBlocks: [
    {
      type: "paragraph",
      text: "This privacy policy applies to the **Email Alias Manager (Free)** browser extension, distributed for both **Mozilla Firefox** and **Google Chrome**. The two distributions share the same source code and data-handling behavior; any differences are limited to browser-specific APIs required to run on each platform.",
    },
    {
      type: "paragraph",
      text: "The extension is designed with a privacy-first approach. It processes only the data required to create and manage email aliases on the user's own Haltman.io Mail Forwarding account. It does **not** include analytics, telemetry, behavioral profiling, ads, affiliate codes, or any form of third-party data sharing.",
    },
  ],
  sections: [
    {
      heading: "Single Purpose",
      blocks: [
        {
          type: "paragraph",
          text: "The extension has a single, narrow purpose: to let the user view, create, and delete email aliases on their own Haltman.io Mail Forwarding account through the browser.",
        },
      ],
    },
    {
      heading: "Data Handled by the Extension",
      blocks: [
        {
          type: "heading",
          level: 3,
          text: "Stored locally on the user's device",
        },
        {
          type: "paragraph",
          text: "The extension writes the following keys to `browser.storage.local` (Firefox) / `chrome.storage.local` (Chrome). Nothing is written anywhere else, and nothing is synced to any cloud account.",
        },
        {
          type: "list",
          items: [
            {
              text: "**API credentials**",
              children: [
                {
                  text: "`apiKey` — the user's Haltman.io API key (stored in plaintext only when the password lock is disabled).",
                  children: [],
                },
                {
                  text: "`apiKeyEncPayload` and `locked` — when the password lock is enabled, the API key is encrypted at rest using **PBKDF2 (SHA-256)** for key derivation and **AES-256-GCM** for encryption. The user's password is never stored, transmitted, or logged.",
                  children: [],
                },
              ],
            },
            {
              text: "**Alias / domain preferences**",
              children: [
                {
                  text: "`domainsCache`, `defaultDomain`, `lastDomain`, `hasSelectedDomain`, `favoriteDomains`.",
                  children: [],
                },
              ],
            },
            {
              text: "**UI preferences**",
              children: [
                {
                  text: "`uiMode`, `handleStyle`, `skipDeleteConfirm`.",
                  children: [],
                },
              ],
            },
            {
              text: "**Overlay controls (user-defined)**",
              children: [
                {
                  text: "`overlayEnabled`, `overlayMode`, `overlaySites`.",
                  children: [],
                },
                {
                  text: "`overlaySites` contains user-defined rules such as `host:example.com`, `file://…`, or special browser-page keys. These rules never leave the device.",
                  children: [],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          level: 3,
          text: "Handled in memory only",
        },
        {
          type: "paragraph",
          text: "When the password lock is enabled and unlocked, the decrypted API key lives only in the background script's session memory for the duration of the browser session. It is discarded on lock, on browser restart, or when the session is closed.",
        },
        {
          type: "heading",
          level: 3,
          text: "Not stored and not transmitted",
        },
        {
          type: "paragraph",
          text: "The extension does not store, collect, or transmit any of the following:",
        },
        {
          type: "list",
          items: [
            { text: "Browsing history or tab activity.", children: [] },
            { text: "Page content, DOM snapshots, or screenshots.", children: [] },
            {
              text: "The existing value of email input fields before the user explicitly triggers an action.",
              children: [],
            },
            {
              text: "Cookies, credentials, form data, or keystrokes from any site.",
              children: [],
            },
            { text: "Analytics, telemetry, or crash reports.", children: [] },
          ],
        },
      ],
    },
    {
      heading: "Network Transmission",
      blocks: [
        {
          type: "paragraph",
          text: "The extension communicates **only** with a single endpoint:",
        },
        {
          type: "list",
          items: [{ text: "`https://mail.haltman.io`", children: [] }],
        },
        {
          type: "paragraph",
          text: "All traffic is sent over HTTPS (TLS). API keys are sent exclusively in the `X-API-Key` request header, never in URLs or query strings, to avoid accidental disclosure in server logs or browser history.",
        },
        {
          type: "paragraph",
          text: "Endpoints used by the current version:",
        },
        {
          type: "list",
          items: [
            {
              text: "`GET  /api/domains` — list available alias domains.",
              children: [],
            },
            {
              text: "`GET  /api/alias/list` — list the user's aliases (also used with `limit=1` to verify that a key is valid before saving it).",
              children: [],
            },
            {
              text: "`POST /api/alias/create` — create a new alias.",
              children: [],
            },
            {
              text: "`POST /api/alias/delete` — delete an alias.",
              children: [],
            },
            {
              text: "`POST /api/credentials/create` — request a new API key by email (anti-abuse confirmation flow).",
              children: [],
            },
          ],
        },
        {
          type: "paragraph",
          text: "Depending on user actions, the fields actually transmitted can include:",
        },
        {
          type: "list",
          items: [
            {
              text: "The API key, in the `X-API-Key` request header, for authenticated alias operations.",
              children: [],
            },
            {
              text: "`alias_handle`, `alias_domain`, or `alias` (the local part, domain, or full email address) when creating or deleting aliases.",
              children: [],
            },
            {
              text: "`email` and `days` when requesting a new API key through the onboarding form.",
              children: [],
            },
          ],
        },
        {
          type: "paragraph",
          text: "No other field, host, or third-party service receives any data from the extension.",
        },
      ],
    },
    {
      heading: "Use of Browser Permissions",
      blocks: [
        {
          type: "paragraph",
          text: "Each permission requested by the extension is used strictly for the single purpose above:",
        },
        {
          type: "list",
          items: [
            {
              text: "**`storage`** — to persist the API key, domain cache, and user preferences listed above.",
              children: [],
            },
            {
              text: "**`contextMenus`** — to add a \"Generate random alias\" item under an \"Email Alias Manager\" right-click menu.",
              children: [],
            },
            {
              text: "**`activeTab`** — to act on the tab the user is currently interacting with (for example, to write the generated alias to that tab's clipboard).",
              children: [],
            },
            {
              text: "**`scripting`** (Chrome only) — to inject a small, clearly-scoped script into the active tab that writes the generated alias to the clipboard. Used only in response to an explicit user action.",
              children: [],
            },
            {
              text: "**`notifications`** — to display status notifications when an alias is created or copied.",
              children: [],
            },
            {
              text: "**`clipboardWrite`** — to copy generated aliases to the clipboard after explicit user actions.",
              children: [],
            },
            {
              text: "**Host permission `https://mail.haltman.io/*`** — the extension's only backend; required to call the API described above.",
              children: [],
            },
            {
              text: "**Content script on `<all_urls>`** — to render, only locally and only next to `input[type=\"email\"]` elements, the optional helper UI. The content script never transmits field values, page content, or page URLs to the backend.",
              children: [],
            },
          ],
        },
        {
          type: "paragraph",
          text: "The extension does **not** request `tabs`, `cookies`, `webRequest`, `webNavigation`, `history`, `bookmarks`, `downloads`, or any broad-host permission beyond `mail.haltman.io`.",
        },
      ],
    },
    {
      heading: "Local Page Processing",
      blocks: [
        {
          type: "paragraph",
          text: "To decide whether to render the optional helper UI on a given page, the extension may read the current page's URL or hostname locally in the browser (for allowlist / denylist checks against user-defined rules). This check is purely local — the URL and hostname are never sent to Haltman.io or any third party.",
        },
      ],
    },
    {
      heading: "Clipboard and User Actions",
      blocks: [
        {
          type: "paragraph",
          text: "Clipboard writes happen only after explicit user action:",
        },
        {
          type: "list",
          items: [
            { text: "clicking a button in the popup,", children: [] },
            { text: "clicking the in-page helper,", children: [] },
            { text: "or using the right-click context menu.", children: [] },
          ],
        },
        {
          type: "paragraph",
          text: "Visible feedback is provided (notification, toast, or in-popup status) whenever possible.",
        },
      ],
    },
    {
      heading: "Data Sharing and Third Parties",
      blocks: [
        {
          type: "list",
          items: [
            { text: "The extension does **not** sell user data.", children: [] },
            {
              text: "The extension does **not** share user data with third parties.",
              children: [],
            },
            {
              text: "The extension does **not** transfer user data for any purpose unrelated to its single purpose.",
              children: [],
            },
            {
              text: "The extension does **not** use user data to determine creditworthiness or for any lending purpose.",
              children: [],
            },
            {
              text: "There are **no** third-party analytics SDKs, tracking pixels, advertising networks, or affiliate programs in the extension.",
              children: [],
            },
          ],
        },
      ],
    },
    {
      heading: "Security",
      blocks: [
        {
          type: "list",
          items: [
            { text: "All network requests use HTTPS (TLS).", children: [] },
            {
              text: "When the password lock is enabled, the API key is encrypted at rest with PBKDF2 + AES-256-GCM; the password itself is never persisted.",
              children: [],
            },
            {
              text: "The API key is never written to request URLs, query strings, referrers, or logs.",
              children: [],
            },
            {
              text: "The source code is open and auditable; see the \"Transparency and Source Code\" section below.",
              children: [],
            },
          ],
        },
      ],
    },
    {
      heading: "User Control",
      blocks: [
        {
          type: "list",
          items: [
            {
              text: "The user can change or remove the API key at any time from the extension's Options page.",
              children: [],
            },
            {
              text: "The user can enable or disable the password lock, and can \"Lock now\" to wipe the decrypted key from memory.",
              children: [],
            },
            {
              text: "The \"Disconnect\" action in Options removes all locally-stored extension data on the current device. Aliases that already exist on the user's Haltman.io account are **not** affected by disconnecting — they remain managed from the Haltman.io dashboard.",
              children: [],
            },
            {
              text: "The user can fully disable the in-page helper, or restrict it to an allowlist or denylist of sites, from the Options page.",
              children: [],
            },
          ],
        },
      ],
    },
    {
      heading: "Abuse Prevention",
      blocks: [
        {
          type: "paragraph",
          text: "Haltman.io does not tolerate abuse of its services. Attempts to misuse or exploit the infrastructure may result in:",
        },
        {
          type: "list",
          items: [
            { text: "neutralization of abusive actions,", children: [] },
            { text: "suspension or revocation of API access,", children: [] },
            {
              text: "additional technical or administrative countermeasures as required by the operator.",
              children: [],
            },
          ],
        },
        {
          type: "paragraph",
          text: "The backend service (`mail.haltman.io`) may be monitored for abuse prevention and infrastructure protection. The browser extension itself does not perform this monitoring and does not transmit any data for monitoring purposes beyond the API calls described above.",
        },
      ],
    },
    {
      heading: "Transparency and Source Code",
      blocks: [
        {
          type: "paragraph",
          text: "This project is open source and auditable. Source code and technical documentation are available via the links in the extension's store listing and support channels.",
        },
      ],
    },
    {
      heading: "Changes to This Policy",
      blocks: [
        {
          type: "paragraph",
          text: "If this policy changes in a material way, the \"Last updated\" date above will change, and the updated policy will be published at the same URL referenced from the extension's store listing.",
        },
      ],
    },
    {
      heading: "Contact",
      blocks: [
        {
          type: "paragraph",
          text: "For questions, concerns, or reports:",
        },
        {
          type: "list",
          items: [
            {
              text: "General: `root@haltman.io` AND `members@proton.thc.org`",
              children: [],
            },
            {
              text: "Privacy: `root@haltman.io` AND `members@proton.thc.org`",
              children: [],
            },
            {
              text: "Abuse reports: `root@haltman.io` AND `members@proton.thc.org`",
              children: [],
            },
          ],
        },
      ],
    },
  ],
  agreement: "By installing or using this extension, you agree to this privacy policy.",
};
