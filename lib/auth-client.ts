import { API_HOST } from "@/lib/api-host";

/* ── Types ── */

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  email_verified_at: string | null;
  is_active: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

export type AuthUserPartial = Pick<AuthUser, "id" | "username" | "email">;

export type AuthSessionInfo = {
  session_family_id: string;
  access_expires_at: string;
  refresh_expires_at: string;
};

export type SignUpData = { ok: true; action: "sign_up"; accepted: true };
export type VerifyEmailData = { ok: true; action: "verify_email"; verified: true; user: AuthUserPartial };
export type SignInData = { ok: true; action: "sign_in"; authenticated: true; user: AuthUser; session: AuthSessionInfo };
export type SessionData = { ok: true; authenticated: true; user: AuthUser; session: AuthSessionInfo };
export type CsrfData = { ok: true; csrf_token: string };
export type RefreshData = { ok: true; action: "refresh"; refreshed: true; session: AuthSessionInfo };
export type SignOutData = { ok: true; action: "sign_out"; signed_out: true };
export type SignOutAllData = { ok: true; action: "sign_out_all"; signed_out_all: true; sessions_revoked: number };
export type ForgotPasswordData = { ok: true; action: "forgot_password"; accepted: true; recovery: { ttl_minutes: number } };
export type ResetPasswordData = { ok: true; action: "reset_password"; updated: true; reauth_required: true; sessions_revoked: number; user: AuthUserPartial };

export type AuthResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  field: string | null;
  hint: string | null;
  reason: string | null;
  where: string | null;
  retryAfterSeconds: number | null;
};

/* ── Helpers ── */

function readString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function readNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v >= 0) return Math.floor(v);
  return null;
}

function parseRetryAfterHeader(value: string | null): number | null {
  if (!value) return null;
  const secs = Number.parseInt(value.trim(), 10);
  if (Number.isFinite(secs) && secs >= 0) return secs;
  const when = Date.parse(value);
  if (!Number.isNaN(when)) return Math.max(0, Math.ceil((when - Date.now()) / 1000));
  return null;
}

/* ── Core fetch ── */

async function authRequest<T>(
  path: string,
  opts: { method?: string; body?: unknown; csrfToken?: string } = {},
): Promise<AuthResult<T>> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.csrfToken) headers["X-CSRF-Token"] = opts.csrfToken;

  const res = await fetch(`${API_HOST}${path}`, {
    method: opts.method ?? "GET",
    credentials: "include",
    cache: "no-store",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* global rate-limit returns plain text */
  }

  const headerRetry = parseRetryAfterHeader(res.headers.get("retry-after"));

  if (res.ok && data) {
    return {
      ok: true,
      status: res.status,
      data: data as T,
      error: null,
      field: null,
      hint: null,
      reason: null,
      where: null,
      retryAfterSeconds: null,
    };
  }

  return {
    ok: false,
    status: res.status,
    data: null,
    error: data ? readString(data.error) : (res.status === 429 ? "rate_limited" : "unknown_error"),
    field: data ? readString(data.field) : null,
    hint: data ? readString(data.hint) : null,
    reason: data ? readString(data.reason) : null,
    where: data ? readString(data.where) : null,
    retryAfterSeconds: (data ? readNumber(data.retry_after_seconds) : null) ?? headerRetry,
  };
}

/* ── CSRF ── */

let csrfCache: { token: string; at: number } | null = null;

export async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && csrfCache && Date.now() - csrfCache.at < 4 * 60 * 1000) {
    return csrfCache.token;
  }
  const result = await authRequest<CsrfData>("/api/auth/csrf");
  if (!result.ok || !result.data?.csrf_token) {
    throw new Error(result.error ?? "csrf_fetch_failed");
  }
  csrfCache = { token: result.data.csrf_token, at: Date.now() };
  return csrfCache.token;
}

export function clearCsrfCache() {
  csrfCache = null;
}

async function withCsrfRetry<T>(
  fn: (csrfToken: string) => Promise<AuthResult<T>>,
): Promise<AuthResult<T>> {
  const token = await getCsrfToken();
  const result = await fn(token);
  if (result.status === 403 && (result.error === "csrf_required" || result.error === "invalid_csrf_token")) {
    const fresh = await getCsrfToken(true);
    return fn(fresh);
  }
  return result;
}

/* ── Endpoints ── */

export async function authSignUp(params: { email: string; username: string; password: string }) {
  return authRequest<SignUpData>("/api/auth/sign-up", { method: "POST", body: params });
}

export async function authVerifyEmail(params: { token: string }) {
  return authRequest<VerifyEmailData>("/api/auth/verify-email", { method: "POST", body: params });
}

export async function authSignIn(params: { identifier: string; password: string }) {
  return authRequest<SignInData>("/api/auth/sign-in", { method: "POST", body: params });
}

export async function authGetSession() {
  return authRequest<SessionData>("/api/auth/session");
}

export async function authRefresh() {
  return withCsrfRetry<RefreshData>((csrf) =>
    authRequest("/api/auth/refresh", { method: "POST", csrfToken: csrf }),
  );
}

export async function authSignOut() {
  let csrfToken: string | undefined;
  try {
    csrfToken = await getCsrfToken();
  } catch {
    /* no session — proceed without CSRF */
  }
  const result = await authRequest<SignOutData>("/api/auth/sign-out", {
    method: "POST",
    csrfToken,
  });
  if (csrfToken && result.status === 403 && (result.error === "csrf_required" || result.error === "invalid_csrf_token")) {
    try {
      const fresh = await getCsrfToken(true);
      const retry = await authRequest<SignOutData>("/api/auth/sign-out", { method: "POST", csrfToken: fresh });
      clearCsrfCache();
      return retry;
    } catch {
      /* fall through */
    }
  }
  clearCsrfCache();
  return result;
}

export async function authSignOutAll() {
  const result = await withCsrfRetry<SignOutAllData>((csrf) =>
    authRequest("/api/auth/sign-out-all", { method: "POST", csrfToken: csrf }),
  );
  clearCsrfCache();
  return result;
}

export async function authForgotPassword(params: { email: string }) {
  return authRequest<ForgotPasswordData>("/api/auth/forgot-password", { method: "POST", body: params });
}

export async function authResetPassword(params: { token: string; new_password: string }) {
  return authRequest<ResetPasswordData>("/api/auth/reset-password", { method: "POST", body: params });
}

/* ── Error display ── */

export function describeAuthError(result: AuthResult<unknown>, fallback: string): string {
  if (result.status === 429 || result.error === "rate_limited") {
    const r = result.retryAfterSeconds;
    const hint = r ? (r < 60 ? `Try again in ${r}s.` : `Try again in ${Math.ceil(r / 60)}min.`) : "Try again in a moment.";
    return `Rate limit reached. ${hint}`;
  }
  if (result.error === "invalid_params") {
    const parts = [fallback];
    if (result.field) parts.push(`Field: ${result.field}.`);
    if (result.hint) parts.push(result.hint);
    return parts.join(" ");
  }
  if (result.error === "auth_failed") return "Invalid credentials.";
  if (result.error === "invalid_or_expired_session") return "Session expired.";
  if (result.error === "invalid_token" || result.error === "invalid_or_expired") return "Token is invalid or expired.";
  if (result.error === "temporarily_unavailable") return "Service temporarily unavailable. Please try again.";
  if (result.error === "internal_error") return "An internal error occurred. Please try again.";
  if (result.reason) return result.reason.replace(/_/g, " ");
  if (result.error) return `${fallback} (${result.error})`;
  return fallback;
}

export function isRateLimited(result: AuthResult<unknown>): boolean {
  return result.status === 429 || result.error === "rate_limited";
}
