"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { API_HOST } from "@/lib/api-host";

/* ── types ── */

export type AuthUser = {
  id: number;
  email: string;
  is_admin: boolean;
  is_active: number | boolean;
  created_at?: string | null;
  updated_at?: string | null;
  last_login_at?: string | null;
};

export type AuthSession = {
  token: string;
  tokenType: string;
  expiresAt: string | null;
  user: AuthUser;
  savedAt: string;
};

export type AuthStatus = "checking" | "unauthenticated" | "authenticated";

type AuthMeResponse = {
  ok?: boolean;
  authenticated?: boolean;
  user?: AuthUser;
  auth?: { token_type?: string; expires_at?: string; session_id?: number };
};

type LoginResponse = {
  ok?: boolean;
  error?: string;
  reason?: string;
  where?: string;
  hint?: string;
  retry_after_seconds?: number;
  retry_after?: number;
  user?: AuthUser;
  auth?: { token?: string; token_type?: string; expires_at?: string };
};

type RegisterResponse = {
  ok?: boolean;
  created?: boolean;
  user?: { id: number; email: string; is_active: number; is_admin: boolean };
  error?: string;
  reason?: string;
  field?: string;
};

type ForgotPasswordResponse = {
  ok?: boolean;
  action?: string;
  accepted?: boolean;
  recovery?: { ttl_minutes?: number };
  error?: string;
  reason?: string;
};

type ResetPasswordResponse = {
  ok?: boolean;
  action?: string;
  updated?: boolean;
  reauth_required?: boolean;
  sessions_revoked?: number;
  user?: { id: number; email: string };
  error?: string;
  reason?: string;
  field?: string;
};

/* ── storage ── */

const AUTH_STORAGE_KEY = "haltman.auth.session.v1";

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (typeof parsed.token !== "string" || !parsed.token) return null;
    if (!parsed.user || typeof parsed.user.email !== "string") return null;
    return {
      token: parsed.token,
      tokenType:
        typeof parsed.tokenType === "string" && parsed.tokenType
          ? parsed.tokenType
          : "bearer",
      expiresAt:
        typeof parsed.expiresAt === "string" ? parsed.expiresAt : null,
      user: parsed.user,
      savedAt:
        typeof parsed.savedAt === "string"
          ? parsed.savedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearSessionStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  // also clear legacy admin session
  window.sessionStorage.removeItem("haltman.admin.session.v1");
}

async function parseBody<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function describeRetryAfter(data: { retry_after_seconds?: number; retry_after?: number } | null): string {
  const retryAfter = data?.retry_after_seconds ?? data?.retry_after;
  return retryAfter
    ? `Try again in ${retryAfter} seconds.`
    : "Try again in a moment.";
}

/* ── context ── */

type AuthContextValue = {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  session: AuthSession | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ ok: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  logout: (reason?: string) => void;
  refresh: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

/* ── provider ── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthStatus>("checking");
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [user, setUser] = React.useState<AuthUser | null>(null);

  const toastOk = React.useCallback((title: string, desc?: string) => {
    toast.success(title, {
      description: desc,
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    });
  }, []);

  const toastFail = React.useCallback((title: string, desc?: string) => {
    toast.error(title, {
      description: desc,
      icon: <AlertTriangle className="h-4 w-4 text-rose-400" />,
    });
  }, []);

  /* Verify a token against GET /auth/me */
  const verifyToken = React.useCallback(
    async (
      token: string,
    ): Promise<
      | { ok: true; user: AuthUser; session: AuthSession }
      | { ok: false; reason: string }
    > => {
      try {
        const response = await fetch(`${API_HOST}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await parseBody<AuthMeResponse>(response);

        if (response.status === 401) {
          return { ok: false, reason: "invalid_or_expired_token" };
        }

        const valid =
          response.ok &&
          data?.ok === true &&
          data?.authenticated === true &&
          typeof data?.user?.email === "string";

        if (!valid) {
          return {
            ok: false,
            reason:
              (data as Record<string, unknown>)?.error?.toString() ??
              "invalid_session",
          };
        }

        const userData = data!.user as AuthUser;
        const nextSession: AuthSession = {
          token,
          tokenType:
            typeof data?.auth?.token_type === "string" && data.auth.token_type
              ? data.auth.token_type
              : "bearer",
          expiresAt:
            typeof data?.auth?.expires_at === "string"
              ? data.auth.expires_at
              : null,
          user: userData,
          savedAt: new Date().toISOString(),
        };

        return { ok: true, user: userData, session: nextSession };
      } catch (err) {
        return {
          ok: false,
          reason: err instanceof Error ? err.message : "Network error",
        };
      }
    },
    [],
  );

  /* Force logout */
  const logout = React.useCallback(
    (reason?: string) => {
      clearSessionStorage();
      setSession(null);
      setUser(null);
      setStatus("unauthenticated");
      if (reason) {
        toastOk("Session ended", reason);
      }
    },
    [toastOk],
  );

  /* Refresh session (re-verify current token) */
  const refresh = React.useCallback(async () => {
    if (!session?.token) return;
    const result = await verifyToken(session.token);
    if (!result.ok) {
      clearSessionStorage();
      setSession(null);
      setUser(null);
      setStatus("unauthenticated");
      toastFail("Session expired", "Please login again.");
      return;
    }
    setUser(result.user);
    setSession(result.session);
    saveSession(result.session);
  }, [session, toastFail, verifyToken]);

  /* Login */
  const login = React.useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ ok: boolean; error?: string }> => {
      try {
        const response = await fetch(`${API_HOST}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await parseBody<LoginResponse>(response);
        const authToken = data?.auth?.token;
        const success =
          response.ok &&
          data?.ok === true &&
          typeof authToken === "string" &&
          authToken.length > 0;

        if (!success) {
          const code = data?.error ?? "";
          if (response.status === 429 || code === "rate_limited") {
            const hint = describeRetryAfter(data);
            const reason = data?.reason ?? "";
            return {
              ok: false,
              error: reason
                ? `${reason.replace(/_/g, " ")}. ${hint}`
                : `Rate limited. ${hint}`,
            };
          }
          if (code === "invalid_credentials") {
            return { ok: false, error: "Invalid email or password." };
          }
          return {
            ok: false,
            error: data?.reason?.replace(/_/g, " ") ?? "Authentication failed.",
          };
        }

        const userData = data!.user as AuthUser;
        const nextSession: AuthSession = {
          token: authToken!,
          tokenType:
            typeof data?.auth?.token_type === "string" && data.auth.token_type
              ? data.auth.token_type
              : "bearer",
          expiresAt:
            typeof data?.auth?.expires_at === "string"
              ? data.auth.expires_at
              : null,
          user: userData,
          savedAt: new Date().toISOString(),
        };

        setSession(nextSession);
        setUser(userData);
        saveSession(nextSession);
        setStatus("authenticated");
        toastOk("Authenticated", userData.email);

        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "Network error",
        };
      }
    },
    [toastOk],
  );

  /* Register */
  const register = React.useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ ok: boolean; error?: string }> => {
      try {
        const response = await fetch(`${API_HOST}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await parseBody<RegisterResponse>(response);

        if (!response.ok || !data?.ok) {
          const code = data?.error ?? "";
          if (response.status === 409 || code === "user_taken") {
            return { ok: false, error: "This email is already in use." };
          }
          if (code === "invalid_params") {
            const parts = ["Invalid input."];
            if (data?.field) parts.push(`Field: ${data.field}.`);
            if (data?.reason) parts.push(data.reason);
            return { ok: false, error: parts.join(" ") };
          }
          return {
            ok: false,
            error: data?.reason?.replace(/_/g, " ") ?? "Registration failed.",
          };
        }

        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "Network error",
        };
      }
    },
    [],
  );

  /* Forgot password */
  const forgotPassword = React.useCallback(
    async (email: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const response = await fetch(`${API_HOST}/auth/password/forgot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await parseBody<ForgotPasswordResponse>(response);

        if (response.status === 429) {
          return { ok: false, error: `Rate limited. ${describeRetryAfter(data as Record<string, unknown>)}` };
        }

        if (!response.ok || !data?.ok) {
          const code = data?.error ?? "";
          if (code === "invalid_params") {
            return { ok: false, error: data?.reason ?? "Invalid email address." };
          }
          return { ok: false, error: data?.reason?.replace(/_/g, " ") ?? "Request failed." };
        }

        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "Network error",
        };
      }
    },
    [],
  );

  /* Reset password */
  const resetPassword = React.useCallback(
    async (
      code: string,
      newPassword: string,
    ): Promise<{ ok: boolean; error?: string }> => {
      try {
        const response = await fetch(`${API_HOST}/auth/password/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: code, new_password: newPassword }),
        });

        const data = await parseBody<ResetPasswordResponse>(response);

        if (!response.ok || !data?.ok) {
          const code = data?.error ?? "";
          if (code === "invalid_token" || code === "invalid_or_expired") {
            return { ok: false, error: "Invalid or expired recovery code." };
          }
          if (code === "invalid_params" && data?.field === "new_password") {
            return { ok: false, error: data?.reason ?? "Invalid password." };
          }
          if (response.status === 503) {
            return { ok: false, error: "Service temporarily unavailable. Please try again later." };
          }
          return {
            ok: false,
            error: data?.reason?.replace(/_/g, " ") ?? "Password reset failed.",
          };
        }

        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "Network error",
        };
      }
    },
    [],
  );

  /* On mount: try to restore session from localStorage */
  React.useEffect(() => {
    const stored = readStoredSession();
    if (!stored?.token) {
      setStatus("unauthenticated");
      return;
    }

    void (async () => {
      const result = await verifyToken(stored.token);
      if (!result.ok) {
        clearSessionStorage();
        setStatus("unauthenticated");
        return;
      }
      setSession(result.session);
      setUser(result.user);
      saveSession(result.session);
      setStatus("authenticated");
    })();
  }, [verifyToken]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      status,
      token: session?.token ?? null,
      user,
      session,
      login,
      register,
      forgotPassword,
      resetPassword,
      logout,
      refresh,
    }),
    [status, session, user, login, register, forgotPassword, resetPassword, logout, refresh],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
