"use client";

/**
 * Backward-compatible wrapper around the unified AuthProvider.
 *
 * Dashboard pages that import `useAdminAuth` and `AdminAuthProvider`
 * continue to work without changes. Under the hood everything now
 * delegates to the unified auth context.
 */

import { AuthProvider, useAuth } from "@/features/auth/hooks/use-auth";
import type { AuthStatus, AuthSession, AuthUser } from "@/features/auth/hooks/use-auth";

export type { AuthStatus, AuthSession };

export type AdminSession = AuthSession;

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export function useAdminAuth() {
  const auth = useAuth();
  return {
    status: auth.status,
    token: auth.token,
    /** Maps the unified `user` to the legacy `admin` field. */
    admin: auth.user
      ? { id: auth.user.id, email: auth.user.email, is_active: auth.user.is_active }
      : null,
    session: auth.session,
    login: auth.login,
    logout: auth.logout,
    refresh: auth.refresh,
  };
}
