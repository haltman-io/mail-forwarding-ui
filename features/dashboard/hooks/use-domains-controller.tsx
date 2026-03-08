"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type {
  AdminDomain,
  BoolFilter,
  ListState,
  ListResponse,
  CreateUpdateResponse,
} from "@/features/dashboard/types/domains.types";
import {
  fetchDomains,
  createDomain,
  updateDomain,
  deleteDomain,
  isUnauthorized,
  describeError,
} from "@/features/dashboard/services/domains.service";

const DEFAULT_LIMIT = 10;

function createListState(): ListState<AdminDomain> {
  return { items: [], total: 0, limit: DEFAULT_LIMIT, offset: 0, loading: false, loadedAt: null, error: null };
}

function isTrueValue(v: unknown) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const n = v.trim().toLowerCase();
    return n === "1" || n === "true" || n === "yes" || n === "on";
  }
  return false;
}

function boolToApi(v: boolean) {
  return v ? 1 : 0;
}

function toastOk(title: string, description?: string) {
  toast.success(title, { description, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> });
}
function toastFail(title: string, description?: string) {
  toast.error(title, { description, icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> });
}

export function useDomainsController(token: string | null) {
  const [domains, setDomains] = React.useState<ListState<AdminDomain>>(createListState);
  const [activeFilter, setActiveFilter] = React.useState<BoolFilter>("all");

  /* editor dialog */
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorBusy, setEditorBusy] = React.useState(false);
  const [formId, setFormId] = React.useState<number | null>(null);
  const [formName, setFormName] = React.useState("");
  const [formActive, setFormActive] = React.useState(true);

  /* delete dialog */
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; name: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);

  /* ── load ── */
  const load = React.useCallback(
    async (offset = 0) => {
      if (!token) return;
      setDomains((s) => ({ ...s, loading: true, error: null }));

      try {
        const result = await fetchDomains(token, {
          limit: DEFAULT_LIMIT,
          offset,
          active: activeFilter,
        });

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
          limit: typeof pg?.limit === "number" ? pg.limit : DEFAULT_LIMIT,
          offset: typeof pg?.offset === "number" ? pg.offset : offset,
          loading: false,
          loadedAt: Date.now(),
          error: null,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Network error";
        setDomains((s) => ({ ...s, loading: false, error: msg }));
        toastFail("Network error", msg);
      }
    },
    [token, activeFilter],
  );

  /* auto-load on filter change */
  React.useEffect(() => {
    void load(0);
  }, [load]);

  /* ── pagination ── */
  const canPrev = domains.offset > 0;
  const canNext = domains.offset + domains.limit < domains.total;
  const goNext = () => void load(domains.offset + domains.limit);
  const goPrev = () => void load(Math.max(0, domains.offset - domains.limit));
  const refresh = () => void load(0);
  const rangeFrom = domains.total === 0 ? 0 : domains.offset + 1;
  const rangeTo = Math.min(domains.offset + domains.limit, domains.total);

  /* ── editor ── */
  function openCreate() {
    setFormId(null);
    setFormName("");
    setFormActive(true);
    setEditorOpen(true);
  }

  function openEdit(item: AdminDomain) {
    setFormId(item.id);
    setFormName(item.name);
    setFormActive(isTrueValue(item.active));
    setEditorOpen(true);
  }

  async function submitEditor(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    const name = formName.trim().toLowerCase();
    if (!name) {
      toastFail("Validation", "Domain name is required.");
      return;
    }

    setEditorBusy(true);
    try {
      const isEdit = formId !== null;
      const body = { name, active: boolToApi(formActive) };
      const result = isEdit
        ? await updateDomain(token, formId, body)
        : await createDomain(token, body);

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
      await load(isEdit ? domains.offset : 0);
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setEditorBusy(false);
    }
  }

  /* ── delete ── */
  function askDelete(item: AdminDomain) {
    setDeleteTarget({ id: item.id, name: item.name });
  }

  async function confirmDelete() {
    if (!token || !deleteTarget) return;
    setDeleteBusy(true);
    try {
      const result = await deleteDomain(token, deleteTarget.id);

      if (isUnauthorized(result)) {
        toastFail("Unauthorized", "Session expired.");
        return;
      }

      if (!result.ok) {
        const err = describeError(result, "Delete failed.");
        toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
        return;
      }

      toastOk("Domain deleted", deleteTarget.name);
      setDeleteTarget(null);
      await load(0);
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDeleteBusy(false);
    }
  }

  return {
    domains,
    activeFilter,
    setActiveFilter,
    load,
    refresh,
    canPrev,
    canNext,
    goNext,
    goPrev,
    rangeFrom,
    rangeTo,
    editorOpen,
    setEditorOpen,
    editorBusy,
    formId,
    formName,
    setFormName,
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
