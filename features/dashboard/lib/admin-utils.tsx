"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { ListState, RequestResult } from "@/features/dashboard/types/admin.types";

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export function isTrueValue(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const n = v.trim().toLowerCase();
    return n === "1" || n === "true" || n === "yes" || n === "on";
  }
  return false;
}

export function boolToApi(v: boolean): number {
  return v ? 1 : 0;
}

export function toastOk(title: string, description?: string) {
  toast.success(title, {
    description,
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  });
}

export function toastFail(title: string, description?: string) {
  toast.error(title, {
    description,
    icon: <AlertTriangle className="h-4 w-4 text-rose-400" />,
  });
}

export function createListState<T>(limit = DEFAULT_PAGE_SIZE): ListState<T> {
  return {
    items: [],
    total: 0,
    limit,
    offset: 0,
    loading: false,
    loadedAt: null,
    error: null,
  };
}

export function paginationRange(total: number, offset: number, limit: number) {
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);
  const page = Math.floor(offset / Math.max(limit, 1)) + 1;
  const pageCount = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  return {
    from,
    to,
    page,
    pageCount,
    canPrev: offset > 0,
    canNext: offset + limit < total,
  };
}

export function dateTimeLocalToIso(v: string) {
  if (!v) return null;
  const p = Date.parse(v);
  if (Number.isNaN(p)) return null;
  return new Date(p).toISOString();
}

export function isoToDateTimeLocal(v?: string | null) {
  if (!v) return "";
  const p = Date.parse(v);
  if (Number.isNaN(p)) return "";
  const d = new Date(p);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatErrorBody(data: unknown) {
  if (data == null) return null;
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data);
  } catch {
    return null;
  }
}

export function copyText(value: string, label = "Copied") {
  void navigator.clipboard.writeText(value).then(
    () => toast.info(label),
    () => toastFail("Clipboard unavailable", "Copy the value manually."),
  );
}

export type DescribeErrorFn = (
  result: Pick<
    RequestResult<unknown>,
    | "status"
    | "errorCode"
    | "errorReason"
    | "errorWhere"
    | "errorHint"
    | "errorField"
    | "retryAfterSeconds"
  >,
  fallback: string,
) => { isRateLimited: boolean; message: string };
