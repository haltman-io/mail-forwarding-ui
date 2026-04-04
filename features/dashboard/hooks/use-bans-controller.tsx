"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { AdminBan, BoolFilter, BanType, ListState } from "@/features/dashboard/types/admin.types";
import {
  fetchBans, createBan, updateBan, deleteBan, isUnauthorized, describeError,
} from "@/features/dashboard/services/bans.service";

const DEFAULT_LIMIT = 10;

function mk(): ListState<AdminBan> {
  return { items: [], total: 0, limit: DEFAULT_LIMIT, offset: 0, loading: false, loadedAt: null, error: null };
}

function ok(t: string, d?: string) { toast.success(t, { description: d, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> }); }
function fail(t: string, d?: string) { toast.error(t, { description: d, icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> }); }

function dateTimeLocalToIso(v: string) { if (!v) return null; const p = Date.parse(v); if (Number.isNaN(p)) return null; return new Date(p).toISOString(); }
function isoToDateTimeLocal(v?: string | null) {
  if (!v) return "";
  const p = Date.parse(v);
  if (Number.isNaN(p)) return "";
  const d = new Date(p);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function useBansController() {
  const [list, setList] = React.useState<ListState<AdminBan>>(mk);
  const [activeFilter, setActiveFilter] = React.useState<BoolFilter>("all");
  const [typeFilter, setTypeFilter] = React.useState<"all" | BanType>("all");
  const [search, setSearch] = React.useState("");

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

  const load = React.useCallback(async (offset = 0) => {
    setList((s) => ({ ...s, loading: true, error: null }));
    try {
      const r = await fetchBans({
        limit: DEFAULT_LIMIT, offset, active: activeFilter,
        ban_type: typeFilter !== "all" ? typeFilter : undefined,
        ban_value: search.trim() || undefined,
      });
      if (isUnauthorized(r)) { setList((s) => ({ ...s, loading: false, error: "Unauthorized" })); fail("Unauthorized"); return; }
      if (!r.ok) { const e = describeError(r, "Failed to load bans."); setList((s) => ({ ...s, loading: false, error: e.message })); fail(e.isRateLimited ? "Rate limited" : "Load failed", e.message); return; }
      const items = Array.isArray(r.data?.items) ? r.data.items : [];
      const pg = r.data?.pagination;
      setList({ items, total: pg?.total ?? items.length, limit: pg?.limit ?? DEFAULT_LIMIT, offset: pg?.offset ?? offset, loading: false, loadedAt: Date.now(), error: null });
    } catch (e) { const m = e instanceof Error ? e.message : "Network error"; setList((s) => ({ ...s, loading: false, error: m })); fail("Network error", m); }
  }, [activeFilter, typeFilter, search]);

  React.useEffect(() => { void load(0); }, [load]);

  const canPrev = list.offset > 0;
  const canNext = list.offset + list.limit < list.total;
  const goNext = () => void load(list.offset + list.limit);
  const goPrev = () => void load(Math.max(0, list.offset - list.limit));
  const refresh = () => void load(0);
  const rangeFrom = list.total === 0 ? 0 : list.offset + 1;
  const rangeTo = Math.min(list.offset + list.limit, list.total);

  function openCreate() {
    setFormId(null); setFormType("email"); setFormValue(""); setFormReason(""); setFormExpiresAt(""); setFormRevoked(false); setFormRevokedReason(""); setFormDisableAliases(false);
    setEditorOpen(true);
  }
  function openEdit(item: AdminBan) {
    setFormId(item.id); setFormType((item.ban_type as BanType) || "email"); setFormValue(item.ban_value);
    setFormReason(item.reason ?? ""); setFormExpiresAt(isoToDateTimeLocal(item.expires_at));
    setFormRevoked(Boolean(item.revoked_at)); setFormRevokedReason(item.revoked_reason ?? ""); setFormDisableAliases(false);
    setEditorOpen(true);
  }

  async function submitEditor(e: React.FormEvent) {
    e.preventDefault();
    const value = formValue.trim();
    if (!value) { fail("Validation", "Ban value is required."); return; }
    const expiresIso = dateTimeLocalToIso(formExpiresAt);
    if (formExpiresAt && !expiresIso) { fail("Validation", "Invalid expiration date."); return; }
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
      if (isUnauthorized(r)) { fail("Unauthorized"); return; }
      if (!r.ok) { const err = describeError(r, isEdit ? "Update failed." : "Create failed."); fail(err.isRateLimited ? "Rate limited" : "Error", err.message); return; }
      const desc = r.data?.message ?? `${formType}:${value}`;
      setEditorOpen(false); ok(isEdit ? "Ban updated" : "Ban created", desc); await load(isEdit ? list.offset : 0);
    } catch (e) { fail("Network error", e instanceof Error ? e.message : "Unknown error"); }
    finally { setEditorBusy(false); }
  }

  function askDelete(item: AdminBan) { setDeleteTarget({ id: item.id, label: `${item.ban_type}:${item.ban_value}` }); }
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteBan(deleteTarget.id);
      if (isUnauthorized(r)) { fail("Unauthorized"); return; }
      if (!r.ok) { const e = describeError(r, "Delete failed."); fail(e.isRateLimited ? "Rate limited" : "Error", e.message); return; }
      ok("Ban deleted", deleteTarget.label); setDeleteTarget(null); await load(0);
    } catch (e) { fail("Network error", e instanceof Error ? e.message : "Unknown error"); }
    finally { setDeleteBusy(false); }
  }

  const filteredItems = list.items;

  const activeCount = React.useMemo(
    () => list.items.filter((item) => !item.revoked_at).length,
    [list.items],
  );
  const inactiveCount = React.useMemo(
    () => list.items.filter((item) => !!item.revoked_at).length,
    [list.items],
  );

  const typeCounts = React.useMemo(() => {
    const counts: Record<string, number> = { email: 0, domain: 0, ip: 0, name: 0 };
    for (const item of list.items) {
      const t = item.ban_type;
      if (t in counts) counts[t]++;
    }
    return counts;
  }, [list.items]);

  return {
    list, activeFilter, setActiveFilter, typeFilter, setTypeFilter, search, setSearch,
    refresh, canPrev, canNext, goNext, goPrev, rangeFrom, rangeTo,
    filteredItems, activeCount, inactiveCount, typeCounts,
    editorOpen, setEditorOpen, editorBusy, formId,
    formType, setFormType, formValue, setFormValue, formReason, setFormReason,
    formExpiresAt, setFormExpiresAt, formRevoked, setFormRevoked, formRevokedReason, setFormRevokedReason,
    formDisableAliases, setFormDisableAliases,
    openCreate, openEdit, submitEditor,
    deleteTarget, setDeleteTarget, deleteBusy, askDelete, confirmDelete,
  };
}
