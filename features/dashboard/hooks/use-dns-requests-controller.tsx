"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { AdminDnsRequest, ListState } from "@/features/dashboard/types/admin.types";
import {
  fetchDnsRequests,
  createDnsRequest,
  updateDnsRequest,
  deleteDnsRequest,
  isUnauthorized,
  describeError,
} from "@/features/dashboard/services/dns-requests.service";

const DEFAULT_LIMIT = 10;

function mk(): ListState<AdminDnsRequest> {
  return { items: [], total: 0, limit: DEFAULT_LIMIT, offset: 0, loading: false, loadedAt: null, error: null };
}

function ok(t: string, d?: string) { toast.success(t, { description: d, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> }); }
function fail(t: string, d?: string) { toast.error(t, { description: d, icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> }); }

export function useDnsRequestsController() {
  const [list, setList] = React.useState<ListState<AdminDnsRequest>>(mk);
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const filteredItems = React.useMemo(() => {
    if (!search.trim()) return list.items;
    const q = search.trim().toLowerCase();
    return list.items.filter((item) => item.target.toLowerCase().includes(q));
  }, [list.items, search]);

  const verifiedCount = React.useMemo(() => list.items.filter((i) => i.status === "VERIFIED").length, [list.items]);
  const pendingCount = React.useMemo(() => list.items.filter((i) => i.status === "PENDING").length, [list.items]);
  const failedCount = React.useMemo(() => list.items.filter((i) => i.status === "FAILED").length, [list.items]);

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorBusy, setEditorBusy] = React.useState(false);
  const [formId, setFormId] = React.useState<number | null>(null);
  const [formTarget, setFormTarget] = React.useState("");
  const [formType, setFormType] = React.useState<"UI" | "EMAIL">("UI");
  const [formStatus, setFormStatus] = React.useState("PENDING");
  const [formJson, setFormJson] = React.useState("");

  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);

  const load = React.useCallback(async (offset = 0) => {
    setList((s) => ({ ...s, loading: true, error: null }));
    try {
      const r = await fetchDnsRequests({
        limit: DEFAULT_LIMIT, offset, type: typeFilter, status: statusFilter,
      });
      if (isUnauthorized(r)) { setList((s) => ({ ...s, loading: false, error: "Unauthorized" })); fail("Unauthorized"); return; }
      if (!r.ok) { const e = describeError(r, "Failed to load DNS requests."); setList((s) => ({ ...s, loading: false, error: e.message })); fail(e.isRateLimited ? "Rate limited" : "Load failed", e.message); return; }
      const items = Array.isArray(r.data?.items) ? r.data.items : [];
      const pg = r.data?.pagination;
      setList({ items, total: pg?.total ?? items.length, limit: pg?.limit ?? DEFAULT_LIMIT, offset: pg?.offset ?? offset, loading: false, loadedAt: Date.now(), error: null });
    } catch (e) { const m = e instanceof Error ? e.message : "Network error"; setList((s) => ({ ...s, loading: false, error: m })); fail("Network error", m); }
  }, [typeFilter, statusFilter]);

  React.useEffect(() => { void load(0); }, [load]);

  const canPrev = list.offset > 0;
  const canNext = list.offset + list.limit < list.total;
  const goNext = () => void load(list.offset + list.limit);
  const goPrev = () => void load(Math.max(0, list.offset - list.limit));
  const refresh = () => void load(0);
  const rangeFrom = list.total === 0 ? 0 : list.offset + 1;
  const rangeTo = Math.min(list.offset + list.limit, list.total);

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
    setFormJson(item.last_check_result_json ? JSON.stringify(item.last_check_result_json, null, 2) : "");
    setEditorOpen(true);
  }

  async function submitEditor(e: React.FormEvent) {
    e.preventDefault();
    const target = formTarget.trim().toLowerCase();
    if (!target) { fail("Validation", "Target domain is required."); return; }

    const body: Record<string, unknown> = { target, type: formType, status: formStatus.toUpperCase() };

    if (formJson.trim()) {
      try {
        body.last_check_result_json = JSON.parse(formJson);
      } catch {
        fail("Validation", "Invalid JSON in check result field."); return;
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

      if (isUnauthorized(r)) { fail("Unauthorized"); return; }
      if (!r.ok) { const err = describeError(r, isEdit ? "Update failed." : "Create failed."); fail(err.isRateLimited ? "Rate limited" : "Error", err.message); return; }

      setEditorOpen(false);
      ok(isEdit ? "DNS request updated" : "DNS request created", target);
      await load(isEdit ? list.offset : 0);
    } catch (e) { fail("Network error", e instanceof Error ? e.message : "Unknown error"); }
    finally { setEditorBusy(false); }
  }

  function askDelete(item: AdminDnsRequest) {
    setDeleteTarget({ id: item.id, label: item.target });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteDnsRequest(deleteTarget.id);
      if (isUnauthorized(r)) { fail("Unauthorized"); return; }
      if (!r.ok) { const e = describeError(r, "Delete failed."); fail(e.isRateLimited ? "Rate limited" : "Error", e.message); return; }
      ok("DNS request deleted", deleteTarget.label); setDeleteTarget(null); await load(0);
    } catch (e) { fail("Network error", e instanceof Error ? e.message : "Unknown error"); }
    finally { setDeleteBusy(false); }
  }

  return {
    list, filteredItems, search, setSearch,
    verifiedCount, pendingCount, failedCount,
    typeFilter, setTypeFilter, statusFilter, setStatusFilter,
    refresh, canPrev, canNext, goNext, goPrev, rangeFrom, rangeTo,
    editorOpen, setEditorOpen, editorBusy, formId,
    formTarget, setFormTarget, formType, setFormType,
    formStatus, setFormStatus, formJson, setFormJson,
    openCreate, openEdit, submitEditor,
    deleteTarget, setDeleteTarget, deleteBusy, askDelete, confirmDelete,
  };
}
