"use client";

import * as React from "react";

import type { AdminBan, BoolFilter, BanType, ListState } from "@/features/dashboard/types/admin.types";
import {
  fetchBans,
  createBan,
  updateBan,
  deleteBan,
  isUnauthorized,
  describeError,
} from "@/features/dashboard/services/bans.service";
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
  active: "all" as BoolFilter,
  type: "all",
  limit: String(DEFAULT_PAGE_SIZE),
  offset: "0",
};

export function useBansController() {
  const { state, setField, patch, reset } = useUrlQueryState(FILTER_DEFAULTS, [
    "q",
    "active",
    "type",
    "limit",
    "offset",
  ]);

  const search = state.q;
  const activeFilter = (["all", "1", "0"].includes(state.active)
    ? state.active
    : "all") as BoolFilter;
  const typeFilter = (
    ["all", "email", "domain", "ip", "name"].includes(state.type) ? state.type : "all"
  ) as "all" | BanType;
  const limit = Math.max(1, Number.parseInt(state.limit, 10) || DEFAULT_PAGE_SIZE);
  const offset = Math.max(0, Number.parseInt(state.offset, 10) || 0);
  const debouncedSearch = useDebouncedValue(search, 300);

  const [list, setList] = React.useState<ListState<AdminBan>>(() => createListState(limit));
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorBusy, setEditorBusy] = React.useState(false);
  const [formId, setFormId] = React.useState<number | null>(null);
  const [formType, setFormType] = React.useState<BanType>("email");
  const [formValue, setFormValue] = React.useState("");
  const [formReason, setFormReason] = React.useState("");
  const [formExpiresAt, setFormExpiresAt] = React.useState("");
  const [formRevoked, setFormRevoked] = React.useState(false);
  const [formRevokedReason, setFormRevokedReason] = React.useState("");
  const [formDisableAliases, setFormDisableAliases] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);
  const loadSeq = React.useRef(0);

  const load = React.useCallback(
    async (nextOffset = offset, nextLimit = limit) => {
      const seq = ++loadSeq.current;
      setList((s) => ({ ...s, loading: true, error: null }));
      try {
        const r = await fetchBans({
          limit: nextLimit,
          offset: nextOffset,
          active: activeFilter,
          ban_type: typeFilter !== "all" ? typeFilter : undefined,
          ban_value: debouncedSearch.trim() || undefined,
        });
        if (seq !== loadSeq.current) return;
        if (isUnauthorized(r)) {
          setList((s) => ({ ...s, loading: false, error: "Unauthorized" }));
          toastFail("Unauthorized");
          return;
        }
        if (!r.ok) {
          const e = describeError(r, "Failed to load bans.");
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
    [activeFilter, debouncedSearch, limit, offset, typeFilter],
  );

  React.useEffect(() => {
    void load(offset, limit);
  }, [load, offset, limit]);

  const filterKey = `${debouncedSearch}|${activeFilter}|${typeFilter}|${limit}`;
  const prevFilterKey = React.useRef(filterKey);
  React.useEffect(() => {
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;
    if (offset !== 0) setField("offset", "0");
  }, [filterKey, offset, setField]);

  function openCreate() {
    setFormId(null);
    setFormType("email");
    setFormValue("");
    setFormReason("");
    setFormExpiresAt("");
    setFormRevoked(false);
    setFormRevokedReason("");
    setFormDisableAliases(false);
    setEditorOpen(true);
  }

  function openEdit(item: AdminBan) {
    setFormId(item.id);
    setFormType((item.ban_type as BanType) || "email");
    setFormValue(item.ban_value);
    setFormReason(item.reason ?? "");
    setFormExpiresAt(isoToDateTimeLocal(item.expires_at));
    setFormRevoked(Boolean(item.revoked_at));
    setFormRevokedReason(item.revoked_reason ?? "");
    setFormDisableAliases(false);
    setEditorOpen(true);
  }

  async function submitEditor(e: React.FormEvent) {
    e.preventDefault();
    const value = formValue.trim();
    if (!value) {
      toastFail("Validation", "Ban value is required.");
      return;
    }
    const expiresIso = dateTimeLocalToIso(formExpiresAt);
    if (formExpiresAt && !expiresIso) {
      toastFail("Validation", "Invalid expiration date.");
      return;
    }
    setEditorBusy(true);
    try {
      const isEdit = formId !== null;
      const body: Record<string, unknown> = { ban_type: formType, ban_value: value };
      if (formReason.trim()) body.reason = formReason.trim();
      if (expiresIso) body.expires_at = expiresIso;
      if (isEdit) {
        body.revoked = formRevoked ? 1 : 0;
        if (formRevokedReason.trim()) body.revoked_reason = formRevokedReason.trim();
      }
      if (!isEdit && formDisableAliases && formType !== "ip") {
        body.disable_matching_aliases = true;
      }
      const r = isEdit ? await updateBan(formId, body) : await createBan(body);
      if (isUnauthorized(r)) {
        toastFail("Unauthorized");
        return;
      }
      if (!r.ok) {
        const err = describeError(r, isEdit ? "Update failed." : "Create failed.");
        toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
        return;
      }
      const desc = r.data?.message ?? `${formType}:${value}`;
      setEditorOpen(false);
      toastOk(isEdit ? "Ban updated" : "Ban created", desc);
      await load(isEdit ? offset : 0, limit);
      if (!isEdit) setField("offset", "0");
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setEditorBusy(false);
    }
  }

  function askDelete(item: AdminBan) {
    setDeleteTarget({ id: item.id, label: `${item.ban_type}:${item.ban_value}` });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteBan(deleteTarget.id);
      if (isUnauthorized(r)) {
        toastFail("Unauthorized");
        return;
      }
      if (!r.ok) {
        const e = describeError(r, "Delete failed.");
        toastFail(e.isRateLimited ? "Rate limited" : "Error", e.message);
        return;
      }
      toastOk("Ban deleted", deleteTarget.label);
      setDeleteTarget(null);
      await load(0, limit);
      setField("offset", "0");
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDeleteBusy(false);
    }
  }

  const pageActiveCount = list.items.filter((item) => !item.revoked_at).length;
  const pageRevokedCount = list.items.filter((item) => !!item.revoked_at).length;
  const hasActiveFilters =
    Boolean(search.trim()) || activeFilter !== "all" || typeFilter !== "all";

  return {
    list,
    pageActiveCount,
    pageRevokedCount,
    search,
    setSearch: (v: string) => setField("q", v),
    activeFilter,
    setActiveFilter: (v: BoolFilter) => patch({ active: v, offset: "0" }),
    typeFilter,
    setTypeFilter: (v: "all" | BanType) => patch({ type: v, offset: "0" }),
    hasActiveFilters,
    clearFilters: reset,
    refresh: () => void load(offset, limit),
    setPageOffset: (v: number) => setField("offset", String(Math.max(0, v))),
    setPageSize: (v: number) => patch({ limit: String(v), offset: "0" }),
    editorOpen,
    setEditorOpen,
    editorBusy,
    formId,
    formType,
    setFormType,
    formValue,
    setFormValue,
    formReason,
    setFormReason,
    formExpiresAt,
    setFormExpiresAt,
    formRevoked,
    setFormRevoked,
    formRevokedReason,
    setFormRevokedReason,
    formDisableAliases,
    setFormDisableAliases,
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
