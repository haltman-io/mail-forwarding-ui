import { API_HOST } from "@/lib/api-host";
import { clampLower } from "@/lib/utils-mail";

import type {
  ApiErrorInfo,
  ParsedCustomAddress,
  RequestState,
  StatusKind,
} from "@/features/alias-console/types/alias-console.types";

const RE_SAFE_DOMAIN =
  /^(?=.{1,253}$)(?!.*\.\.)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

const RE_IPV4 = /^\d+\.\d+\.\d+\.\d+$/;

export function parseUrlDomainParam(): string | null {
  if (typeof window === "undefined") return null;

  const raw = new URLSearchParams(window.location.search).get("domain");
  if (!raw) return null;

  const value = raw.trim().toLowerCase();
  if (!value) return null;

  if (value.includes(":")) return null;
  if (RE_IPV4.test(value)) return null;
  if (!RE_SAFE_DOMAIN.test(value)) return null;

  return value;
}

export const clickableIconClass =
  "opacity-70 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none";

export const staticIconClass = "cursor-default";

export const codeBlockClass =
  "overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[var(--text-secondary)] tracking-[0.01em] tabular-nums";

export const DOMAINS_URL = `${API_HOST}/api/domains`;

export function sanitizeOtpToken(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function parseCustomAddress(value: string): ParsedCustomAddress {
  const trimmed = value.trim();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex === -1) return { local: trimmed, domain: "" };
  return { local: trimmed.slice(0, atIndex), domain: trimmed.slice(atIndex + 1) };
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

export function buildSubscribeCurl(args: {
  to: string;
  isCustomAddress: boolean;
  customAddress: string;
  name: string;
  domain: string;
  host: string;
}) {
  const target = args.to.trim() || "{your_mail}";
  const url = curlBaseUrl(args.host, "/api/forward/subscribe");

  if (args.isCustomAddress) {
    const address = clampLower(args.customAddress.trim()) || "{alias_email}";
    return formatCurlLines(url, { address, to: target });
  }

  const handle = clampLower(args.name) || "{alias_handle}";
  const aliasDomain = clampLower(args.domain) || "{alias_domain}";
  return formatCurlLines(url, { name: handle, domain: aliasDomain, to: target });
}

export function buildUnsubscribeCurl(alias: string, host: string) {
  const normalizedAlias = clampLower(alias) || "{alias_email}";
  const url = curlBaseUrl(host, "/api/forward/unsubscribe");
  return formatCurlLines(url, { alias: normalizedAlias });
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
    case "invalid_domain": {
      const domain = toText(payload.domain);
      const hint = toText(payload.hint);
      return {
        title: "Invalid domain",
        description: domain ? `Domain: ${domain}` : hint ?? "Domain is not active.",
      };
    }
    case "banned": {
      const ban = toRecord(payload.ban);
      const banType = toText(ban.ban_type);
      const banValue = toText(ban.ban_value);
      const banReason = toText(ban.reason);
      if (banType && banValue) {
        const reason = banReason ? ` (${banReason})` : "";
        return {
          title: "Request blocked",
          description: `Banned ${banType}: ${banValue}${reason}`,
        };
      }
      const typeValue = toText(payload.type);
      const valueValue = toText(payload.value);
      const type = typeValue ? `Banned ${typeValue}` : "Request blocked";
      const value = valueValue ? `: ${valueValue}` : "";
      return { title: "Request blocked", description: `${type}${value}`.trim() };
    }
    case "alias_taken": {
      const address = toText(payload.address);
      return {
        title: "Alias already exists",
        description: address ? `Alias: ${address}` : "Choose a different alias and try again.",
      };
    }
    case "alias_not_found": {
      const alias = toText(payload.alias);
      const address = toText(payload.address);
      return {
        title: "Alias not found",
        description: alias || address ? `Alias: ${alias ?? address}` : "Alias not found.",
      };
    }
    case "alias_inactive": {
      const alias = toText(payload.alias);
      return {
        title: "Alias inactive",
        description: alias ? `Alias: ${alias}` : "Alias is inactive.",
      };
    }
    case "alias_owner_changed": {
      const address = toText(payload.address);
      return {
        title: "Alias ownership changed",
        description: address ? `Alias: ${address}` : "Alias owner changed since the request.",
      };
    }
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
    case "unsupported_intent": {
      const intent = toText(payload.intent);
      return {
        title: "Unsupported intent",
        description: intent ? `Intent: ${intent}` : "This confirmation request is invalid.",
      };
    }
    case "rate_limited":
      {
        const reason = toText(payload.reason);
        const where = toText(payload.where);
        return {
          title: "Rate limited",
          description: reason ? `${where ? `${where}: ` : ""}${reason}` : "Too many requests. Try again soon.",
        };
      }
    case "server_misconfigured": {
      const field = toText(payload.field);
      return {
        title: "Server misconfigured",
        description: field ? `Missing ${field}.` : "Server configuration error.",
      };
    }
    case "unsupported_media_type":
      return { title: "Unsupported media type", description: "Please send JSON only." };
    case "temporarily_unavailable":
      return { title: "Temporarily unavailable", description: "Please retry in a moment." };
    case "confirmation_payload_missing":
      return { title: "Confirmation failed", description: "Confirmation payload is missing." };
    case "invalid_goto_on_alias":
      return { title: "Alias corrupted", description: "Alias destination could not be parsed." };
    case "internal_error":
      return { title: "Server error", description: "Please try again shortly." };
    default:
      return {
        title: "Request failed",
        description: `Error: ${error}`,
      };
  }
}
