"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { AdminApiToken, TokenStatusFilter, ListState } from "@/features/dashboard/types/admin.types";
import {
  fetchApiTokens, createApiToken, updateApiToken, deleteApiToken, isUnauthorized, describeError,
} from "@/features/dashboard/services/api-tokens.service";

const DEFAULT_LIMIT = 10;

function mk(): ListState<AdminApiToken> {
  return { items: [], total: 0, limit: DEFAULT_LIMIT, offset: 0, loading: false, loadedAt: null, error: null };
}

function ok(t: string, d?: string) { toast.success(t, { description: d, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> }); }
function fail(t: string, d?: string) { toast.error(t, { description: d, icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> }); }

function dateTimeLocalToIso(v: string) { if (!v) return null; const p = Date.parse(v); if (Number.isNaN(p)) return null; return new Date(p).toISOString(); }
function isoToDateTimeLocal(v?: string | null) {
  if (!v) return "";
  const p = Date.parse(v); if (Number.isNaN(p)) return "";
  const d = new Date(p);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function useApiTokensController() {
  const [list, setList] = React.useState<ListState<AdminApiToken>>(mk);
  const [statusFilter, setStatusFilter] = React.useState<TokenStatusFilter>("all");
  const [ownerSearch, setOwnerSearch] = React.useState("");

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

  const load = React.useCallback(async (offset = 0) => {
    setList((s) => ({ ...s, loading: true, error: null }));
    try {
      const r = await fetchApiTokens({
        limit: DEFAULT_LIMIT, offset, status: statusFilter,
        owner_email: ownerSearch.trim().toLowerCase() || undefined,
      });
      if (isUnauthorized(r)) { setList((s) => ({ ...s, loading: false, error: "Unauthorized" })); fail("Unauthorized"); return; }
      if (!r.ok) { const e = describeError(r, "Failed to load API tokens."); setList((s) => ({ ...s, loading: false, error: e.message })); fail(e.isRateLimited ? "Rate limited" : "Load failed", e.message); return; }
      const items = Array.isArray(r.data?.items) ? r.data.items : [];
      const pg = r.data?.pagination;
      setList({ items, total: pg?.total ?? items.length, limit: pg?.limit ?? DEFAULT_LIMIT, offset: pg?.offset ?? offset, loading: false, loadedAt: Date.now(), error: null });
    } catch (e) { const m = e instanceof Error ? e.message : "Network error"; setList((s) => ({ ...s, loading: false, error: m })); fail("Network error", m); }
  }, [statusFilter, ownerSearch]);

  React.useEffect(() => { void load(0); }, [load]);

  const canPrev = list.offset > 0;
  const canNext = list.offset + list.limit < list.total;
  const goNext = () => void load(list.offset + list.limit);
  const goPrev = () => void load(Math.max(0, list.offset - list.limit));
  const refresh = () => void load(0);
  const rangeFrom = list.total === 0 ? 0 : list.offset + 1;
  const rangeTo = Math.min(list.offset + list.limit, list.total);

  function openCreate() {
    setFormId(null); setFormOwnerEmail(""); setFormDays("30"); setFormExpiresAt(""); setFormRevoked(false); setFormRevokedReason(""); setCreatedPlaintext(null);
    setEditorOpen(true);
  }
  function openEdit(item: AdminApiToken) {
    setFormId(item.id); setFormOwnerEmail(item.owner_email); setFormDays("30");
    setFormExpiresAt(isoToDateTimeLocal(item.expires_at)); setFormRevoked(Boolean(item.revoked_at)); setFormRevokedReason(item.revoked_reason ?? "");
    setCreatedPlaintext(null); setEditorOpen(true);
  }

  async function submitEditor(e: React.FormEvent) {
    e.preventDefault();
    const owner = formOwnerEmail.trim().toLowerCase();
    if (!owner) { fail("Validation", "Owner email is required."); return; }
    setEditorBusy(true);
    try {
      const isEdit = formId !== null;
      if (isEdit) {
        const body: Record<string, unknown> = { owner_email: owner };
        const expiresIso = dateTimeLocalToIso(formExpiresAt);
        if (formExpiresAt && !expiresIso) { fail("Validation", "Invalid expiration date."); setEditorBusy(false); return; }
        if (expiresIso) body.expires_at = expiresIso;
        body.revoked = formRevoked ? 1 : 0;
        if (formRevokedReason.trim()) body.revoked_reason = formRevokedReason.trim();
        const r = await updateApiToken(formId, body);
        if (isUnauthorized(r)) { fail("Unauthorized"); return; }
        if (!r.ok) { const err = describeError(r, "Update failed."); fail(err.isRateLimited ? "Rate limited" : "Error", err.message); return; }
        setEditorOpen(false); ok("API token updated", owner);
      } else {
        const days = Number.parseInt(formDays, 10);
        if (!Number.isFinite(days) || days < 1 || days > 90) { fail("Validation", "Days must be between 1 and 90."); setEditorBusy(false); return; }
        const r = await createApiToken({ owner_email: owner, days });
        if (isUnauthorized(r)) { fail("Unauthorized"); return; }
        if (!r.ok) { const err = describeError(r, "Create failed."); fail(err.isRateLimited ? "Rate limited" : "Error", err.message); return; }
        if (typeof r.data?.token === "string" && r.data.token) setCreatedPlaintext(r.data.token);
        setEditorOpen(false); ok("API token created", owner);
      }
      await load(formId !== null ? list.offset : 0);
    } catch (e) { fail("Network error", e instanceof Error ? e.message : "Unknown error"); }
    finally { setEditorBusy(false); }
  }

  function askDelete(item: AdminApiToken) { setDeleteTarget({ id: item.id, label: item.owner_email }); }
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteApiToken(deleteTarget.id);
      if (isUnauthorized(r)) { fail("Unauthorized"); return; }
      if (!r.ok) { const e = describeError(r, "Delete failed."); fail(e.isRateLimited ? "Rate limited" : "Error", e.message); return; }
      ok("API token deleted", deleteTarget.label); setDeleteTarget(null); await load(0);
    } catch (e) { fail("Network error", e instanceof Error ? e.message : "Unknown error"); }
    finally { setDeleteBusy(false); }
  }

  return {
    list, statusFilter, setStatusFilter, ownerSearch, setOwnerSearch,
    refresh, canPrev, canNext, goNext, goPrev, rangeFrom, rangeTo,
    editorOpen, setEditorOpen, editorBusy, formId,
    formOwnerEmail, setFormOwnerEmail, formDays, setFormDays,
    formExpiresAt, setFormExpiresAt, formRevoked, setFormRevoked, formRevokedReason, setFormRevokedReason,
    createdPlaintext, setCreatedPlaintext,
    openCreate, openEdit, submitEditor,
    deleteTarget, setDeleteTarget, deleteBusy, askDelete, confirmDelete,
  };
}
