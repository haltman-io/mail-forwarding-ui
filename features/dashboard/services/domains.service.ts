import { API_HOST } from "@/lib/api-host";
import type {
  RequestResult,
  CreateUpdateResponse,
  ListResponse,
  AdminDomain,
} from "@/features/dashboard/types/domains.types";

async function parseBody<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function readString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function readRetryAfter(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v >= 0) return Math.floor(v);
  if (typeof v === "string" && v.trim()) {
    const n = Number.parseInt(v.trim(), 10);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
}

function extractErrorDetails(data: unknown) {
  if (!data || typeof data !== "object") {
    return { errorCode: null, errorReason: null, errorWhere: null, errorHint: null, errorField: null, retryAfterSeconds: null };
  }
  const r = data as Record<string, unknown>;
  return {
    errorCode: readString(r.error),
    errorReason: readString(r.reason),
    errorWhere: readString(r.where),
    errorHint: readString(r.hint),
    errorField: readString(r.field),
    retryAfterSeconds: readRetryAfter(r.retry_after_seconds) ?? readRetryAfter(r.retry_after),
  };
}

function parseRetryAfterHeader(value: string | null): number | null {
  if (!value) return null;
  const secs = Number.parseInt(value.trim(), 10);
  if (Number.isFinite(secs) && secs >= 0) return secs;
  const when = Date.parse(value);
  if (!Number.isNaN(when)) return Math.max(0, Math.ceil((when - Date.now()) / 1000));
  return null;
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
  if (body !== undefined) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_HOST}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await parseBody<T>(res);
  const err = extractErrorDetails(data);
  const headerRetry = parseRetryAfterHeader(res.headers.get("retry-after"));

  return {
    ok: res.ok,
    status: res.status,
    data,
    errorCode: err.errorCode,
    errorReason: err.errorReason,
    errorWhere: err.errorWhere,
    errorHint: err.errorHint,
    errorField: err.errorField,
    retryAfterSeconds: err.retryAfterSeconds ?? headerRetry,
  };
}

export function isUnauthorized(result: RequestResult<unknown>) {
  if (result.status === 401) return true;
  return result.errorCode === "missing_admin_token" || result.errorCode === "invalid_or_expired_admin_token";
}

export function describeError(
  result: Pick<RequestResult<unknown>, "status" | "errorCode" | "errorReason" | "errorWhere" | "errorHint" | "errorField" | "retryAfterSeconds">,
  fallback: string,
) {
  const code = result.errorCode;
  const reason = result.errorReason;
  const isRateLimited = result.status === 429 || code === "rate_limited";

  if (isRateLimited) {
    const retryHint = result.retryAfterSeconds
      ? result.retryAfterSeconds < 60
        ? `Try again in ${result.retryAfterSeconds}s.`
        : `Try again in ${Math.ceil(result.retryAfterSeconds / 60)}min.`
      : "Try again in a moment.";
    return { isRateLimited: true, message: `Rate limit reached. ${retryHint}` };
  }

  if (code === "invalid_params") {
    const parts = ["Invalid parameters."];
    if (result.errorField) parts.push(`Field: ${result.errorField}.`);
    if (reason) parts.push(reason);
    return { isRateLimited: false, message: parts.join(" ") };
  }

  if (code) return { isRateLimited: false, message: `${fallback} (${code})` };
  if (reason) return { isRateLimited: false, message: `${fallback} (${reason})` };
  return { isRateLimited: false, message: fallback };
}

/* ── domain CRUD ── */

export async function fetchDomains(
  token: string,
  params: { limit: number; offset: number; active?: string },
) {
  const qs = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.active && params.active !== "all") qs.set("active", params.active);

  return adminRequest<ListResponse<AdminDomain>>({
    token,
    path: `/admin/domains?${qs.toString()}`,
  });
}

export async function createDomain(
  token: string,
  body: { name: string; active: number },
) {
  return adminRequest<CreateUpdateResponse<AdminDomain>>({
    token,
    path: "/admin/domains",
    method: "POST",
    body,
  });
}

export async function updateDomain(
  token: string,
  id: number,
  body: { name: string; active: number },
) {
  return adminRequest<CreateUpdateResponse<AdminDomain>>({
    token,
    path: `/admin/domains/${id}`,
    method: "PATCH",
    body,
  });
}

export async function deleteDomain(token: string, id: number) {
  return adminRequest<CreateUpdateResponse<unknown>>({
    token,
    path: `/admin/domains/${id}`,
    method: "DELETE",
  });
}
