"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { API_HOST } from "@/lib/api-host";

/* ── session storage ── */

const ADMIN_STORAGE_KEY = "haltman.admin.session.v1";

export type AdminSession = {
  token: string;
  tokenType: string;
  expiresAt: string | null;
  email: string | null;
  savedAt: string;
};

export type AuthStatus = "checking" | "unauthenticated" | "authenticated";

type AdminMe = {
  id?: number;
  email: string;
  is_active?: number | boolean;
};

type AdminMeResponse = {
  ok?: boolean;
  authenticated?: boolean;
  admin?: AdminMe;
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
  admin?: { email?: string };
  auth?: { token?: string; token_type?: string; expires_at?: string };
};

function readStoredSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    if (typeof parsed.token !== "string" || !parsed.token) return null;
    return {
      token: parsed.token,
      tokenType:
        typeof parsed.tokenType === "string" && parsed.tokenType
          ? parsed.tokenType
          : "bearer",
      expiresAt:
        typeof parsed.expiresAt === "string" ? parsed.expiresAt : null,
      email: typeof parsed.email === "string" ? parsed.email : null,
      savedAt:
        typeof parsed.savedAt === "string"
          ? parsed.savedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function saveSession(session: AdminSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
}

function clearSessionStorage() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ADMIN_STORAGE_KEY);
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

/* ── context ── */

type AdminAuthContextValue = {
  status: AuthStatus;
  token: string | null;
  admin: AdminMe | null;
  session: AdminSession | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: (reason?: string) => void;
  refresh: () => Promise<void>;
};

const AdminAuthContext = React.createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth() {
  const ctx = React.useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within <AdminAuthProvider>");
  }
  return ctx;
}

/* ── provider ── */

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthStatus>("checking");
  const [session, setSession] = React.useState<AdminSession | null>(null);
  const [admin, setAdmin] = React.useState<AdminMe | null>(null);

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

  /* Verify a token against GET /admin/me */
  const verifyToken = React.useCallback(
    async (
      token: string,
    ): Promise<
      | { ok: true; admin: AdminMe; session: AdminSession }
      | { ok: false; reason: string }
    > => {
      try {
        const response = await fetch(`${API_HOST}/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await parseBody<AdminMeResponse>(response);

        if (response.status === 401) {
          return { ok: false, reason: "invalid_or_expired_admin_token" };
        }

        const valid =
          response.ok &&
          data?.ok === true &&
          data?.authenticated === true &&
          typeof data?.admin?.email === "string";

        if (!valid) {
          return {
            ok: false,
            reason:
              (data as Record<string, unknown>)?.error?.toString() ??
              "invalid_admin_session",
          };
        }

        const adminData = data!.admin as AdminMe;
        const nextSession: AdminSession = {
          token,
          tokenType:
            typeof data?.auth?.token_type === "string" && data.auth.token_type
              ? data.auth.token_type
              : "bearer",
          expiresAt:
            typeof data?.auth?.expires_at === "string"
              ? data.auth.expires_at
              : null,
          email: adminData.email,
          savedAt: new Date().toISOString(),
        };

        return { ok: true, admin: adminData, session: nextSession };
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
      setAdmin(null);
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
      setAdmin(null);
      setStatus("unauthenticated");
      toastFail("Session expired", "Please login again.");
      return;
    }
    setAdmin(result.admin);
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
        const response = await fetch(`${API_HOST}/admin/login`, {
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
            const retryAfter = data?.retry_after_seconds ?? data?.retry_after;
            const hint = retryAfter
              ? `Try again in ${retryAfter} seconds.`
              : "Try again in a moment.";
            const reason = data?.reason ?? "";
            return {
              ok: false,
              error: reason
                ? `${reason.replace(/_/g, " ")}. ${hint}`
                : `Rate limited. ${hint}`,
            };
          }
          if (code === "invalid_credentials") {
            return { ok: false, error: "Invalid credentials." };
          }
          return {
            ok: false,
            error: data?.reason?.replace(/_/g, " ") ?? "Authentication failed.",
          };
        }

        /* Build candidate session and verify it */
        const candidate: AdminSession = {
          token: authToken!,
          tokenType:
            typeof data?.auth?.token_type === "string" && data.auth.token_type
              ? data.auth.token_type
              : "bearer",
          expiresAt:
            typeof data?.auth?.expires_at === "string"
              ? data.auth.expires_at
              : null,
          email:
            typeof data?.admin?.email === "string"
              ? data.admin.email
              : email,
          savedAt: new Date().toISOString(),
        };

        const verification = await verifyToken(candidate.token);
        if (!verification.ok) {
          return {
            ok: false,
            error:
              verification.reason === "invalid_or_expired_admin_token"
                ? "Token invalid or expired."
                : verification.reason,
          };
        }

        setSession(verification.session);
        setAdmin(verification.admin);
        saveSession(verification.session);
        setStatus("authenticated");
        toastOk(
          "Authenticated",
          verification.admin.email,
        );

        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "Network error",
        };
      }
    },
    [toastOk, verifyToken],
  );

  /* On mount: try to restore session from sessionStorage */
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
      setAdmin(result.admin);
      saveSession(result.session);
      setStatus("authenticated");
    })();
  }, [verifyToken]);

  const value = React.useMemo<AdminAuthContextValue>(
    () => ({
      status,
      token: session?.token ?? null,
      admin,
      session,
      login,
      logout,
      refresh,
    }),
    [status, session, admin, login, logout, refresh],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
