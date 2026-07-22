"use client";

import * as React from "react";

import type { AdminDnsRequest, ListState } from "@/features/dashboard/types/admin.types";
import {
  fetchDnsRequests,
  createDnsRequest,
  updateDnsRequest,
  deleteDnsRequest,
  isUnauthorized,
  describeError,
} from "@/features/dashboard/services/dns-requests.service";
import { useDebouncedValue } from "@/features/dashboard/hooks/use-debounced-value";
import { useUrlQueryState } from "@/features/dashboard/hooks/use-url-query-state";
import {
  DEFAULT_PAGE_SIZE,
  createListState,
  toastFail,
  toastOk,
} from "@/features/dashboard/lib/admin-utils";

const FILTER_DEFAULTS = {
  q: "",
  type: "all",
  status: "all",
  limit: String(DEFAULT_PAGE_SIZE),
  offset: "0",
};

export function useDnsRequestsController() {
  const { state, setField, patch, reset } = useUrlQueryState(FILTER_DEFAULTS, [
    "q",
    "type",
    "status",
    "limit",
    "offset",
  ]);

  const search = state.q;
  const typeFilter = state.type || "all";
  const statusFilter = state.status || "all";
  const limit = Math.max(1, Number.parseInt(state.limit, 10) || DEFAULT_PAGE_SIZE);
  const offset = Math.max(0, Number.parseInt(state.offset, 10) || 0);
  const debouncedSearch = useDebouncedValue(search, 300);

  const [list, setList] = React.useState<ListState<AdminDnsRequest>>(() =>
    createListState(limit),
  );
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorBusy, setEditorBusy] = React.useState(false);
  const [formId, setFormId] = React.useState<number | null>(null);
  const [formTarget, setFormTarget] = React.useState("");
  const [formType, setFormType] = React.useState<"UI" | "EMAIL">("UI");
  const [formStatus, setFormStatus] = React.useState("PENDING");
  const [formJson, setFormJson] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);
  const [resultViewer, setResultViewer] = React.useState<{
    target: string;
    json: string;
  } | null>(null);
  const loadSeq = React.useRef(0);

  const load = React.useCallback(
    async (nextOffset = offset, nextLimit = limit) => {
      const seq = ++loadSeq.current;
      setList((s) => ({ ...s, loading: true, error: null }));
      try {
        const r = await fetchDnsRequests({
          limit: nextLimit,
          offset: nextOffset,
          type: typeFilter,
          status: statusFilter,
          target: debouncedSearch.trim().toLowerCase() || undefined,
        });
        if (seq !== loadSeq.current) return;
        if (isUnauthorized(r)) {
          setList((s) => ({ ...s, loading: false, error: "Unauthorized" }));
          toastFail("Unauthorized");
          return;
        }
        if (!r.ok) {
          const e = describeError(r, "Failed to load DNS requests.");
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
    [debouncedSearch, limit, offset, statusFilter, typeFilter],
  );

  React.useEffect(() => {
    void load(offset, limit);
  }, [load, offset, limit]);

  const filterKey = `${debouncedSearch}|${typeFilter}|${statusFilter}|${limit}`;
  const prevFilterKey = React.useRef(filterKey);
  React.useEffect(() => {
    if (prevFilterKey.current === filterKey) return;
    prevFilterKey.current = filterKey;
    if (offset !== 0) setField("offset", "0");
  }, [filterKey, offset, setField]);

  const pageVerifiedCount = list.items.filter((i) => i.status === "VERIFIED").length;
  const pagePendingCount = list.items.filter((i) => i.status === "PENDING").length;
  const pageFailedCount = list.items.filter((i) => i.status === "FAILED").length;

  function openCreate() {
    setFormId(null);
    setFormTarget("");
    setFormType("UI");
    setFormStatus("PENDING");
    setFormJson("");
    setEditorOpen(true);
  }

  function openEdit(item: AdminDnsRequest) {
    setFormId(item.id);
    setFormTarget(item.target);
    setFormType(item.type);
    setFormStatus(item.status);
    setFormJson(
      item.last_check_result_json
        ? JSON.stringify(item.last_check_result_json, null, 2)
        : "",
    );
    setEditorOpen(true);
  }

  function openResult(item: AdminDnsRequest) {
    if (!item.last_check_result_json) {
      toastFail("No result", "This request has no check result JSON yet.");
      return;
    }
    setResultViewer({
      target: item.target,
      json: JSON.stringify(item.last_check_result_json, null, 2),
    });
  }

  async function submitEditor(e: React.FormEvent) {
    e.preventDefault();
    const target = formTarget.trim().toLowerCase();
    if (!target) {
      toastFail("Validation", "Target domain is required.");
      return;
    }
    const body: Record<string, unknown> = {
      target,
      type: formType,
      status: formStatus.toUpperCase(),
    };
    if (formJson.trim()) {
      try {
        body.last_check_result_json = JSON.parse(formJson);
      } catch {
        toastFail("Validation", "Invalid JSON in check result field.");
        return;
      }
    } else {
      body.last_check_result_json = null;
    }
    setEditorBusy(true);
    try {
      const isEdit = formId !== null;
      const r = isEdit
        ? await updateDnsRequest(formId, body)
        : await createDnsRequest(body);
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
      toastOk(isEdit ? "DNS request updated" : "DNS request created", target);
      await load(isEdit ? offset : 0, limit);
      if (!isEdit) setField("offset", "0");
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setEditorBusy(false);
    }
  }

  function askDelete(item: AdminDnsRequest) {
    setDeleteTarget({ id: item.id, label: item.target });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteDnsRequest(deleteTarget.id);
      if (isUnauthorized(r)) {
        toastFail("Unauthorized");
        return;
      }
      if (!r.ok) {
        const e = describeError(r, "Delete failed.");
        toastFail(e.isRateLimited ? "Rate limited" : "Error", e.message);
        return;
      }
      toastOk("DNS request deleted", deleteTarget.label);
      setDeleteTarget(null);
      await load(0, limit);
      setField("offset", "0");
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDeleteBusy(false);
    }
  }

  const hasActiveFilters =
    Boolean(search.trim()) || typeFilter !== "all" || statusFilter !== "all";

  return {
    list,
    pageVerifiedCount,
    pagePendingCount,
    pageFailedCount,
    search,
    setSearch: (v: string) => setField("q", v),
    typeFilter,
    setTypeFilter: (v: string) => patch({ type: v, offset: "0" }),
    statusFilter,
    setStatusFilter: (v: string) => patch({ status: v, offset: "0" }),
    hasActiveFilters,
    clearFilters: reset,
    refresh: () => void load(offset, limit),
    setPageOffset: (v: number) => setField("offset", String(Math.max(0, v))),
    setPageSize: (v: number) => patch({ limit: String(v), offset: "0" }),
    editorOpen,
    setEditorOpen,
    editorBusy,
    formId,
    formTarget,
    setFormTarget,
    formType,
    setFormType,
    formStatus,
    setFormStatus,
    formJson,
    setFormJson,
    openCreate,
    openEdit,
    openResult,
    resultViewer,
    setResultViewer,
    submitEditor,
    deleteTarget,
    setDeleteTarget,
    deleteBusy,
    askDelete,
    confirmDelete,
  };
}
