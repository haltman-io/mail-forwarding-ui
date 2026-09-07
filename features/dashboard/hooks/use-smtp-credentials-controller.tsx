"use client";

import * as React from "react";

import type {
  AdminSmtpCredential,
  BoolFilter,
  ListState,
} from "@/features/dashboard/types/admin.types";
import {
  createSmtpCredential,
  createSmtpInvite,
  deleteSmtpCredential,
  describeError,
  fetchSmtpCredentials,
  isUnauthorized,
  updateSmtpCredential,
} from "@/features/dashboard/services/smtp-credentials.service";
import { useDebouncedValue } from "@/features/dashboard/hooks/use-debounced-value";
import { useUrlQueryState } from "@/features/dashboard/hooks/use-url-query-state";
import {
  DEFAULT_PAGE_SIZE,
  createListState,
  isTrueValue,
  toastFail,
  toastOk,
} from "@/features/dashboard/lib/admin-utils";

const FILTER_DEFAULTS = {
  q: "",
  active: "all" as BoolFilter,
  sender: "",
  limit: String(DEFAULT_PAGE_SIZE),
  offset: "0",
};

export function useSmtpCredentialsController() {
  const { state, setField, patch, reset } = useUrlQueryState(FILTER_DEFAULTS, [
    "q",
    "active",
    "sender",
    "limit",
    "offset",
  ]);

  const search = state.q;
  const activeFilter = (["all", "1", "0"].includes(state.active)
    ? state.active
    : "all") as BoolFilter;
  const senderFilter = state.sender;
  const limit = Math.max(1, Number.parseInt(state.limit, 10) || DEFAULT_PAGE_SIZE);
  const offset = Math.max(0, Number.parseInt(state.offset, 10) || 0);
  const debouncedSearch = useDebouncedValue(search, 300);
  const debouncedSender = useDebouncedValue(senderFilter, 300);

  const [list, setList] = React.useState<ListState<AdminSmtpCredential>>(() =>
    createListState(limit),
  );

  // Editor modal state (Create / Edit)
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorBusy, setEditorBusy] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [formOriginalUsername, setFormOriginalUsername] = React.useState<string | null>(null);
  const [formUsername, setFormUsername] = React.useState("");
  const [formPassword, setFormPassword] = React.useState("");
  const [formSendersText, setFormSendersText] = React.useState("");
  const [formActive, setFormActive] = React.useState(true);

  // Post-creation credentials dialog
  const [createdModalOpen, setCreatedModalOpen] = React.useState(false);
  const [createdResult, setCreatedResult] = React.useState<{
    username: string;
    password?: string;
    allowed_senders: string[];
    generated_password: boolean;
  } | null>(null);

  // Invite creation modal
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);
  const [inviteBusy, setInviteBusy] = React.useState(false);
  const [inviteConstraint, setInviteConstraint] = React.useState("");
  const [inviteTtlHours, setInviteTtlHours] = React.useState("72");

  // Invite result dialog
  const [inviteResultModalOpen, setInviteResultModalOpen] = React.useState(false);
  const [inviteResult, setInviteResult] = React.useState<{
    setup_url: string;
    expires_at: string;
    allowed_sender_constraint: string | null;
  } | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = React.useState<{
    username: string;
    label: string;
  } | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);

  const loadSeq = React.useRef(0);

  const load = React.useCallback(
    async (nextOffset = offset, nextLimit = limit) => {
      const seq = ++loadSeq.current;
      setList((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await fetchSmtpCredentials({
          limit: nextLimit,
          offset: nextOffset,
          active: activeFilter,
          username: debouncedSearch.trim() || undefined,
          sender: debouncedSender.trim() || undefined,
        });

        if (seq !== loadSeq.current) return;

        if (isUnauthorized(result)) {
          toastFail("Unauthorized", "Your admin session is expired or invalid.");
          setList((prev) => ({
            ...prev,
            loading: false,
            error: "Session expired.",
          }));
          return;
        }

        if (!result.ok || !result.data) {
          const err = describeError(result, "Failed to load SMTP credentials.");
          setList((prev) => ({
            ...prev,
            loading: false,
            error: err.message,
          }));
          return;
        }

        const items = result.data.items ?? [];
        const total = result.data.pagination?.total ?? items.length;

        setList({
          items,
          total,
          limit: nextLimit,
          offset: nextOffset,
          loading: false,
          loadedAt: Date.now(),
          error: null,
        });
      } catch (err) {
        if (seq !== loadSeq.current) return;
        const msg = err instanceof Error ? err.message : "Network error";
        setList((prev) => ({ ...prev, loading: false, error: msg }));
      }
    },
    [offset, limit, activeFilter, debouncedSearch, debouncedSender],
  );

  React.useEffect(() => {
    void load();
  }, [load]);

  const refresh = React.useCallback(() => {
    void load(offset, limit);
  }, [load, offset, limit]);

  const openCreate = React.useCallback(() => {
    setFormMode("create");
    setFormOriginalUsername(null);
    setFormUsername("");
    setFormPassword("");
    setFormSendersText("");
    setFormActive(true);
    setEditorOpen(true);
  }, []);

  const openEdit = React.useCallback((item: AdminSmtpCredential) => {
    setFormMode("edit");
    setFormOriginalUsername(item.username);
    setFormUsername(item.username);
    setFormPassword("");
    setFormSendersText(item.allowed_senders.join("\n"));
    setFormActive(isTrueValue(item.active));
    setEditorOpen(true);
  }, []);

  const openInvite = React.useCallback((defaultSender?: string) => {
    setInviteConstraint(defaultSender ?? "");
    setInviteTtlHours("72");
    setInviteModalOpen(true);
  }, []);

  const submitEditor = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const senders = formSendersText
        .split(/[\n,]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      if (formMode === "create" && senders.length === 0) {
        toastFail("Validation error", "At least one allowed sender address is required.");
        return;
      }

      setEditorBusy(true);

      try {
        if (formMode === "create") {
          const result = await createSmtpCredential({
            username: formUsername.trim().toLowerCase(),
            password: formPassword.trim() || undefined,
            allowed_senders: senders,
            active: formActive,
          });

          if (isUnauthorized(result)) {
            toastFail("Unauthorized", "Session expired.");
            return;
          }

          if (!result.ok || !result.data) {
            const err = describeError(result, "Failed to create SMTP credential.");
            toastFail(err.isRateLimited ? "Rate limited" : "Create failed", err.message);
            return;
          }

          setEditorOpen(false);
          setCreatedResult({
            username: result.data.item.username,
            password: result.data.password,
            allowed_senders: result.data.item.allowed_senders,
            generated_password: result.data.generated_password,
          });
          setCreatedModalOpen(true);
          toastOk("SMTP credential created", `User "${result.data.item.username}" is ready.`);
          void load(0, limit);
        } else {
          if (!formOriginalUsername) return;

          const result = await updateSmtpCredential(formOriginalUsername, {
            password: formPassword.trim() || undefined,
            allowed_senders: senders,
            active: formActive,
          });

          if (isUnauthorized(result)) {
            toastFail("Unauthorized", "Session expired.");
            return;
          }

          if (!result.ok || !result.data) {
            const err = describeError(result, "Failed to update SMTP credential.");
            toastFail(err.isRateLimited ? "Rate limited" : "Update failed", err.message);
            return;
          }

          setEditorOpen(false);
          toastOk("SMTP credential updated", `User "${formOriginalUsername}" saved.`);
          void load(offset, limit);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        toastFail("Error", msg);
      } finally {
        setEditorBusy(false);
      }
    },
    [
      formMode,
      formUsername,
      formPassword,
      formSendersText,
      formActive,
      formOriginalUsername,
      load,
      limit,
      offset,
    ],
  );

  const submitInvite = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setInviteBusy(true);

      try {
        const ttlHours = Number.parseInt(inviteTtlHours, 10) || 72;
        const result = await createSmtpInvite({
          allowed_sender_constraint: inviteConstraint.trim().toLowerCase() || undefined,
          expires_in_hours: ttlHours,
        });

        if (isUnauthorized(result)) {
          toastFail("Unauthorized", "Session expired.");
          return;
        }

        if (!result.ok || !result.data) {
          const err = describeError(result, "Failed to generate invite.");
          toastFail(err.isRateLimited ? "Rate limited" : "Invite failed", err.message);
          return;
        }

        setInviteModalOpen(false);
        setInviteResult({
          setup_url: result.data.setup_url,
          expires_at: result.data.expires_at,
          allowed_sender_constraint: result.data.allowed_sender_constraint,
        });
        setInviteResultModalOpen(true);
        toastOk("Invite created", "One-time setup link is ready to share.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        toastFail("Error", msg);
      } finally {
        setInviteBusy(false);
      }
    },
    [inviteConstraint, inviteTtlHours],
  );

  const toggleActive = React.useCallback(
    async (item: AdminSmtpCredential) => {
      const nextActive = !isTrueValue(item.active);

      // Optimistic update
      setList((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.username === item.username ? { ...it, active: nextActive ? 1 : 0 } : it,
        ),
      }));

      try {
        const result = await updateSmtpCredential(item.username, {
          active: nextActive,
        });

        if (!result.ok) {
          // Revert optimistic update
          setList((prev) => ({
            ...prev,
            items: prev.items.map((it) =>
              it.username === item.username ? { ...it, active: item.active } : it,
            ),
          }));
          const err = describeError(result, "Failed to toggle status.");
          toastFail("Update failed", err.message);
          return;
        }

        toastOk(
          nextActive ? "Credential activated" : "Credential paused",
          `User "${item.username}" is now ${nextActive ? "active" : "inactive"}.`,
        );
      } catch (err) {
        setList((prev) => ({
          ...prev,
          items: prev.items.map((it) =>
            it.username === item.username ? { ...it, active: item.active } : it,
          ),
        }));
        const msg = err instanceof Error ? err.message : "Network error";
        toastFail("Error", msg);
      }
    },
    [],
  );

  const askDelete = React.useCallback((item: AdminSmtpCredential) => {
    setDeleteTarget({ username: item.username, label: item.username });
  }, []);

  const confirmDelete = React.useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);

    try {
      const result = await deleteSmtpCredential(deleteTarget.username);

      if (isUnauthorized(result)) {
        toastFail("Unauthorized", "Session expired.");
        return;
      }

      if (!result.ok) {
        const err = describeError(result, "Failed to delete credential.");
        toastFail("Delete failed", err.message);
        return;
      }

      toastOk("Credential deleted", `User "${deleteTarget.username}" was removed.`);
      setDeleteTarget(null);
      void load(offset, limit);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      toastFail("Error", msg);
    } finally {
      setDeleteBusy(false);
    }
  }, [deleteTarget, load, offset, limit]);

  const setPageOffset = React.useCallback(
    (newOffset: number) => {
      patch({ offset: String(newOffset) });
      void load(newOffset, limit);
    },
    [patch, load, limit],
  );

  const setPageSize = React.useCallback(
    (newLimit: number) => {
      patch({ limit: String(newLimit), offset: "0" });
      void load(0, newLimit);
    },
    [patch, load],
  );

  const clearFilters = React.useCallback(() => {
    reset();
    void load(0, DEFAULT_PAGE_SIZE);
  }, [reset, load]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    activeFilter !== "all" ||
    Boolean(senderFilter.trim());

  // Metrics
  const activeCount = React.useMemo(() => {
    return list.items.filter((it) => isTrueValue(it.active)).length;
  }, [list.items]);

  const inactiveCount = React.useMemo(() => {
    return list.items.filter((it) => !isTrueValue(it.active)).length;
  }, [list.items]);

  const totalSendersOnPage = React.useMemo(() => {
    return list.items.reduce((acc, it) => acc + it.allowed_senders.length, 0);
  }, [list.items]);

  return {
    list,
    search,
    setSearch: (v: string) => setField("q", v),
    activeFilter,
    setActiveFilter: (v: string) => setField("active", v as BoolFilter),
    senderFilter,
    setSenderFilter: (v: string) => setField("sender", v),
    hasActiveFilters,
    clearFilters,
    refresh,
    openCreate,
    openEdit,
    openInvite,
    editorOpen,
    setEditorOpen,
    editorBusy,
    formMode,
    formUsername,
    setFormUsername,
    formPassword,
    setFormPassword,
    formSendersText,
    setFormSendersText,
    formActive,
    setFormActive,
    submitEditor,
    createdModalOpen,
    setCreatedModalOpen,
    createdResult,
    inviteModalOpen,
    setInviteModalOpen,
    inviteBusy,
    inviteConstraint,
    setInviteConstraint,
    inviteTtlHours,
    setInviteTtlHours,
    submitInvite,
    inviteResultModalOpen,
    setInviteResultModalOpen,
    inviteResult,
    deleteTarget,
    setDeleteTarget,
    deleteBusy,
    confirmDelete,
    askDelete,
    toggleActive,
    setPageOffset,
    setPageSize,
    activeCount,
    inactiveCount,
    totalSendersOnPage,
  };
}
