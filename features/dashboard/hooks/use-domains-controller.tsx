"use client";

import * as React from "react";

import type {
  AdminDomain,
  BoolFilter,
  DomainWritePayload,
  ListState,
} from "@/features/dashboard/types/domains.types";
import {
  fetchDomains,
  createDomain,
  updateDomain,
  deleteDomain,
  recheckAllDomainsDns,
  recheckDomainDns,
  isUnauthorized,
  describeError,
} from "@/features/dashboard/services/domains.service";
import { useDebouncedValue } from "@/features/dashboard/hooks/use-debounced-value";
import { useUrlQueryState } from "@/features/dashboard/hooks/use-url-query-state";
import {
  DEFAULT_PAGE_SIZE,
  boolToApi,
  createListState,
  formatErrorBody,
  isTrueValue,
  toastFail,
  toastOk,
} from "@/features/dashboard/lib/admin-utils";

const FILTER_DEFAULTS = {
  q: "",
  active: "all" as BoolFilter,
  visible: "all" as BoolFilter,
  limit: String(DEFAULT_PAGE_SIZE),
  offset: "0",
};

type DomainFormSnapshot = { name: string; active: boolean; visible: boolean };

function readVisibleValue(item: AdminDomain) {
  return item.visible === undefined || item.visible === null
    ? true
    : isTrueValue(item.visible);
}

export function useDomainsController() {
  const { state, setField, patch, reset } = useUrlQueryState(FILTER_DEFAULTS, [
    "q",
    "active",
    "visible",
    "limit",
    "offset",
  ]);

  const search = state.q;
  const activeFilter = (["all", "1", "0"].includes(state.active)
    ? state.active
    : "all") as BoolFilter;
  const visibleFilter = (["all", "1", "0"].includes(state.visible)
    ? state.visible
    : "all") as BoolFilter;
  const limit = Math.max(1, Number.parseInt(state.limit, 10) || DEFAULT_PAGE_SIZE);
  const offset = Math.max(0, Number.parseInt(state.offset, 10) || 0);
  const debouncedSearch = useDebouncedValue(search, 300);

  const [domains, setDomains] = React.useState<ListState<AdminDomain>>(() =>
    createListState(limit),
  );
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorBusy, setEditorBusy] = React.useState(false);
  const [formId, setFormId] = React.useState<number | null>(null);
  const [formName, setFormName] = React.useState("");
  const [formActive, setFormActive] = React.useState(true);
  const [formVisible, setFormVisible] = React.useState(true);
  const [formInitial, setFormInitial] = React.useState<DomainFormSnapshot | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; name: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);
  const [recheckingAll, setRecheckingAll] = React.useState(false);
  const [recheckingIds, setRecheckingIds] = React.useState<Set<number>>(() => new Set());
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const loadSeq = React.useRef(0);

  const load = React.useCallback(
    async (nextOffset = offset, nextLimit = limit) => {
      const seq = ++loadSeq.current;
      setDomains((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await fetchDomains({
          limit: nextLimit,
          offset: nextOffset,
          active: activeFilter,
          visible: visibleFilter,
          name: debouncedSearch.trim().toLowerCase() || undefined,
        });
        if (seq !== loadSeq.current) return;
        if (isUnauthorized(result)) {
          setDomains((s) => ({ ...s, loading: false, error: "Unauthorized" }));
          toastFail("Unauthorized", "Session expired.");
          return;
        }
        if (!result.ok) {
          const err = describeError(result, "Failed to load domains.");
          setDomains((s) => ({ ...s, loading: false, error: err.message }));
          toastFail(err.isRateLimited ? "Rate limited" : "Load failed", err.message);
          return;
        }
        const items = Array.isArray(result.data?.items) ? result.data.items : [];
        const pg = result.data?.pagination;
        setDomains({
          items,
          total: typeof pg?.total === "number" ? pg.total : items.length,
          limit: typeof pg?.limit === "number" ? pg.limit : nextLimit,
          offset: typeof pg?.offset === "number" ? pg.offset : nextOffset,
          loading: false,
          loadedAt: Date.now(),
          error: null,
        });
      } catch (e) {
        if (seq !== loadSeq.current) return;
        const msg = e instanceof Error ? e.message : "Network error";
        setDomains((s) => ({ ...s, loading: false, error: msg }));
        toastFail("Network error", msg);
      }
    },
    [activeFilter, debouncedSearch, limit, offset, visibleFilter],
  );

  React.useEffect(() => {
    void load(offset, limit);
  }, [load, offset, limit]);

  const filterKey = `${debouncedSearch}|${activeFilter}|${visibleFilter}|${limit}`;
  const prevFilterKey = React.useRef(filterKey);
  React.useEffect(() => {
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;
    if (offset !== 0) setField("offset", "0");
  }, [filterKey, offset, setField]);

  const pageActiveCount = domains.items.filter((d) => isTrueValue(d.active)).length;
  const pageEmailDnsCount = domains.items.filter((d) => isTrueValue(d.active_mx)).length;
  const pageUiDnsCount = domains.items.filter((d) => isTrueValue(d.active_ui)).length;
  const pageVisibleCount = domains.items.filter((d) => readVisibleValue(d)).length;

  async function toggleActive(item: AdminDomain) {
    const newActive = !isTrueValue(item.active);
    setDomains((s) => ({
      ...s,
      items: s.items.map((d) =>
        d.id === item.id ? { ...d, active: boolToApi(newActive) } : d,
      ),
    }));
    try {
      const result = await updateDomain(item.id, { active: boolToApi(newActive) });
      if (!result.ok || isUnauthorized(result)) {
        setDomains((s) => ({
          ...s,
          items: s.items.map((d) =>
            d.id === item.id ? { ...d, active: boolToApi(!newActive) } : d,
          ),
        }));
        if (isUnauthorized(result)) toastFail("Unauthorized", "Session expired.");
        else {
          const err = describeError(result, "Toggle failed.");
          toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
        }
        return;
      }
      const updated = result.data?.item;
      if (updated) {
        setDomains((s) => ({
          ...s,
          items: s.items.map((d) => (d.id === item.id ? updated : d)),
        }));
      }
      toastOk(newActive ? "Domain activated" : "Domain deactivated", item.name);
    } catch (e) {
      setDomains((s) => ({
        ...s,
        items: s.items.map((d) =>
          d.id === item.id ? { ...d, active: boolToApi(!newActive) } : d,
        ),
      }));
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function toggleVisible(item: AdminDomain) {
    const newVisible = !readVisibleValue(item);
    setDomains((s) => ({
      ...s,
      items: s.items.map((d) =>
        d.id === item.id ? { ...d, visible: boolToApi(newVisible) } : d,
      ),
    }));
    try {
      const result = await updateDomain(item.id, { visible: boolToApi(newVisible) });
      if (!result.ok || isUnauthorized(result)) {
        setDomains((s) => ({
          ...s,
          items: s.items.map((d) =>
            d.id === item.id ? { ...d, visible: boolToApi(!newVisible) } : d,
          ),
        }));
        if (isUnauthorized(result)) toastFail("Unauthorized", "Session expired.");
        else {
          const err = describeError(result, "Visibility update failed.");
          toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
        }
        return;
      }
      const updated = result.data?.item;
      if (updated) {
        setDomains((s) => ({
          ...s,
          items: s.items.map((d) => (d.id === item.id ? updated : d)),
        }));
      }
      toastOk(newVisible ? "Domain visible" : "Domain hidden", item.name);
    } catch (e) {
      setDomains((s) => ({
        ...s,
        items: s.items.map((d) =>
          d.id === item.id ? { ...d, visible: boolToApi(!newVisible) } : d,
        ),
      }));
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    }
  }

  function openCreate() {
    setFormId(null);
    setFormName("");
    setFormActive(true);
    setFormVisible(true);
    setFormInitial(null);
    setEditorOpen(true);
  }

  function openEdit(item: AdminDomain) {
    const snapshot = {
      name: item.name,
      active: isTrueValue(item.active),
      visible: readVisibleValue(item),
    };
    setFormId(item.id);
    setFormName(snapshot.name);
    setFormActive(snapshot.active);
    setFormVisible(snapshot.visible);
    setFormInitial(snapshot);
    setEditorOpen(true);
  }

  async function submitEditor(e: React.FormEvent) {
    e.preventDefault();
    const name = formName.trim().toLowerCase();
    if (!name) {
      toastFail("Validation", "Domain name is required.");
      return;
    }
    setEditorBusy(true);
    try {
      const isEdit = formId !== null;
      const body: DomainWritePayload = isEdit
        ? {}
        : { name, active: boolToApi(formActive), visible: boolToApi(formVisible) };
      if (isEdit) {
        if (!formInitial || name !== formInitial.name) body.name = name;
        if (!formInitial || formActive !== formInitial.active) body.active = boolToApi(formActive);
        if (!formInitial || formVisible !== formInitial.visible)
          body.visible = boolToApi(formVisible);
        if (Object.keys(body).length === 0) {
          setEditorOpen(false);
          return;
        }
      }
      const result = isEdit
        ? await updateDomain(formId, body)
        : await createDomain({
            name,
            active: boolToApi(formActive),
            visible: boolToApi(formVisible),
          });
      if (isUnauthorized(result)) {
        toastFail("Unauthorized", "Session expired.");
        return;
      }
      if (!result.ok) {
        const err = describeError(result, isEdit ? "Update failed." : "Create failed.");
        toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
        return;
      }
      setEditorOpen(false);
      toastOk(isEdit ? "Domain updated" : "Domain created", name);
      await load(isEdit ? offset : 0, limit);
      if (!isEdit) setField("offset", "0");
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setEditorBusy(false);
    }
  }

  function askDelete(item: AdminDomain) {
    setDeleteTarget({ id: item.id, name: item.name });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const result = await deleteDomain(deleteTarget.id);
      if (isUnauthorized(result)) {
        toastFail("Unauthorized", "Session expired.");
        return;
      }
      if (!result.ok) {
        const err = describeError(result, "Delete failed.");
        toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
        return;
      }
      toastOk("Domain disabled", deleteTarget.name);
      setDeleteTarget(null);
      await load(0, limit);
      setField("offset", "0");
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDeleteBusy(false);
    }
  }

  function setDomainRechecking(id: number, busy: boolean) {
    setRecheckingIds((current) => {
      const next = new Set(current);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const isRecheckingDomain = React.useCallback(
    (id: number) => recheckingIds.has(id),
    [recheckingIds],
  );

  async function recheckAllDns() {
    if (recheckingAll) return;
    setRecheckingAll(true);
    try {
      const result = await recheckAllDomainsDns();
      if (isUnauthorized(result)) {
        toastFail("Unauthorized", "Session expired.");
        return;
      }
      if (!result.ok) {
        const err = describeError(result, "DNS recheck failed.");
        toastFail(
          err.isRateLimited ? "Rate limited" : "DNS recheck failed",
          formatErrorBody(result.data) ?? err.message,
        );
        return;
      }
      toastOk("DNS recheck requested", "All domains are being rechecked.");
      await load(offset, limit);
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setRecheckingAll(false);
    }
  }

  async function recheckDomain(item: AdminDomain) {
    if (isRecheckingDomain(item.id)) return;
    setDomainRechecking(item.id, true);
    try {
      const result = await recheckDomainDns(item.id);
      if (isUnauthorized(result)) {
        toastFail("Unauthorized", "Session expired.");
        return;
      }
      if (!result.ok) {
        const err = describeError(result, "DNS recheck failed.");
        toastFail(
          err.isRateLimited ? "Rate limited" : "DNS recheck failed",
          formatErrorBody(result.data) ?? err.message,
        );
        return;
      }
      toastOk("DNS recheck requested", item.name);
      await load(offset, limit);
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDomainRechecking(item.id, false);
    }
  }

  async function bulkSetActive(items: AdminDomain[], active: boolean) {
    if (!items.length) return;
    setBulkBusy(true);
    let ok = 0;
    let fail = 0;
    await Promise.all(
      items.map(async (item) => {
        try {
          const r = await updateDomain(item.id, { active: boolToApi(active) });
          if (r.ok) ok += 1;
          else fail += 1;
        } catch {
          fail += 1;
        }
      }),
    );
    setBulkBusy(false);
    if (ok) toastOk(active ? "Domains activated" : "Domains deactivated", `${ok} updated`);
    if (fail) toastFail("Some updates failed", `${fail} could not be updated`);
    await load(offset, limit);
  }

  const hasActiveFilters =
    Boolean(search.trim()) || activeFilter !== "all" || visibleFilter !== "all";

  return {
    domains,
    pageActiveCount,
    pageEmailDnsCount,
    pageUiDnsCount,
    pageVisibleCount,
    search,
    setSearch: (v: string) => setField("q", v),
    activeFilter,
    setActiveFilter: (v: BoolFilter) => patch({ active: v, offset: "0" }),
    visibleFilter,
    setVisibleFilter: (v: BoolFilter) => patch({ visible: v, offset: "0" }),
    hasActiveFilters,
    clearFilters: reset,
    refresh: () => void load(offset, limit),
    setPageOffset: (v: number) => setField("offset", String(Math.max(0, v))),
    setPageSize: (v: number) => patch({ limit: String(v), offset: "0" }),
    toggleActive,
    toggleVisible,
    bulkSetActive,
    bulkBusy,
    editorOpen,
    setEditorOpen,
    editorBusy,
    formId,
    formName,
    setFormName,
    formActive,
    setFormActive,
    formVisible,
    setFormVisible,
    openCreate,
    openEdit,
    submitEditor,
    deleteTarget,
    setDeleteTarget,
    deleteBusy,
    askDelete,
    confirmDelete,
    isTrueValue,
    readVisibleValue,
    recheckingAll,
    recheckAllDns,
    isRecheckingDomain,
    recheckDomain,
  };
}
