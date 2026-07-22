"use client";

import * as React from "react";

import type { AdminAlias, BoolFilter, ListState } from "@/features/dashboard/types/admin.types";
import {
  fetchAliases,
  createAlias,
  updateAlias,
  deleteAlias,
  getDashboardDomainsCached,
  isUnauthorized,
  describeError,
} from "@/features/dashboard/services/aliases.service";
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

export type AliasSearchField = "address" | "goto";

const FILTER_DEFAULTS = {
  q: "",
  field: "address" as AliasSearchField,
  active: "all" as BoolFilter,
  limit: String(DEFAULT_PAGE_SIZE),
  offset: "0",
};

export function useAliasesController() {
  const { state, setField, patch, reset } = useUrlQueryState(FILTER_DEFAULTS, [
    "q",
    "field",
    "active",
    "limit",
    "offset",
  ]);

  const search = state.q;
  const searchField = (state.field === "goto" ? "goto" : "address") as AliasSearchField;
  const activeFilter = (["all", "1", "0"].includes(state.active)
    ? state.active
    : "all") as BoolFilter;
  const limit = Math.max(1, Number.parseInt(state.limit, 10) || DEFAULT_PAGE_SIZE);
  const offset = Math.max(0, Number.parseInt(state.offset, 10) || 0);

  const debouncedSearch = useDebouncedValue(search, 300);

  const [list, setList] = React.useState<ListState<AdminAlias>>(() =>
    createListState(limit),
  );

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorBusy, setEditorBusy] = React.useState(false);
  const [formId, setFormId] = React.useState<number | null>(null);
  const [formHandle, setFormHandle] = React.useState("");
  const [formDomain, setFormDomain] = React.useState("");
  const [aliasDomains, setAliasDomains] = React.useState<string[]>([]);
  const [aliasDomainsLoading, setAliasDomainsLoading] = React.useState(false);
  const [aliasDomainComboboxOpen, setAliasDomainComboboxOpen] = React.useState(false);
  const [formGoto, setFormGoto] = React.useState("");
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
        const r = await fetchAliases({
          limit: nextLimit,
          offset: nextOffset,
          active: activeFilter,
          address: q && searchField === "address" ? q : undefined,
          goto: q && searchField === "goto" ? q : undefined,
        });
        if (seq !== loadSeq.current) return;
        if (isUnauthorized(r)) {
          setList((s) => ({ ...s, loading: false, error: "Unauthorized" }));
          toastFail("Unauthorized");
          return;
        }
        if (!r.ok) {
          const e = describeError(r, "Failed to load aliases.");
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

  // Reset offset when debounced search / filters change (except offset itself)
  const filterKey = `${debouncedSearch}|${searchField}|${activeFilter}|${limit}`;
  const prevFilterKey = React.useRef(filterKey);
  React.useEffect(() => {
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;
    if (offset !== 0) {
      setField("offset", "0");
    }
  }, [filterKey, offset, setField]);

  const ensureAliasDomainsLoaded = React.useCallback(async () => {
    if (aliasDomainsLoading || aliasDomains.length > 0) return;
    setAliasDomainsLoading(true);
    try {
      const domains = await getDashboardDomainsCached();
      setAliasDomains(domains);
      setFormDomain((current) => current || domains[0] || "");
    } catch {
      setAliasDomains([]);
    } finally {
      setAliasDomainsLoading(false);
    }
  }, [aliasDomains.length, aliasDomainsLoading]);

  React.useEffect(() => {
    if (!editorOpen) return;
    void ensureAliasDomainsLoaded();
  }, [editorOpen, ensureAliasDomainsLoaded]);

  function getAddressParts(address: string) {
    const defaultDomain = aliasDomains[0] || "example.com";
    if (!address) return { handle: "", domain: defaultDomain };
    const parts = address.split("@");
    if (parts.length < 2) return { handle: address, domain: defaultDomain };
    return { handle: parts.slice(0, -1).join("@"), domain: parts[parts.length - 1] };
  }

  function openCreate() {
    setFormId(null);
    setFormHandle("");
    setFormDomain(aliasDomains[0] || "");
    setFormGoto("");
    setFormActive(true);
    setEditorOpen(true);
  }

  function openEdit(item: AdminAlias) {
    const { handle, domain } = getAddressParts(item.address);
    setFormId(item.id);
    setFormHandle(handle);
    setFormDomain(domain);
    setFormGoto(item.goto);
    setFormActive(isTrueValue(item.active));
    setEditorOpen(true);
  }

  async function submitEditor(e: React.FormEvent) {
    e.preventDefault();
    const handle = formHandle.trim().toLowerCase();
    const domain = formDomain.trim().toLowerCase();
    const address = `${handle}@${domain}`;
    const goto = formGoto.trim().toLowerCase();
    if (!handle) {
      toastFail("Validation", "Alias handle is required.");
      return;
    }
    if (!domain) {
      toastFail("Validation", "Alias domain is required.");
      return;
    }
    if (!goto) {
      toastFail("Validation", "Destination is required.");
      return;
    }
    setEditorBusy(true);
    try {
      const isEdit = formId !== null;
      const body = { address, goto, active: boolToApi(formActive) };
      const r = isEdit ? await updateAlias(formId, body) : await createAlias(body);
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
      toastOk(isEdit ? "Alias updated" : "Alias created", address);
      await load(isEdit ? offset : 0, limit);
      if (!isEdit) setField("offset", "0");
    } catch (err) {
      toastFail("Network error", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setEditorBusy(false);
    }
  }

  function askDelete(item: AdminAlias) {
    setDeleteTarget({ id: item.id, label: item.address });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteAlias(deleteTarget.id);
      if (isUnauthorized(r)) {
        toastFail("Unauthorized");
        return;
      }
      if (!r.ok) {
        const e = describeError(r, "Delete failed.");
        toastFail(e.isRateLimited ? "Rate limited" : "Error", e.message);
        return;
      }
      toastOk("Alias deleted", deleteTarget.label);
      setDeleteTarget(null);
      await load(0, limit);
      setField("offset", "0");
    } catch (err) {
      toastFail("Network error", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setDeleteBusy(false);
    }
  }

  async function toggleActive(item: AdminAlias) {
    const newActive = !isTrueValue(item.active);
    setList((s) => ({
      ...s,
      items: s.items.map((a) =>
        a.id === item.id ? { ...a, active: boolToApi(newActive) } : a,
      ),
    }));
    try {
      const r = await updateAlias(item.id, {
        address: item.address,
        goto: item.goto,
        active: boolToApi(newActive),
      });
      if (isUnauthorized(r)) {
        setList((s) => ({
          ...s,
          items: s.items.map((a) =>
            a.id === item.id ? { ...a, active: boolToApi(!newActive) } : a,
          ),
        }));
        toastFail("Unauthorized");
        return;
      }
      if (!r.ok) {
        setList((s) => ({
          ...s,
          items: s.items.map((a) =>
            a.id === item.id ? { ...a, active: boolToApi(!newActive) } : a,
          ),
        }));
        const e = describeError(r, "Toggle failed.");
        toastFail(e.isRateLimited ? "Rate limited" : "Error", e.message);
        return;
      }
      toastOk(newActive ? "Alias activated" : "Alias deactivated", item.address);
    } catch (err) {
      setList((s) => ({
        ...s,
        items: s.items.map((a) =>
          a.id === item.id ? { ...a, active: boolToApi(!newActive) } : a,
        ),
      }));
      toastFail("Network error", err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function bulkSetActive(items: AdminAlias[], active: boolean) {
    if (items.length === 0) return;
    setBulkBusy(true);
    let ok = 0;
    let fail = 0;
    await Promise.all(
      items.map(async (item) => {
        try {
          const r = await updateAlias(item.id, {
            address: item.address,
            goto: item.goto,
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
    if (ok) toastOk(active ? "Aliases activated" : "Aliases deactivated", `${ok} updated`);
    if (fail) toastFail("Some updates failed", `${fail} could not be updated`);
    await load(offset, limit);
  }

  async function bulkDelete(items: AdminAlias[]) {
    if (items.length === 0) return;
    if (!window.confirm(`Delete ${items.length} alias(es)?`)) return;
    setBulkBusy(true);
    let ok = 0;
    let fail = 0;
    await Promise.all(
      items.map(async (item) => {
        try {
          const r = await deleteAlias(item.id);
          if (r.ok) ok += 1;
          else fail += 1;
        } catch {
          fail += 1;
        }
      }),
    );
    setBulkBusy(false);
    if (ok) toastOk("Aliases deleted", `${ok} removed`);
    if (fail) toastFail("Some deletes failed", `${fail} could not be deleted`);
    await load(0, limit);
    setField("offset", "0");
  }

  const pageActiveCount = list.items.filter((a) => isTrueValue(a.active)).length;
  const pageInactiveCount = list.items.length - pageActiveCount;
  const hasActiveFilters =
    Boolean(search.trim()) || activeFilter !== "all" || searchField !== "address";

  function clearFilters() {
    reset();
  }

  function setSearch(value: string) {
    setField("q", value);
  }
  function setSearchField(value: AliasSearchField) {
    patch({ field: value, offset: "0" });
  }
  function setActiveFilter(value: BoolFilter) {
    patch({ active: value, offset: "0" });
  }
  function setPageOffset(value: number) {
    setField("offset", String(Math.max(0, value)));
  }
  function setPageSize(value: number) {
    patch({ limit: String(value), offset: "0" });
  }

  return {
    list,
    pageActiveCount,
    pageInactiveCount,
    search,
    setSearch,
    searchField,
    setSearchField,
    activeFilter,
    setActiveFilter,
    hasActiveFilters,
    clearFilters,
    refresh: () => void load(offset, limit),
    setPageOffset,
    setPageSize,
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
    formDomain,
    setFormDomain,
    aliasDomains,
    aliasDomainsLoading,
    aliasDomainComboboxOpen,
    setAliasDomainComboboxOpen,
    formGoto,
    setFormGoto,
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
