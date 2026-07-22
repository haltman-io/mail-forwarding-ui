"use client";

import * as React from "react";

import type { AdminUser, BoolFilter, ListState } from "@/features/dashboard/types/admin.types";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  isUnauthorized,
  describeError,
} from "@/features/dashboard/services/users.service";
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

export type UserSearchField = "email" | "username";

const FILTER_DEFAULTS = {
  q: "",
  field: "email" as UserSearchField,
  active: "all" as BoolFilter,
  limit: String(DEFAULT_PAGE_SIZE),
  offset: "0",
};

export function useUsersController() {
  const { state, setField, patch, reset } = useUrlQueryState(FILTER_DEFAULTS, [
    "q",
    "field",
    "active",
    "limit",
    "offset",
  ]);

  const search = state.q;
  const searchField = (state.field === "username" ? "username" : "email") as UserSearchField;
  const activeFilter = (["all", "1", "0"].includes(state.active)
    ? state.active
    : "all") as BoolFilter;
  const limit = Math.max(1, Number.parseInt(state.limit, 10) || DEFAULT_PAGE_SIZE);
  const offset = Math.max(0, Number.parseInt(state.offset, 10) || 0);
  const debouncedSearch = useDebouncedValue(search, 300);

  const [list, setList] = React.useState<ListState<AdminUser>>(() => createListState(limit));
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
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const loadSeq = React.useRef(0);

  const load = React.useCallback(
    async (nextOffset = offset, nextLimit = limit) => {
      const seq = ++loadSeq.current;
      setList((s) => ({ ...s, loading: true, error: null }));
      try {
        const q = debouncedSearch.trim().toLowerCase();
        const r = await fetchUsers({
          limit: nextLimit,
          offset: nextOffset,
          active: activeFilter,
          email: q && searchField === "email" ? q : undefined,
          username: q && searchField === "username" ? q : undefined,
        });
        if (seq !== loadSeq.current) return;
        if (isUnauthorized(r)) {
          setList((s) => ({ ...s, loading: false, error: "Unauthorized" }));
          toastFail("Unauthorized");
          return;
        }
        if (!r.ok) {
          const e = describeError(r, "Failed to load users.");
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

  const pageActiveCount = React.useMemo(
    () => list.items.reduce((n, u) => n + (isTrueValue(u.is_active) ? 1 : 0), 0),
    [list.items],
  );
  const pageAdminCount = React.useMemo(
    () => list.items.reduce((n, u) => n + (u.is_admin === true ? 1 : 0), 0),
    [list.items],
  );

  const hasCompleteSnapshot =
    activeFilter === "all" &&
    !debouncedSearch.trim() &&
    list.offset === 0 &&
    list.total <= list.limit;
  const isSingleActive = hasCompleteSnapshot && pageActiveCount === 1;
  const isSoleActiveById = React.useCallback(
    (id: number) => {
      if (!isSingleActive) return false;
      const u = list.items.find((i) => i.id === id);
      return Boolean(u && isTrueValue(u.is_active));
    },
    [isSingleActive, list.items],
  );

  async function toggleActive(item: AdminUser) {
    const currentlyActive = isTrueValue(item.is_active);
    if (currentlyActive && isSoleActiveById(item.id)) {
      toastFail("Lockout protection", "Cannot disable the last active admin user.");
      return;
    }
    const newActive = !currentlyActive;
    setList((s) => ({
      ...s,
      items: s.items.map((u) =>
        u.id === item.id ? { ...u, is_active: boolToApi(newActive) } : u,
      ),
    }));
    try {
      const r = await updateUser(item.id, {
        username: item.username,
        email: item.email,
        is_active: boolToApi(newActive),
        is_admin: item.is_admin,
      });
      if (!r.ok || isUnauthorized(r)) {
        setList((s) => ({
          ...s,
          items: s.items.map((u) =>
            u.id === item.id ? { ...u, is_active: boolToApi(currentlyActive) } : u,
          ),
        }));
        if (isUnauthorized(r)) toastFail("Unauthorized", "Session expired.");
        else {
          const err = describeError(r, "Toggle failed.");
          toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
        }
        return;
      }
      toastOk(newActive ? "User activated" : "User deactivated", item.username || item.email);
    } catch (e) {
      setList((s) => ({
        ...s,
        items: s.items.map((u) =>
          u.id === item.id ? { ...u, is_active: boolToApi(currentlyActive) } : u,
        ),
      }));
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    }
  }

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
    if (!username) {
      toastFail("Validation", "Username is required.");
      return;
    }
    if (!email) {
      toastFail("Validation", "Email is required.");
      return;
    }
    const isEdit = formId !== null;
    if (isEdit && !formActive && isSoleActiveById(formId)) {
      toastFail("Lockout protection", "Cannot disable the last active admin user.");
      return;
    }
    if (!isEdit && formPassword.length < 6) {
      toastFail("Validation", "Password must have at least 6 characters.");
      return;
    }
    setEditorBusy(true);
    try {
      if (isEdit) {
        const body: Record<string, unknown> = {
          username,
          email,
          is_active: boolToApi(formActive),
          is_admin: formIsAdmin,
        };
        if (formPassword.trim()) body.password = formPassword;
        const r = await updateUser(formId, body);
        if (isUnauthorized(r)) {
          toastFail("Unauthorized");
          return;
        }
        if (!r.ok) {
          const err = describeError(r, "Update failed.");
          toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
          return;
        }
        setEditorOpen(false);
        toastOk("User updated", username);
      } else {
        const r = await createUser({
          username,
          email,
          password: formPassword,
          is_active: boolToApi(formActive),
          is_admin: formIsAdmin,
        });
        if (isUnauthorized(r)) {
          toastFail("Unauthorized");
          return;
        }
        if (!r.ok) {
          const err = describeError(r, "Create failed.");
          toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
          return;
        }
        setEditorOpen(false);
        toastOk("User created", username);
      }
      await load(isEdit ? offset : 0, limit);
      if (!isEdit) setField("offset", "0");
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setEditorBusy(false);
    }
  }

  function askDelete(item: AdminUser) {
    if (isSoleActiveById(item.id)) {
      toastFail("Lockout protection", "Cannot delete the last active admin user.");
      return;
    }
    setDeleteTarget({ id: item.id, label: item.username || item.email });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteUser(deleteTarget.id);
      if (isUnauthorized(r)) {
        toastFail("Unauthorized");
        return;
      }
      if (!r.ok) {
        const e = describeError(r, "Delete failed.");
        toastFail(e.isRateLimited ? "Rate limited" : "Error", e.message);
        return;
      }
      toastOk("User deleted", deleteTarget.label);
      setDeleteTarget(null);
      await load(0, limit);
      setField("offset", "0");
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDeleteBusy(false);
    }
  }

  async function bulkSetActive(items: AdminUser[], active: boolean) {
    if (!items.length) return;
    setBulkBusy(true);
    let ok = 0;
    let fail = 0;
    await Promise.all(
      items.map(async (item) => {
        if (!active && isSoleActiveById(item.id)) {
          fail += 1;
          return;
        }
        try {
          const r = await updateUser(item.id, {
            username: item.username,
            email: item.email,
            is_active: boolToApi(active),
            is_admin: item.is_admin,
          });
          if (r.ok) ok += 1;
          else fail += 1;
        } catch {
          fail += 1;
        }
      }),
    );
    setBulkBusy(false);
    if (ok) toastOk(active ? "Users activated" : "Users deactivated", `${ok} updated`);
    if (fail) toastFail("Some updates failed", `${fail} could not be updated`);
    await load(offset, limit);
  }

  const hasActiveFilters =
    Boolean(search.trim()) || activeFilter !== "all" || searchField !== "email";

  return {
    list,
    pageActiveCount,
    pageAdminCount,
    search,
    setSearch: (v: string) => setField("q", v),
    searchField,
    setSearchField: (v: UserSearchField) => patch({ field: v, offset: "0" }),
    activeFilter,
    setActiveFilter: (v: BoolFilter) => patch({ active: v, offset: "0" }),
    hasActiveFilters,
    clearFilters: reset,
    refresh: () => void load(offset, limit),
    setPageOffset: (v: number) => setField("offset", String(Math.max(0, v))),
    setPageSize: (v: number) => patch({ limit: String(v), offset: "0" }),
    toggleActive,
    bulkSetActive,
    bulkBusy,
    editorOpen,
    setEditorOpen,
    editorBusy,
    formId,
    formUsername,
    setFormUsername,
    formEmail,
    setFormEmail,
    formPassword,
    setFormPassword,
    formActive,
    setFormActive,
    formIsAdmin,
    setFormIsAdmin,
    openCreate,
    openEdit,
    submitEditor,
    deleteTarget,
    setDeleteTarget,
    deleteBusy,
    askDelete,
    confirmDelete,
    isTrueValue,
    isSoleActiveById,
  };
}
