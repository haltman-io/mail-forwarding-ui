import { API_HOST } from "@/lib/api-host";

export type CredentialConfirmation = {
  sent?: boolean;
  ttl_minutes?: number;
  status?: string;
  expires_at?: string | null;
  last_sent_at?: string | null;
  next_allowed_send_at?: string | null;
  send_count?: number;
  remaining_attempts?: number;
  reason?: "cooldown" | "rate_limited" | string;
};

export type ApiCredentialItem = {
  id: number;
  owner_email: string;
  status?: string;
  created_at?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
  last_used_at?: string | null;
  automatic_renew?: number | boolean;
  active?: number | boolean;
};

export type CredentialResponse = {
  ok?: boolean;
  action?: string;
  email?: string;
  days?: number;
  automatic_renew?: number | boolean;
  confirmation?: CredentialConfirmation;
  confirmed?: boolean;
  token?: string;
  token_type?: string;
  expires_in_days?: number;
  items?: ApiCredentialItem[];
  item?: Partial<ApiCredentialItem>;
  renewed?: boolean;
  updated?: boolean;
  destroyed?: boolean;
  deleted_count?: number;
  notification_sent?: boolean;
  days_added?: number;
  error?: string;
  reason?: string;
  field?: string;
  domain?: string;
  hint?: string;
};

export type CredentialRequestResult<T = CredentialResponse> = {
  ok: boolean;
  status: number;
  data: T | null;
  errorCode: string | null;
  errorReason: string | null;
  errorField: string | null;
  errorDomain: string | null;
  errorHint: string | null;
};

const API_KEY_RE = /^[0-9a-f]{64}$/;

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function parseJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function postCredential<T = CredentialResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<CredentialRequestResult<T>> {
  const res = await fetch(`${API_HOST}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJson<T>(res);
  const record = data && typeof data === "object" ? data as Record<string, unknown> : null;

  return {
    ok: res.ok && record?.ok !== false,
    status: res.status,
    data,
    errorCode: readString(record?.error),
    errorReason: readString(record?.reason),
    errorField: readString(record?.field),
    errorDomain: readString(record?.domain),
    errorHint: readString(record?.hint),
  };
}

export function normalizeApiKey(value: string) {
  return value.trim().toLowerCase();
}

export function isValidApiKey(value: string) {
  return API_KEY_RE.test(normalizeApiKey(value));
}

export function normalizeConfirmationToken(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function boolFromApi(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
  }
  return false;
}

export function describeCredentialError(
  result: Pick<
    CredentialRequestResult,
    "errorCode" | "errorReason" | "errorField" | "errorDomain" | "errorHint" | "status"
  >,
  fallback: string,
) {
  const code = result.errorCode;

  if (code === "managed_domain_not_allowed") {
    return result.errorDomain
      ? `Use an external owner e-mail address. ${result.errorDomain} is a managed forwarding domain.`
      : "Use an external owner e-mail address. Managed forwarding domains are not accepted.";
  }

  if (code === "invalid_params") {
    return result.errorField ? `Invalid value for ${result.errorField}.` : "Invalid request parameters.";
  }

  if (code === "invalid_token") return "Invalid confirmation code.";
  if (code === "invalid_or_expired") return "The confirmation code is invalid or expired.";
  if (code === "no_api_keys") return "No active API keys were found for this e-mail.";
  if (code === "rate_limited") return "Too many requests. Try again later.";
  if (code === "forbidden") return "This action is not allowed.";
  if (code) return `${fallback} (${code})`;
  if (result.errorReason) return `${fallback} (${result.errorReason})`;
  if (result.errorHint) return `${fallback} ${result.errorHint}`;
  if (result.status >= 500) return "Server error. Try again later.";
  return fallback;
}

export function requestCreateCredential(body: {
  email: string;
  days: number;
  automatic_renew: boolean;
}) {
  return postCredential("/api/credentials/create", body);
}

export function requestCredentialList(email: string) {
  return postCredential("/api/credentials/list/request", { email });
}

export function requestCredentialRenew(body: { api_key: string; days: number }) {
  return postCredential("/api/credentials/renew", body);
}

export function requestCredentialAutomaticRenew(body: {
  api_key: string;
  automatic_renew: boolean;
}) {
  return postCredential("/api/credentials/automatic-renew", body);
}

export function requestCredentialDestroy(apiKey: string) {
  return postCredential("/api/credentials/destroy", { api_key: apiKey });
}

export function requestCredentialDestroyAll(email: string) {
  return postCredential("/api/credentials/destroy-all/request", { email });
}

export function confirmCredentialAction(token: string) {
  return postCredential("/api/credentials/confirm", { token });
}
