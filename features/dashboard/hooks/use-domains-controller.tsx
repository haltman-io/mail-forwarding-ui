"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

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

const DEFAULT_LIMIT = 10;

type DomainFormSnapshot = {
  name: string;
  active: boolean;
  visible: boolean;
};

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

function readVisibleValue(item: AdminDomain) {
  return item.visible === undefined || item.visible === null ? true : isTrueValue(item.visible);
}

function formatErrorBody(data: unknown) {
  if (data == null) return null;
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data);
  } catch {
    return null;
  }
}

function toastOk(title: string, description?: string) {
  toast.success(title, { description, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> });
}
function toastFail(title: string, description?: string) {
  toast.error(title, { description, icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> });
}

export function useDomainsController() {
  const [domains, setDomains] = React.useState<ListState<AdminDomain>>(createListState);
  const [activeFilter, setActiveFilter] = React.useState<BoolFilter>("all");
  const [visibleFilter, setVisibleFilter] = React.useState<BoolFilter>("all");

  /* editor dialog */
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorBusy, setEditorBusy] = React.useState(false);
  const [formId, setFormId] = React.useState<number | null>(null);
  const [formName, setFormName] = React.useState("");
  const [formActive, setFormActive] = React.useState(true);
  const [formVisible, setFormVisible] = React.useState(true);
  const [formInitial, setFormInitial] = React.useState<DomainFormSnapshot | null>(null);

  /* search */
  const [search, setSearch] = React.useState("");

  /* delete dialog */
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: number; name: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);

  /* DNS recheck */
  const [recheckingAll, setRecheckingAll] = React.useState(false);
  const [recheckingIds, setRecheckingIds] = React.useState<Set<number>>(() => new Set());

  /* ── load ── */
  const load = React.useCallback(
    async (offset = 0) => {
      setDomains((s) => ({ ...s, loading: true, error: null }));

      try {
        const result = await fetchDomains({
          limit: DEFAULT_LIMIT,
          offset,
          active: activeFilter,
          visible: visibleFilter,
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
    [activeFilter, visibleFilter],
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

  /* ── derived ── */
  const filteredItems = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return domains.items;
    return domains.items.filter((d) => d.name.toLowerCase().includes(q));
  }, [domains.items, search]);

  const activeCount = domains.items.filter((d) => isTrueValue(d.active)).length;
  const inactiveCount = domains.items.length - activeCount;
  const emailDnsCount = domains.items.filter((d) => isTrueValue(d.active_mx)).length;
  const uiDnsCount = domains.items.filter((d) => isTrueValue(d.active_ui)).length;
  const visibleCount = domains.items.filter((d) => readVisibleValue(d)).length;

  /* ── quick toggle ── */
  async function toggleActive(item: AdminDomain) {
    const newActive = !isTrueValue(item.active);
    try {
      const result = await updateDomain(item.id, { active: boolToApi(newActive) });

      if (isUnauthorized(result)) {
        toastFail("Unauthorized", "Session expired.");
        return;
      }

      if (!result.ok) {
        const err = describeError(result, "Toggle failed.");
        toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
        return;
      }

      const updated = result.data?.item;
      setDomains((s) => ({
        ...s,
        items: s.items.map((d) =>
          d.id === item.id ? updated ?? { ...d, active: boolToApi(newActive) } : d,
        ),
      }));
      toastOk(newActive ? "Domain activated" : "Domain deactivated", item.name);
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function toggleVisible(item: AdminDomain) {
    const newVisible = !readVisibleValue(item);
    try {
      const result = await updateDomain(item.id, { visible: boolToApi(newVisible) });

      if (isUnauthorized(result)) {
        toastFail("Unauthorized", "Session expired.");
        return;
      }

      if (!result.ok) {
        const err = describeError(result, "Visibility update failed.");
        toastFail(err.isRateLimited ? "Rate limited" : "Error", err.message);
        return;
      }

      const updated = result.data?.item;
      setDomains((s) => ({
        ...s,
        items: s.items.map((d) =>
          d.id === item.id ? updated ?? { ...d, visible: boolToApi(newVisible) } : d,
        ),
      }));
      toastOk(newVisible ? "Domain visible" : "Domain hidden", item.name);
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    }
  }

  /* ── editor ── */
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
      const body: DomainWritePayload = isEdit ? {} : {
        name,
        active: boolToApi(formActive),
        visible: boolToApi(formVisible),
      };

      if (isEdit) {
        if (!formInitial || name !== formInitial.name) body.name = name;
        if (!formInitial || formActive !== formInitial.active) body.active = boolToApi(formActive);
        if (!formInitial || formVisible !== formInitial.visible) body.visible = boolToApi(formVisible);

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

      toastOk("Domain deleted", deleteTarget.name);
      setDeleteTarget(null);
      await load(0);
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDeleteBusy(false);
    }
  }

  function setDomainRechecking(id: number, busy: boolean) {
    setRecheckingIds((current) => {
      const next = new Set(current);
      if (busy) {
        next.add(id);
      } else {
        next.delete(id);
      }
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
        toastFail(err.isRateLimited ? "Rate limited" : "DNS recheck failed", formatErrorBody(result.data) ?? err.message);
        return;
      }

      toastOk("DNS recheck requested", "All domains are being rechecked.");
      await load(domains.offset);
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
        toastFail(err.isRateLimited ? "Rate limited" : "DNS recheck failed", formatErrorBody(result.data) ?? err.message);
        return;
      }

      toastOk("DNS recheck requested", item.name);
      await load(domains.offset);
    } catch (e) {
      toastFail("Network error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDomainRechecking(item.id, false);
    }
  }

  return {
    domains,
    filteredItems,
    activeCount,
    inactiveCount,
    emailDnsCount,
    uiDnsCount,
    visibleCount,
    search,
    setSearch,
    activeFilter,
    setActiveFilter,
    visibleFilter,
    setVisibleFilter,
    load,
    refresh,
    toggleActive,
    toggleVisible,
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
    recheckingIds,
    isRecheckingDomain,
    recheckDomain,
  };
}
