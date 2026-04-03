"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { AdminUser, BoolFilter, ListState } from "@/features/dashboard/types/admin.types";
import {
  fetchUsers, createUser, updateUser, deleteUser, isUnauthorized, describeError,
} from "@/features/dashboard/services/users.service";

const DEFAULT_LIMIT = 10;

function mk(): ListState<AdminUser> {
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

export function useUsersController() {
  const [list, setList] = React.useState<ListState<AdminUser>>(mk);
  const [activeFilter, setActiveFilter] = React.useState<BoolFilter>("all");
  const [search, setSearch] = React.useState("");

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorBusy, setEditorBusy] = React.useState(false);
  const [formId, setFormId] = React.useState<number | null>(null);
  const [formUsername, setFormUsername] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formPassword, setFormPassword] = React.useState("");
  const [formActive, setFormActive] = React.useState(true);
  const [formIsAdmin, setFormIsAdmin] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; label: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);

  /* ── derived ── */
  const filteredItems = list.items;
  const activeCount = React.useMemo(() => list.items.reduce((n, u) => n + (isTrueValue(u.is_active) ? 1 : 0), 0), [list.items]);
  const inactiveCount = list.items.length - activeCount;
  const adminCount = React.useMemo(() => list.items.reduce((n, u) => n + (u.is_admin === true ? 1 : 0), 0), [list.items]);

  /* lockout protection */
  const hasCompleteSnapshot = activeFilter === "all" && list.offset === 0 && list.total <= list.limit;
  const isSingleActive = hasCompleteSnapshot && activeCount === 1;
  const isSoleActiveById = React.useCallback((id: number) => {
    if (!isSingleActive) return false;
    const u = list.items.find((i) => i.id === id);
    return Boolean(u && isTrueValue(u.is_active));
  }, [isSingleActive, list.items]);

  /* ── quick toggle ── */
  async function toggleActive(item: AdminUser) {
    const currentlyActive = isTrueValue(item.is_active);
    if (currentlyActive && isSoleActiveById(item.id)) {
      fail("Lockout protection", "Cannot disable the last active admin user.");
      return;
    }
    const newActive = !currentlyActive;

    // Optimistic update
    setList((s) => ({
      ...s,
      items: s.items.map((u) => (u.id === item.id ? { ...u, is_active: boolToApi(newActive) } : u)),
    }));

    try {
      const r = await updateUser(item.id, {
        username: item.username,
        email: item.email,
        is_active: boolToApi(newActive),
        is_admin: item.is_admin,
      });

      if (isUnauthorized(r)) {
        // Revert
        setList((s) => ({
          ...s,
          items: s.items.map((u) => (u.id === item.id ? { ...u, is_active: boolToApi(currentlyActive) } : u)),
        }));
        fail("Unauthorized", "Session expired.");
        return;
      }

      if (!r.ok) {
        // Revert
        setList((s) => ({
          ...s,
          items: s.items.map((u) => (u.id === item.id ? { ...u, is_active: boolToApi(currentlyActive) } : u)),
        }));
        const err = describeError(r, "Toggle failed.");
        fail(err.isRateLimited ? "Rate limited" : "Error", err.message);
        return;
      }

      ok(newActive ? "User activated" : "User deactivated", item.username || item.email);
    } catch (e) {
      // Revert
      setList((s) => ({
        ...s,
        items: s.items.map((u) => (u.id === item.id ? { ...u, is_active: boolToApi(currentlyActive) } : u)),
      }));
      fail("Network error", e instanceof Error ? e.message : "Unknown error");
    }
  }

  const load = React.useCallback(async (offset = 0) => {
    setList((s) => ({ ...s, loading: true, error: null }));
    try {
      const r = await fetchUsers({
        limit: DEFAULT_LIMIT, offset, active: activeFilter,
        email: search.trim().toLowerCase() || undefined,
      });
      if (isUnauthorized(r)) { setList((s) => ({ ...s, loading: false, error: "Unauthorized" })); fail("Unauthorized"); return; }
      if (!r.ok) { const e = describeError(r, "Failed to load users."); setList((s) => ({ ...s, loading: false, error: e.message })); fail(e.isRateLimited ? "Rate limited" : "Load failed", e.message); return; }
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

  function openCreate() {
    setFormId(null);
    setFormUsername("");
    setFormEmail("");
    setFormPassword("");
    setFormActive(true);
    setFormIsAdmin(false);
    setEditorOpen(true);
  }

  function openEdit(item: AdminUser) {
    setFormId(item.id);
    setFormUsername(item.username);
    setFormEmail(item.email);
    setFormPassword("");
    setFormActive(isTrueValue(item.is_active));
    setFormIsAdmin(item.is_admin);
    setEditorOpen(true);
  }

  async function submitEditor(e: React.FormEvent) {
    e.preventDefault();
    const username = formUsername.trim();
    const email = formEmail.trim().toLowerCase();
    if (!username) { fail("Validation", "Username is required."); return; }
    if (!email) { fail("Validation", "Email is required."); return; }
    const isEdit = formId !== null;
    if (isEdit && !formActive && isSoleActiveById(formId)) { fail("Lockout protection", "Cannot disable the last active admin user."); return; }
    if (!isEdit && formPassword.length < 6) { fail("Validation", "Password must have at least 6 characters."); return; }
    setEditorBusy(true);
    try {
      if (isEdit) {
        const body: Record<string, unknown> = { username, email, is_active: boolToApi(formActive), is_admin: formIsAdmin };
        if (formPassword.trim()) body.password = formPassword;
        const r = await updateUser(formId, body);
        if (isUnauthorized(r)) { fail("Unauthorized"); return; }
        if (!r.ok) { const err = describeError(r, "Update failed."); fail(err.isRateLimited ? "Rate limited" : "Error", err.message); return; }
        setEditorOpen(false); ok("User updated", username);
      } else {
        const r = await createUser({ username, email, password: formPassword, is_active: boolToApi(formActive), is_admin: formIsAdmin });
        if (isUnauthorized(r)) { fail("Unauthorized"); return; }
        if (!r.ok) { const err = describeError(r, "Create failed."); fail(err.isRateLimited ? "Rate limited" : "Error", err.message); return; }
        setEditorOpen(false); ok("User created", username);
      }
      await load(isEdit ? list.offset : 0);
    } catch (e) { fail("Network error", e instanceof Error ? e.message : "Unknown error"); }
    finally { setEditorBusy(false); }
  }

  function askDelete(item: AdminUser) {
    if (isSoleActiveById(item.id)) { fail("Lockout protection", "Cannot delete the last active admin user."); return; }
    setDeleteTarget({ id: item.id, label: item.username || item.email });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteUser(deleteTarget.id);
      if (isUnauthorized(r)) { fail("Unauthorized"); return; }
      if (!r.ok) { const e = describeError(r, "Delete failed."); fail(e.isRateLimited ? "Rate limited" : "Error", e.message); return; }
      ok("User deleted", deleteTarget.label); setDeleteTarget(null); await load(0);
    } catch (e) { fail("Network error", e instanceof Error ? e.message : "Unknown error"); }
    finally { setDeleteBusy(false); }
  }

  return {
    list, filteredItems, activeCount, inactiveCount, adminCount,
    activeFilter, setActiveFilter, search, setSearch,
    refresh, canPrev, canNext, goNext, goPrev, rangeFrom, rangeTo,
    toggleActive,
    editorOpen, setEditorOpen, editorBusy, formId,
    formUsername, setFormUsername,
    formEmail, setFormEmail, formPassword, setFormPassword,
    formActive, setFormActive, formIsAdmin, setFormIsAdmin,
    openCreate, openEdit, submitEditor,
    deleteTarget, setDeleteTarget, deleteBusy, askDelete, confirmDelete,
    isTrueValue, isSoleActiveById,
  };
}
