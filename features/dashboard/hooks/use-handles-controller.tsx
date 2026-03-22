"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { AdminHandle, BoolFilter, ListState } from "@/features/dashboard/types/admin.types";
import {
  fetchHandles, createHandle, updateHandle, deleteHandle, isUnauthorized, describeError,
} from "@/features/dashboard/services/handles.service";

const DEFAULT_LIMIT = 10;

function mk(): ListState<AdminHandle> {
  return { items: [], total: 0, limit: DEFAULT_LIMIT, offset: 0, loading: false, loadedAt: null, error: null };
}

function isTrueValue(v: unknown) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") { const n = v.trim().toLowerCase(); return n === "1" || n === "true"; }
  return false;
}

function boolToApi(v: boolean) { return v ? 1 : 0; }
function ok(t: string, d?: string) { toast.success(t, { description: d, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> }); }
function fail(t: string, d?: string) { toast.error(t, { description: d, icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> }); }

export function useHandlesController() {
  const [list, setList] = React.useState<ListState<AdminHandle>>(mk);
  const [activeFilter, setActiveFilter] = React.useState<BoolFilter>("all");
  const [search, setSearch] = React.useState("");

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorBusy, setEditorBusy] = React.useState(false);
  const [formId, setFormId] = React.useState<number | null>(null);
  const [formHandle, setFormHandle] = React.useState("");
  const [formAddress, setFormAddress] = React.useState("");
  const [formActive, setFormActive] = React.useState(true);

  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);

  const load = React.useCallback(async (offset = 0) => {
    setList((s) => ({ ...s, loading: true, error: null }));
    try {
      const r = await fetchHandles({
        limit: DEFAULT_LIMIT, offset, active: activeFilter,
        handle: search.trim().toLowerCase() || undefined,
      });
      if (isUnauthorized(r)) { setList((s) => ({ ...s, loading: false, error: "Unauthorized" })); fail("Unauthorized"); return; }
      if (!r.ok) { const e = describeError(r, "Failed to load handles."); setList((s) => ({ ...s, loading: false, error: e.message })); fail(e.isRateLimited ? "Rate limited" : "Load failed", e.message); return; }
      const items = Array.isArray(r.data?.items) ? r.data.items : [];
      const pg = r.data?.pagination;
      setList({ items, total: pg?.total ?? items.length, limit: pg?.limit ?? DEFAULT_LIMIT, offset: pg?.offset ?? offset, loading: false, loadedAt: Date.now(), error: null });
    } catch (e) { const m = e instanceof Error ? e.message : "Network error"; setList((s) => ({ ...s, loading: false, error: m })); fail("Network error", m); }
  }, [activeFilter, search]);

  React.useEffect(() => { void load(0); }, [load]);

  const canPrev = list.offset > 0;
  const canNext = list.offset + list.limit < list.total;
  const goNext = () => void load(list.offset + list.limit);
  const goPrev = () => void load(Math.max(0, list.offset - list.limit));
  const refresh = () => void load(0);
  const rangeFrom = list.total === 0 ? 0 : list.offset + 1;
  const rangeTo = Math.min(list.offset + list.limit, list.total);

  function openCreate() { setFormId(null); setFormHandle(""); setFormAddress(""); setFormActive(true); setEditorOpen(true); }
  function openEdit(item: AdminHandle) { setFormId(item.id); setFormHandle(item.handle); setFormAddress(item.address); setFormActive(isTrueValue(item.active)); setEditorOpen(true); }

  async function submitEditor(e: React.FormEvent) {
    e.preventDefault();
    const handle = formHandle.trim().toLowerCase();
    const address = formAddress.trim().toLowerCase();
    if (!handle) { fail("Validation", "Handle is required."); return; }
    if (!address) { fail("Validation", "Address is required."); return; }
    setEditorBusy(true);
    try {
      const isEdit = formId !== null;
      const body = { handle, address, active: boolToApi(formActive) };
      const r = isEdit ? await updateHandle(formId, body) : await createHandle(body);
      if (isUnauthorized(r)) { fail("Unauthorized"); return; }
      if (!r.ok) { const err = describeError(r, isEdit ? "Update failed." : "Create failed."); fail(err.isRateLimited ? "Rate limited" : "Error", err.message); return; }
      setEditorOpen(false); ok(isEdit ? "Handle updated" : "Handle created", `${handle} → ${address}`); await load(isEdit ? list.offset : 0);
    } catch (e) { fail("Network error", e instanceof Error ? e.message : "Unknown error"); }
    finally { setEditorBusy(false); }
  }

  function askDelete(item: AdminHandle) { setDeleteTarget({ id: item.id, label: item.handle }); }
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteHandle(deleteTarget.id);
      if (isUnauthorized(r)) { fail("Unauthorized"); return; }
      if (!r.ok) { const e = describeError(r, "Delete failed."); fail(e.isRateLimited ? "Rate limited" : "Error", e.message); return; }
      ok("Handle deleted", deleteTarget.label); setDeleteTarget(null); await load(0);
    } catch (e) { fail("Network error", e instanceof Error ? e.message : "Unknown error"); }
    finally { setDeleteBusy(false); }
  }

  return {
    list, activeFilter, setActiveFilter, search, setSearch,
    refresh, canPrev, canNext, goNext, goPrev, rangeFrom, rangeTo,
    editorOpen, setEditorOpen, editorBusy, formId, formHandle, setFormHandle, formAddress, setFormAddress, formActive, setFormActive,
    openCreate, openEdit, submitEditor,
    deleteTarget, setDeleteTarget, deleteBusy, askDelete, confirmDelete,
    isTrueValue,
  };
}
