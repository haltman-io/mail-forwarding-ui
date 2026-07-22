"use client";

import * as React from "react";

import type {
  AdminApiToken,
  TokenStatusFilter,
  ListState,
} from "@/features/dashboard/types/admin.types";
import {
  fetchApiTokens,
  createApiToken,
  updateApiToken,
  deleteApiToken,
  isUnauthorized,
  describeError,
} from "@/features/dashboard/services/api-tokens.service";
import { useDebouncedValue } from "@/features/dashboard/hooks/use-debounced-value";
import { useUrlQueryState } from "@/features/dashboard/hooks/use-url-query-state";
import {
  DEFAULT_PAGE_SIZE,
  createListState,
  dateTimeLocalToIso,
  isoToDateTimeLocal,
  toastFail,
  toastOk,
} from "@/features/dashboard/lib/admin-utils";

const FILTER_DEFAULTS = {
  q: "",
  status: "all" as TokenStatusFilter,
  limit: String(DEFAULT_PAGE_SIZE),
  offset: "0",
};

export function useApiTokensController() {
  const { state, setField, patch, reset } = useUrlQueryState(FILTER_DEFAULTS, [
    "q",
    "status",
    "limit",
    "offset",
  ]);

  const ownerSearch = state.q;
  const statusFilter = (
    ["all", "active", "revoked", "expired"].includes(state.status)
      ? state.status
      : "all"
  ) as TokenStatusFilter;
  const limit = Math.max(1, Number.parseInt(state.limit, 10) || DEFAULT_PAGE_SIZE);
  const offset = Math.max(0, Number.parseInt(state.offset, 10) || 0);
  const debouncedSearch = useDebouncedValue(ownerSearch, 300);

  const [list, setList] = React.useState<ListState<AdminApiToken>>(() =>
    createListState(limit),
  );
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorBusy, setEditorBusy] = React.useState(false);
  const [formId, setFormId] = React.useState<number | null>(null);
  const [formOwnerEmail, setFormOwnerEmail] = React.useState("");
  const [formDays, setFormDays] = React.useState("30");
  const [formExpiresAt, setFormExpiresAt] = React.useState("");
  const [formRevoked, setFormRevoked] = React.useState(false);
  const [formRevokedReason, setFormRevokedReason] = React.useState("");
  const [createdPlaintext, setCreatedPlaintext] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);
  const loadSeq = React.useRef(0);

  const load = React.useCallback(
    async (nextOffset = offset, nextLimit = limit) => {
      const seq = ++loadSeq.current;
      setList((s) => ({ ...s, loading: true, error: null }));
      try {
        const r = await fetchApiTokens({
          limit: nextLimit,
          offset: nextOffset,
          status: statusFilter,
          owner_email: debouncedSearch.trim().toLowerCase() || undefined,
        });
        if (seq !== loadSeq.current) return;
        if (isUnauthorized(r)) {
          setList((s) => ({ ...s, loading: false, error: "Unauthorized" }));
          toastFail("Unauthorized");
          return;
        }
        if (!r.ok) {
          const e = describeError(r, "Failed to load API tokens.");
          setList((s) => ({ ...s, loading: false, error: e.message }));
          toastFail(e.isRateLimited ? "Rate limited" : "Load failed", e.message);
          return;
        }
        const items = Array.isArray(r.data?.items) ? r.data.items : [];
        const pg = r.data?.pagination;
        setList({
          items,
          total: pg?.total ?? items.length,
          limit: pg?.limit ?? nextLimit,
          offset: pg?.offset ?? nextOffset,
          loading: false,
          loadedAt: Date.now(),
          error: null,
        });
      } catch (e) {
        if (seq !== loadSeq.current) return;
        const m = e instanceof Error ? e.message : "Network error";
        setList((s) => ({ ...s, loading: false, error: m }));
        toastFail("Network error", m);
      }
    },
    [debouncedSearch, limit, offset, statusFilter],
  );

  React.useEffect(() => {
    void load(offset, limit);
  }, [load, offset, limit]);

  const filterKey = `${debouncedSearch}|${statusFilter}|${limit}`;
  const prevFilterKey = React.useRef(filterKey);
  React.useEffect(() => {
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;
    if (offset !== 0) setField("offset", "0");
  }, [filterKey, offset, setField]);

  function openCreate() {
    setFormId(null);
    setFormOwnerEmail("");
    setFormDays("30");
    setFormExpiresAt("");
    setFormRevoked(false);
    setFormRevokedReason("");
    setCreatedPlaintext(null);
    setEditorOpen(true);
  }

  function openEdit(item: AdminApiToken) {
    setFormId(item.id);
    setFormOwnerEmail(item.owner_email);
    setFormDays("30");
    setFormExpiresAt(isoToDateTimeLocal(item.expires_at));
    setFormRevoked(Boolean(item.revoked_at));
    setFormRevokedReason(item.revoked_reason ?? "");
    setCreatedPlaintext(null);
    setEditorOpen(true);
  }

  async function submitEditor(e: React.FormEvent) {
    e.preventDefault();
    const owner = formOwnerEmail.trim().toLowerCase();
    if (!owner) {
      toastFail("Validation", "Owner email is required.");
      return;
    }
    setEditorBusy(true);
    try {
      const isEdit = formId !== null;
      if (isEdit) {
        const body: Record<string, unknown> = { owner_email: owner };
        const expiresIso = dateTimeLocalToIso(formExpiresAt);
        if (formExpiresAt && !expiresIso) {
          toastFail("Validation", "Invalid expiration date.");
          setEditorBusy(false);
          return;
        }
        if (expiresIso) body.expires_at = expiresIso;
        body.revoked = formRevoked ? 1 : 0;
        if (formRevokedReason.trim()) body.revoked_reason = formRevokedReason.trim();
        const r = await updateApiToken(formId, body);
        if (isUnauthorized(r)) {
          toastFail("Unauthorized");
          return;
        }
        if (!r.ok) {
          const err = describeError(r, "Update failed.");
          toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
          return;
        }
        setEditorOpen(false);
        toastOk("API token updated", owner);
      } else {
        const days = Number.parseInt(formDays, 10);
        if (!Number.isFinite(days) || days < 1 || days > 90) {
          toastFail("Validation", "Days must be between 1 and 90.");
          setEditorBusy(false);
          return;
        }
        const r = await createApiToken({ owner_email: owner, days });
        if (isUnauthorized(r)) {
          toastFail("Unauthorized");
          return;
        }
        if (!r.ok) {
          const err = describeError(r, "Create failed.");
          toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
          return;
        }
        if (typeof r.data?.token === "string" && r.data.token) {
          setCreatedPlaintext(r.data.token);
        }
        setEditorOpen(false);
        toastOk("API token created", owner);
      }
      await load(formId !== null ? offset : 0, limit);
      if (formId === null) setField("offset", "0");
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setEditorBusy(false);
    }
  }

  function askDelete(item: AdminApiToken) {
    setDeleteTarget({ id: item.id, label: item.owner_email });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteApiToken(deleteTarget.id);
      if (isUnauthorized(r)) {
        toastFail("Unauthorized");
        return;
      }
      if (!r.ok) {
        const e = describeError(r, "Delete failed.");
        toastFail(e.isRateLimited ? "Rate limited" : "Error", e.message);
        return;
      }
      toastOk("API token deleted", deleteTarget.label);
      setDeleteTarget(null);
      await load(0, limit);
      setField("offset", "0");
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDeleteBusy(false);
    }
  }

  const pageActiveCount = list.items.filter(
    (item) =>
      !item.revoked_at && (!item.expires_at || new Date(item.expires_at) > new Date()),
  ).length;
  const pageRevokedCount = list.items.filter((item) => !!item.revoked_at).length;
  const hasActiveFilters = Boolean(ownerSearch.trim()) || statusFilter !== "all";

  return {
    list,
    pageActiveCount,
    pageRevokedCount,
    statusFilter,
    setStatusFilter: (v: TokenStatusFilter) => patch({ status: v, offset: "0" }),
    ownerSearch,
    setOwnerSearch: (v: string) => setField("q", v),
    hasActiveFilters,
    clearFilters: reset,
    refresh: () => void load(offset, limit),
    setPageOffset: (v: number) => setField("offset", String(Math.max(0, v))),
    setPageSize: (v: number) => patch({ limit: String(v), offset: "0" }),
    editorOpen,
    setEditorOpen,
    editorBusy,
    formId,
    formOwnerEmail,
    setFormOwnerEmail,
    formDays,
    setFormDays,
    formExpiresAt,
    setFormExpiresAt,
    formRevoked,
    setFormRevoked,
    formRevokedReason,
    setFormRevokedReason,
    createdPlaintext,
    setCreatedPlaintext,
    openCreate,
    openEdit,
    submitEditor,
    deleteTarget,
    setDeleteTarget,
    deleteBusy,
    askDelete,
    confirmDelete,
  };
}
