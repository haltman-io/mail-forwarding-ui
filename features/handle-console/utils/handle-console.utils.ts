import { clampLower } from "@/lib/utils-mail";

import type {
  ApiErrorInfo,
  HandleIntent,
  RequestState,
  StatusKind,
} from "@/features/handle-console/types/handle-console.types";

export const RE_HANDLE =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;

const RE_SAFE_DOMAIN =
  /^(?=.{1,253}$)(?!.*\.\.)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export const MAX_HANDLE_LENGTH = 64;

export const clickableIconClass =
  "opacity-70 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none";

export const staticIconClass = "cursor-default";

export const codeBlockClass =
  "overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[var(--text-secondary)] tracking-[0.01em] tabular-nums";

export function sanitizeOtpToken(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function validateHandle(value: string): { ok: true; value: string } | { ok: false; error: string } {
  const normalized = clampLower(value);
  if (normalized.length < 1 || normalized.length > MAX_HANDLE_LENGTH) {
    return { ok: false, error: "Handle must be 1-64 characters." };
  }
  if (!RE_HANDLE.test(normalized)) {
    return { ok: false, error: "Invalid handle format." };
  }
  return { ok: true, value: normalized };
}

export function validateDomain(value: string): { ok: true; value: string } | { ok: false; error: string } {
  const normalized = clampLower(value);
  if (!RE_SAFE_DOMAIN.test(normalized)) {
    return { ok: false, error: "Domain must follow strict DNS format." };
  }
  return { ok: true, value: normalized };
}

function curlBaseUrl(host: string, path: string) {
  return `https://${host}${path}`;
}

function formatCurlLines(url: string, params: Record<string, string>) {
  const lines = [`curl -G '${url}'`];
  const entries = Object.entries(params);
  for (const [key, value] of entries) {
    lines.push(`  --data-urlencode '${key}=${value}'`);
  }
  return lines.join(" \\\n");
}

export function buildClaimCurl(handle: string, to: string, host: string) {
  const h = clampLower(handle) || "{handle}";
  const target = to.trim() || "{your_mail}";
  const url = curlBaseUrl(host, "/api/handle/subscribe");
  return formatCurlLines(url, { handle: h, to: target });
}

export function buildRemoveCurl(handle: string, host: string) {
  const h = clampLower(handle) || "{handle}";
  const url = curlBaseUrl(host, "/api/handle/unsubscribe");
  return formatCurlLines(url, { handle: h });
}

export function buildDomainDisableCurl(handle: string, domain: string, host: string) {
  const h = clampLower(handle) || "{handle}";
  const d = clampLower(domain) || "{domain}";
  const url = curlBaseUrl(host, "/api/handle/domain/disable");
  return formatCurlLines(url, { handle: h, domain: d });
}

export function buildDomainEnableCurl(handle: string, domain: string, host: string) {
  const h = clampLower(handle) || "{handle}";
  const d = clampLower(domain) || "{domain}";
  const url = curlBaseUrl(host, "/api/handle/domain/enable");
  return formatCurlLines(url, { handle: h, domain: d });
}

export function getStatusPillText(requestState: RequestState) {
  if (requestState === "loading") return "Requesting";
  if (requestState === "success") return "Confirmed";
  if (requestState === "error") return "Error";
  return "Idle";
}

export function getStatusKind(requestState: RequestState): StatusKind {
  if (requestState === "success") return "ok";
  if (requestState === "error") return "bad";
  return "idle";
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function intentLabel(intent: HandleIntent): string {
  switch (intent) {
    case "subscribe": return "Claim handle";
    case "unsubscribe": return "Remove handle";
    case "domain_disable": return "Disable domain";
    case "domain_enable": return "Enable domain";
  }
}

export function describeApiError(data: unknown, fallback: string | null, status?: number): ApiErrorInfo {
  const payload = toRecord(data);
  const error = toText(payload.error);

  if (!error) {
    if (status === 429) {
      return { title: "Rate limited", description: fallback ?? "Too many requests. Try again soon." };
    }
    return {
      title: "Request failed",
      description: fallback ?? "Please try again in a moment.",
    };
  }

  switch (error) {
    case "invalid_params": {
      const field = toText(payload.field);
      const reason = toText(payload.reason);
      const hint = toText(payload.hint);

      if (reason === "destination_cannot_be_an_existing_alias") {
        return { title: "Invalid destination", description: "This email is already an alias and cannot be used as a destination." };
      }
      if (reason === "destination_cannot_use_managed_domain") {
        return { title: "Invalid destination", description: "The destination email cannot use a domain managed by the platform." };
      }

      const parts = [
        field ? `Field: ${field}` : null,
        reason ? `Reason: ${reason}` : null,
        hint ? `Hint: ${hint}` : null,
      ].filter(Boolean);
      return {
        title: "Invalid parameters",
        description: parts.join(" · ") || "Check the submitted values and try again.",
      };
    }
    case "banned": {
      const ban = toText(payload.ban);
      return {
        title: "Request blocked",
        description: ban ? `Banned: ${ban}` : "Handle or email is blocked by the platform.",
      };
    }
    case "alias_taken":
      return {
        title: "Handle already taken",
        description: "This handle is already claimed. Choose a different one.",
      };
    case "handle_not_found":
      return {
        title: "Handle not found",
        description: "The specified handle does not exist.",
      };
    case "invalid_or_expired":
      return {
        title: "Code invalid or expired",
        description: "Request a new confirmation code and try again.",
      };
    case "invalid_token":
      return {
        title: "Invalid code",
        description: "Code must be exactly 6 digits.",
      };
    case "confirmation_payload_missing":
      return { title: "Confirmation failed", description: "Confirmation payload is missing." };
    case "rate_limited": {
      const reason = toText(payload.reason);
      return {
        title: "Rate limited",
        description: reason ?? "Too many requests. Try again soon.",
      };
    }
    case "temporarily_unavailable":
      return { title: "Temporarily unavailable", description: "Please retry in a moment." };
    case "internal_error":
      return { title: "Server error", description: "Please try again shortly." };
    default:
      return {
        title: "Request failed",
        description: `Error: ${error}`,
      };
  }
}
