import * as React from "react";

import type { AdminSession, ListState } from "@/features/admin-menu/types/admin-menu.types";

const ADMIN_STORAGE_KEY = "haltman.admin.session.v1";
const DEFAULT_LIMIT = 10;

export const EMAIL_PATTERN = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";

export const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";

export function createListState<T>(): ListState<T> {
  return {
    items: [],
    total: 0,
    limit: DEFAULT_LIMIT,
    offset: 0,
    loading: false,
    loadedAt: null,
    error: null,
  };
}

export function isTrueValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
  }
  return false;
}

export function boolToApi(value: boolean) {
  return value ? 1 : 0;
}

export function normalizeEmailInput(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

export function splitAliasAddress(value: string) {
  const normalized = value.trim().toLowerCase();
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === normalized.length - 1) return null;
  return {
    handle: normalized.slice(0, atIndex),
    domain: normalized.slice(atIndex + 1),
  };
}

export function safeDateLabel(value?: string | null) {
  if (!value) return "-";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString();
}

export function dateTimeLocalToIso(value: string) {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
}

export function isoToDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "";
  const date = new Date(parsed);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function readStoredSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    if (typeof parsed.token !== "string" || !parsed.token) return null;

    return {
      token: parsed.token,
      tokenType: typeof parsed.tokenType === "string" && parsed.tokenType ? parsed.tokenType : "bearer",
      expiresAt: typeof parsed.expiresAt === "string" ? parsed.expiresAt : null,
      email: typeof parsed.email === "string" ? parsed.email : null,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveSession(session: AdminSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
}

export function clearSessionStorage() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ADMIN_STORAGE_KEY);
}

export function clearDebounceTimer(timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  if (timerRef.current === null) return;
  clearTimeout(timerRef.current);
  timerRef.current = null;
}

export function scheduleDebouncedSearch(
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  callback: () => void,
  delayMs = 320
) {
  clearDebounceTimer(timerRef);
  timerRef.current = setTimeout(() => {
    timerRef.current = null;
    callback();
  }, delayMs);
}

export function triggerSearchOnEnter(event: React.KeyboardEvent<HTMLInputElement>, callback: () => void) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  callback();
}
