"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import {
  authGetSession,
  authSignIn,
  authSignUp,
  authSignOut,
  authSignOutAll,
  authRefresh,
  authForgotPassword,
  clearCsrfCache,
  type AuthUser,
  type AuthSessionInfo,
  type AuthResult,
  type SignInData,
  type SignUpData,
  type ForgotPasswordData,
} from "@/lib/auth-client";

/* ── Types ── */

export type AuthStatus = "checking" | "unauthenticated" | "authenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  session: AuthSessionInfo | null;
  signIn: (identifier: string, password: string) => Promise<AuthResult<SignInData>>;
  signUp: (email: string, username: string, password: string) => Promise<AuthResult<SignUpData>>;
  signOut: () => Promise<void>;
  signOutAll: () => Promise<void>;
  refresh: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<AuthResult<ForgotPasswordData>>;
};

/* ── Context ── */

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/* ── Provider ── */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthStatus>("checking");
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [session, setSession] = React.useState<AuthSessionInfo | null>(null);
  const refreshTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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

  /* Clear refresh timer */
  const clearRefreshTimer = React.useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /* End session locally */
  const endSession = React.useCallback(() => {
    clearRefreshTimer();
    setUser(null);
    setSession(null);
    setStatus("unauthenticated");
    clearCsrfCache();
  }, [clearRefreshTimer]);

  /* Schedule auto-refresh ~60s before access token expires */
  const scheduleRefresh = React.useCallback(
    (info: AuthSessionInfo) => {
      clearRefreshTimer();
      const expiresAt = new Date(info.access_expires_at).getTime();
      const delay = Math.max(0, expiresAt - Date.now() - 60_000);

      refreshTimerRef.current = setTimeout(async () => {
        try {
          const result = await authRefresh();
          if (result.ok && result.data) {
            setSession(result.data.session);
            scheduleRefresh(result.data.session);
          } else {
            endSession();
            toastFail("Session expired", "Please sign in again.");
          }
        } catch {
          endSession();
          toastFail("Session expired", "Please sign in again.");
        }
      }, delay);
    },
    [clearRefreshTimer, endSession, toastFail],
  );

  /* Sign in */
  const handleSignIn = React.useCallback(
    async (identifier: string, password: string) => {
      const result = await authSignIn({ identifier, password });
      if (result.ok && result.data) {
        setUser(result.data.user);
        setSession(result.data.session);
        setStatus("authenticated");
        scheduleRefresh(result.data.session);
        toastOk("Signed in", result.data.user.email);
      }
      return result;
    },
    [scheduleRefresh, toastOk],
  );

  /* Sign up */
  const handleSignUp = React.useCallback(
    async (email: string, username: string, password: string) => {
      return authSignUp({ email, username, password });
    },
    [],
  );

  /* Sign out (single session) */
  const handleSignOut = React.useCallback(async () => {
    try {
      await authSignOut();
    } catch {
      /* proceed even on network error */
    }
    endSession();
    toastOk("Signed out");
  }, [endSession, toastOk]);

  /* Sign out all sessions */
  const handleSignOutAll = React.useCallback(async () => {
    try {
      await authSignOutAll();
    } catch {
      /* proceed even on network error */
    }
    endSession();
    toastOk("Signed out", "All sessions revoked.");
  }, [endSession, toastOk]);

  /* Manual refresh */
  const handleRefresh = React.useCallback(async () => {
    try {
      const result = await authRefresh();
      if (result.ok && result.data) {
        setSession(result.data.session);
        scheduleRefresh(result.data.session);
        return true;
      }
    } catch {
      /* fall through */
    }
    endSession();
    toastFail("Session expired", "Please sign in again.");
    return false;
  }, [scheduleRefresh, endSession, toastFail]);

  /* Forgot password */
  const handleForgotPassword = React.useCallback(
    async (email: string) => {
      return authForgotPassword({ email });
    },
    [],
  );

  /* On mount: check session */
  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await authGetSession();
        if (cancelled) return;
        if (result.ok && result.data) {
          setUser(result.data.user);
          setSession(result.data.session);
          setStatus("authenticated");
          scheduleRefresh(result.data.session);
        } else {
          setStatus("unauthenticated");
        }
      } catch {
        if (!cancelled) setStatus("unauthenticated");
      }
    })();
    return () => {
      cancelled = true;
      clearRefreshTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      session,
      signIn: handleSignIn,
      signUp: handleSignUp,
      signOut: handleSignOut,
      signOutAll: handleSignOutAll,
      refresh: handleRefresh,
      forgotPassword: handleForgotPassword,
    }),
    [status, user, session, handleSignIn, handleSignUp, handleSignOut, handleSignOutAll, handleRefresh, handleForgotPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
