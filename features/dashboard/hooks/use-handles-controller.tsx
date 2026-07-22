"use client";

import * as React from "react";

import type { AdminHandle, BoolFilter, ListState } from "@/features/dashboard/types/admin.types";
import {
  fetchHandles,
  createHandle,
  updateHandle,
  deleteHandle,
  isUnauthorized,
  describeError,
} from "@/features/dashboard/services/handles.service";
import { useDebouncedValue } from "@/features/dashboard/hooks/use-debounced-value";
import { useUrlQueryState } from "@/features/dashboard/hooks/use-url-query-state";
import {
  DEFAULT_PAGE_SIZE,
  boolToApi,
  createListState,
  isTrueValue,
  toastFail,
  toastOk,
} from "@/features/dashboard/lib/admin-utils";

export type HandleSearchField = "handle" | "address";

const FILTER_DEFAULTS = {
  q: "",
  field: "handle" as HandleSearchField,
  active: "all" as BoolFilter,
  limit: String(DEFAULT_PAGE_SIZE),
  offset: "0",
};

export function useHandlesController() {
  const { state, setField, patch, reset } = useUrlQueryState(FILTER_DEFAULTS, [
    "q",
    "field",
    "active",
    "limit",
    "offset",
  ]);

  const search = state.q;
  const searchField = (state.field === "address" ? "address" : "handle") as HandleSearchField;
  const activeFilter = (["all", "1", "0"].includes(state.active)
    ? state.active
    : "all") as BoolFilter;
  const limit = Math.max(1, Number.parseInt(state.limit, 10) || DEFAULT_PAGE_SIZE);
  const offset = Math.max(0, Number.parseInt(state.offset, 10) || 0);
  const debouncedSearch = useDebouncedValue(search, 300);

  const [list, setList] = React.useState<ListState<AdminHandle>>(() =>
    createListState(limit),
  );
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorBusy, setEditorBusy] = React.useState(false);
  const [formId, setFormId] = React.useState<number | null>(null);
  const [formHandle, setFormHandle] = React.useState("");
  const [formAddress, setFormAddress] = React.useState("");
  const [formActive, setFormActive] = React.useState(true);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const loadSeq = React.useRef(0);

  const load = React.useCallback(
    async (nextOffset = offset, nextLimit = limit) => {
      const seq = ++loadSeq.current;
      setList((s) => ({ ...s, loading: true, error: null }));
      try {
        const q = debouncedSearch.trim().toLowerCase();
        const r = await fetchHandles({
          limit: nextLimit,
          offset: nextOffset,
          active: activeFilter,
          handle: q && searchField === "handle" ? q : undefined,
          address: q && searchField === "address" ? q : undefined,
        });
        if (seq !== loadSeq.current) return;
        if (isUnauthorized(r)) {
          setList((s) => ({ ...s, loading: false, error: "Unauthorized" }));
          toastFail("Unauthorized");
          return;
        }
        if (!r.ok) {
          const e = describeError(r, "Failed to load handles.");
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
    [activeFilter, debouncedSearch, limit, offset, searchField],
  );

  React.useEffect(() => {
    void load(offset, limit);
  }, [load, offset, limit]);

  const filterKey = `${debouncedSearch}|${searchField}|${activeFilter}|${limit}`;
  const prevFilterKey = React.useRef(filterKey);
  React.useEffect(() => {
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;
    if (offset !== 0) setField("offset", "0");
  }, [filterKey, offset, setField]);

  function openCreate() {
    setFormId(null);
    setFormHandle("");
    setFormAddress("");
    setFormActive(true);
    setEditorOpen(true);
  }

  function openEdit(item: AdminHandle) {
    setFormId(item.id);
    setFormHandle(item.handle);
    setFormAddress(item.address);
    setFormActive(isTrueValue(item.active));
    setEditorOpen(true);
  }

  async function submitEditor(e: React.FormEvent) {
    e.preventDefault();
    const handle = formHandle.trim().toLowerCase();
    const address = formAddress.trim().toLowerCase();
    if (!handle) {
      toastFail("Validation", "Handle is required.");
      return;
    }
    if (!address) {
      toastFail("Validation", "Address is required.");
      return;
    }
    setEditorBusy(true);
    try {
      const isEdit = formId !== null;
      const body = { handle, address, active: boolToApi(formActive) };
      const r = isEdit ? await updateHandle(formId, body) : await createHandle(body);
      if (isUnauthorized(r)) {
        toastFail("Unauthorized");
        return;
      }
      if (!r.ok) {
        const err = describeError(r, isEdit ? "Update failed." : "Create failed.");
        toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
        return;
      }
      setEditorOpen(false);
      toastOk(isEdit ? "Handle updated" : "Handle created", `${handle} → ${address}`);
      await load(isEdit ? offset : 0, limit);
      if (!isEdit) setField("offset", "0");
    } catch (err) {
      toastFail("Network error", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setEditorBusy(false);
    }
  }

  function askDelete(item: AdminHandle) {
    setDeleteTarget({ id: item.id, label: item.handle });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteHandle(deleteTarget.id);
      if (isUnauthorized(r)) {
        toastFail("Unauthorized");
        return;
      }
      if (!r.ok) {
        const e = describeError(r, "Delete failed.");
        toastFail(e.isRateLimited ? "Rate limited" : "Error", e.message);
        return;
      }
      toastOk("Handle deleted", deleteTarget.label);
      setDeleteTarget(null);
      await load(0, limit);
      setField("offset", "0");
    } catch (err) {
      toastFail("Network error", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setDeleteBusy(false);
    }
  }

  async function toggleActive(item: AdminHandle) {
    const newActive = !isTrueValue(item.active);
    setList((s) => ({
      ...s,
      items: s.items.map((d) =>
        d.id === item.id ? { ...d, active: boolToApi(newActive) } : d,
      ),
    }));
    try {
      const r = await updateHandle(item.id, {
        handle: item.handle,
        address: item.address,
        active: boolToApi(newActive),
      });
      if (!r.ok || isUnauthorized(r)) {
        setList((s) => ({
          ...s,
          items: s.items.map((d) =>
            d.id === item.id ? { ...d, active: boolToApi(!newActive) } : d,
          ),
        }));
        if (isUnauthorized(r)) toastFail("Unauthorized");
        else {
          const e = describeError(r, "Toggle failed.");
          toastFail(e.isRateLimited ? "Rate limited" : "Error", e.message);
        }
        return;
      }
      toastOk(newActive ? "Handle activated" : "Handle deactivated", item.handle);
    } catch (err) {
      setList((s) => ({
        ...s,
        items: s.items.map((d) =>
          d.id === item.id ? { ...d, active: boolToApi(!newActive) } : d,
        ),
      }));
      toastFail("Network error", err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function bulkSetActive(items: AdminHandle[], active: boolean) {
    if (!items.length) return;
    setBulkBusy(true);
    let ok = 0;
    let fail = 0;
    await Promise.all(
      items.map(async (item) => {
        try {
          const r = await updateHandle(item.id, {
            handle: item.handle,
            address: item.address,
            active: boolToApi(active),
          });
          if (r.ok) ok += 1;
          else fail += 1;
        } catch {
          fail += 1;
        }
      }),
    );
    setBulkBusy(false);
    if (ok) toastOk(active ? "Handles activated" : "Handles deactivated", `${ok} updated`);
    if (fail) toastFail("Some updates failed", `${fail} could not be updated`);
    await load(offset, limit);
  }

  async function bulkDelete(items: AdminHandle[]) {
    if (!items.length) return;
    if (!window.confirm(`Delete ${items.length} handle(s)?`)) return;
    setBulkBusy(true);
    let ok = 0;
    let fail = 0;
    await Promise.all(
      items.map(async (item) => {
        try {
          const r = await deleteHandle(item.id);
          if (r.ok) ok += 1;
          else fail += 1;
        } catch {
          fail += 1;
        }
      }),
    );
    setBulkBusy(false);
    if (ok) toastOk("Handles deleted", `${ok} removed`);
    if (fail) toastFail("Some deletes failed", `${fail} could not be deleted`);
    await load(0, limit);
    setField("offset", "0");
  }

  const pageActiveCount = list.items.filter((d) => isTrueValue(d.active)).length;
  const pageInactiveCount = list.items.length - pageActiveCount;
  const hasActiveFilters =
    Boolean(search.trim()) || activeFilter !== "all" || searchField !== "handle";

  return {
    list,
    pageActiveCount,
    pageInactiveCount,
    search,
    setSearch: (v: string) => setField("q", v),
    searchField,
    setSearchField: (v: HandleSearchField) => patch({ field: v, offset: "0" }),
    activeFilter,
    setActiveFilter: (v: BoolFilter) => patch({ active: v, offset: "0" }),
    hasActiveFilters,
    clearFilters: reset,
    refresh: () => void load(offset, limit),
    setPageOffset: (v: number) => setField("offset", String(Math.max(0, v))),
    setPageSize: (v: number) => patch({ limit: String(v), offset: "0" }),
    toggleActive,
    bulkSetActive,
    bulkDelete,
    bulkBusy,
    editorOpen,
    setEditorOpen,
    editorBusy,
    formId,
    formHandle,
    setFormHandle,
    formAddress,
    setFormAddress,
    formActive,
    setFormActive,
    openCreate,
    openEdit,
    submitEditor,
    deleteTarget,
    setDeleteTarget,
    deleteBusy,
    askDelete,
    confirmDelete,
    isTrueValue,
  };
}
