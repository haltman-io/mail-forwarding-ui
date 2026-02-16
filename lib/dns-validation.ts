import { API_HOST } from "@/lib/api-host";

export type DnsStatus = "PENDING" | "ACTIVE" | "EXPIRED" | "FAILED";
export type DnsOverallStatus = DnsStatus | "MIXED";

export type DnsRequestResponse = {
  id: number;
  target: string;
  type: "UI" | "EMAIL";
  status: DnsStatus;
  expires_at: string;
};

export type UiMissing = {
  key: "CNAME";
  type: string;
  name: string;
  expected: string;
  found: string[];
  ok: boolean;
  found_truncated: boolean;
};

export type EmailMissing =
  | {
      key: "MX";
      type: string;
      name: string;
      expected: { host: string; priority: number };
      found: { exchange: string; priority: number }[];
      ok: boolean;
      found_truncated: boolean;
    }
  | {
      key: "SPF";
      type: string;
      name: string;
      expected: string;
      found: string[];
      ok: boolean;
      found_truncated: boolean;
    }
  | {
      key: "DMARC";
      type: string;
      name: string;
      expected: string;
      found: string[];
      ok: boolean;
      found_truncated: boolean;
    };

export type UiCheck = {
  status: DnsStatus;
  id: number;
  created_at?: string;
  expires_at?: string;
  last_checked_at?: string;
  next_check_at?: string;
  missing?: UiMissing[];
};

export type EmailCheck = {
  status: DnsStatus;
  id: number;
  created_at?: string;
  expires_at?: string;
  last_checked_at?: string;
  next_check_at?: string;
  missing?: EmailMissing[];
};

export type CheckDnsSummary = {
  has_ui: boolean;
  has_email: boolean;
  overall_status: DnsOverallStatus;
  expires_at_min?: string;
  last_checked_at_max?: string;
  next_check_at_min?: string;
};

export type CheckDnsResponse = {
  target: string;
  normalized_target: string;
  summary: CheckDnsSummary;
  ui: UiCheck | null;
  email: EmailCheck | null;
};

export type DnsValidationError = Error & { status?: number; payload?: unknown };

type FetchJsonOptions = RequestInit & { signal?: AbortSignal };

type ErrorPayload = {
  error?: unknown;
  message?: unknown;
  detail?: unknown;
};

const JSON_HEADERS = { "Content-Type": "application/json" };

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function errorMessageFromPayload(payload: ErrorPayload | null, fallback: string) {
  if (!payload) return fallback;
  if (typeof payload.message === "string" && payload.message.trim()) return payload.message;
  if (typeof payload.error === "string" && payload.error.trim()) return payload.error;
  if (typeof payload.detail === "string" && payload.detail.trim()) return payload.detail;
  return fallback;
}

async function fetchJson<T>(url: string, options: FetchJsonOptions): Promise<T> {
  const res = await fetch(url, options);
  const data = (await parseJsonSafe(res)) as T | ErrorPayload | null;

  if (!res.ok) {
    const message = errorMessageFromPayload(
      (data as ErrorPayload | null) ?? null,
      `Request failed (${res.status})`
    );
    const err = new Error(message) as DnsValidationError;
    err.status = res.status;
    err.payload = data ?? undefined;
    throw err;
  }

  return data as T;
}

export function requestUi(target: string, signal?: AbortSignal) {
  return fetchJson<DnsRequestResponse>(`${API_HOST}/request/ui`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ target }),
    signal,
  });
}

export function requestEmail(target: string, signal?: AbortSignal) {
  return fetchJson<DnsRequestResponse>(`${API_HOST}/request/email`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ target }),
    signal,
  });
}

export function checkDns(target: string, token?: string, signal?: AbortSignal) {
  const headers: Record<string, string> = {};
  if (token) headers["x-api-key"] = token;

  return fetchJson<CheckDnsResponse>(
    `${API_HOST}/api/checkdns/${encodeURIComponent(target)}`,
    {
      method: "GET",
      headers,
      signal,
    }
  );
}
