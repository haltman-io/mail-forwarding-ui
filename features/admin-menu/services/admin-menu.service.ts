import { API_HOST } from "@/lib/api-host";
import { fetchDomains, normalizeDomains } from "@/lib/domains";

import type { RequestErrorDescription, RequestResult } from "@/features/admin-menu/types/admin-menu.types";

const DOMAINS_URL = `${API_HOST}/domains`;

let adminDomainsCache: string[] | null = null;
let adminDomainsPromise: Promise<string[]> | null = null;

export function getAdminDomainsCacheSnapshot() {
  return adminDomainsCache ?? [];
}

export async function getAdminDomainsCached() {
  if (adminDomainsCache) return adminDomainsCache;
  if (adminDomainsPromise) return adminDomainsPromise;

  adminDomainsPromise = (async () => {
    try {
      const list = await fetchDomains(DOMAINS_URL);
      const fallbackRaw = process.env.NEXT_PUBLIC_DOMAINS ?? "";
      const fallback = normalizeDomains(fallbackRaw.split(","));
      const finalList = list.length ? list : fallback;
      adminDomainsCache = finalList;
      return finalList;
    } catch {
      const fallbackRaw = process.env.NEXT_PUBLIC_DOMAINS ?? "";
      const fallback = normalizeDomains(fallbackRaw.split(","));
      adminDomainsCache = fallback;
      return fallback;
    } finally {
      adminDomainsPromise = null;
    }
  })();

  return adminDomainsPromise;
}

export async function parseResponseBody<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function readStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readRetryAfterBodyValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return null;
}

export function parseRetryAfterHeader(value: string | null): number | null {
  if (!value) return null;

  const seconds = Number.parseInt(value.trim(), 10);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds;
  }

  const when = Date.parse(value);
  if (!Number.isNaN(when)) {
    return Math.max(0, Math.ceil((when - Date.now()) / 1000));
  }

  return null;
}

export function extractApiErrorDetails(data: unknown) {
  if (!data || typeof data !== "object") {
    return {
      errorCode: null,
      errorReason: null,
      errorWhere: null,
      errorHint: null,
      errorField: null,
      retryAfterSeconds: null,
    };
  }

  const record = data as Record<string, unknown>;
  const bodyRetryAfter =
    readRetryAfterBodyValue(record.retry_after_seconds) ??
    readRetryAfterBodyValue(record.retry_after) ??
    readRetryAfterBodyValue(record.retry_after_sec) ??
    readRetryAfterBodyValue(record.retry_in_seconds);

  return {
    errorCode: readStringValue(record.error),
    errorReason: readStringValue(record.reason),
    errorWhere: readStringValue(record.where),
    errorHint: readStringValue(record.hint),
    errorField: readStringValue(record.field),
    retryAfterSeconds: bodyRetryAfter,
  };
}

function humanizeErrorToken(value: string | null) {
  if (!value) return null;
  return value.replace(/_/g, " ").trim();
}

function formatRetryAfterHint(seconds: number | null) {
  if (seconds === null) return "Try again in a moment.";
  if (seconds <= 1) return "Try again in 1 second.";
  if (seconds < 60) return `Try again in ${seconds} seconds.`;
  if (seconds < 3600) return `Try again in ${Math.ceil(seconds / 60)} minutes.`;
  return `Try again in ${Math.ceil(seconds / 3600)} hours.`;
}

function describeLoginRateLimitReason(reason: string | null) {
  switch (reason) {
    case "too_many_failed_attempts_email_ip":
      return "Too many failed login attempts for this email + IP.";
    case "too_many_failed_attempts_email_ip_heavy":
      return "Too many failed login attempts for this email + IP (heavy lock).";
    case "too_many_failed_attempts_email":
      return "Too many failed login attempts for this email.";
    case "too_many_failed_attempts_ip":
      return "Too many failed login attempts for this IP.";
    default: {
      const readable = humanizeErrorToken(reason);
      return readable ? `Rate limit triggered (${readable}).` : "Rate limit triggered.";
    }
  }
}

export function describeRequestError(
  result: Pick<RequestResult<unknown>, "status" | "errorCode" | "errorReason" | "errorWhere" | "errorHint" | "errorField" | "retryAfterSeconds">,
  fallbackMessage: string,
  mode: "login" | "admin" = "admin"
): RequestErrorDescription {
  const code = result.errorCode;
  const reason = result.errorReason;
  const where = result.errorWhere;
  const hint = result.errorHint;
  const field = result.errorField;
  const isRateLimited = result.status === 429 || code === "rate_limited";

  if (isRateLimited) {
    const scope = where ? ` Scope: ${where}.` : "";
    if (mode === "login") {
      return {
        isRateLimited: true,
        isLockoutGuard: false,
        message: `${describeLoginRateLimitReason(reason)}${scope} ${formatRetryAfterHint(result.retryAfterSeconds)}`.trim(),
      };
    }

    const reasonText = humanizeErrorToken(reason);
    const reasonLine = reasonText ? ` Reason: ${reasonText}.` : "";
    return {
      isRateLimited: true,
      isLockoutGuard: false,
      message: `Admin rate limit reached.${scope}${reasonLine} ${formatRetryAfterHint(result.retryAfterSeconds)}`.trim(),
    };
  }

  if (code === "cannot_disable_last_admin") {
    return {
      isRateLimited: false,
      isLockoutGuard: true,
      message: "Lockout protection is active. You cannot disable or remove the last active admin user.",
    };
  }

  if (code === "invalid_params") {
    const parts = ["Invalid parameters."];
    if (field) parts.push(`Field: ${field}.`);
    if (reason) parts.push(`Reason: ${humanizeErrorToken(reason) ?? reason}.`);
    if (hint) parts.push(`Hint: ${hint}.`);
    return { isRateLimited: false, isLockoutGuard: false, message: parts.join(" ") };
  }

  if (code) {
    const parts = [`${fallbackMessage} (${code}).`];
    if (reason) parts.push(`Reason: ${humanizeErrorToken(reason) ?? reason}.`);
    if (hint) parts.push(`Hint: ${hint}.`);
    if (field) parts.push(`Field: ${field}.`);
    return { isRateLimited: false, isLockoutGuard: false, message: parts.join(" ") };
  }

  if (reason) {
    return {
      isRateLimited: false,
      isLockoutGuard: false,
      message: `${fallbackMessage} (${humanizeErrorToken(reason) ?? reason}).`,
    };
  }

  return { isRateLimited: false, isLockoutGuard: false, message: fallbackMessage };
}

export async function adminRequest<T>({
  token,
  path,
  method = "GET",
  body,
}: {
  token: string;
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}): Promise<RequestResult<T>> {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_HOST}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await parseResponseBody<T>(response);
  const errorDetails = extractApiErrorDetails(data);
  const headerRetryAfter = parseRetryAfterHeader(response.headers.get("retry-after"));
  const retryAfterSeconds = errorDetails.retryAfterSeconds ?? headerRetryAfter;

  return {
    ok: response.ok,
    status: response.status,
    data,
    errorCode: errorDetails.errorCode,
    errorReason: errorDetails.errorReason,
    errorWhere: errorDetails.errorWhere,
    errorHint: errorDetails.errorHint,
    errorField: errorDetails.errorField,
    retryAfterSeconds,
  };
}

export function isUnauthorized(result: RequestResult<unknown>) {
  if (result.status === 401) return true;
  return result.errorCode === "missing_admin_token" || result.errorCode === "invalid_or_expired_admin_token";
}
