"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Copy,
  Key,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  Power,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { safeDateLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import { AdminMetricCards } from "@/features/dashboard/components/admin-metric-cards";
import { AdminFilterToolbar } from "@/features/dashboard/components/admin-filter-toolbar";
import { AdminDataTable } from "@/features/dashboard/components/admin-data-table";
import { AdminRowActions } from "@/features/dashboard/components/admin-row-actions";
import { useApiTokensController } from "@/features/dashboard/hooks/use-api-tokens-controller";
import type {
  AdminApiToken,
  TokenStatusFilter,
} from "@/features/dashboard/types/admin.types";
import { copyText } from "@/features/dashboard/lib/admin-utils";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

function tokenStatus(item: {
  revoked_at?: string | null;
  expires_at?: string | null;
}) {
  if (item.revoked_at) return "revoked" as const;
  if (item.expires_at && new Date(item.expires_at).getTime() < Date.now())
    return "expired" as const;
  return "active" as const;
}

const STATUS_BADGE: Record<string, React.ReactNode> = {
  active: (
    <Badge variant="fancy" color="emerald">
      active
    </Badge>
  ),
  revoked: <Badge variant="fancy">revoked</Badge>,
  expired: (
    <Badge variant="fancy" color="amber">
      expired
    </Badge>
  ),
};

export function ApiTokensContent() {
  const c = useApiTokensController();

  React.useEffect(() => {
    if (!c.createdPlaintext) return;
    void navigator.clipboard.writeText(c.createdPlaintext).then(
      () =>
        toast.info(
          "Token copied to clipboard — save it now, you won't see it again.",
        ),
      () => {
        /* clipboard denied */
      },
    );
  }, [c.createdPlaintext]);

  const columns = React.useMemo<ColumnDef<AdminApiToken>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="pl-1 font-mono text-xs tabular-nums text-muted-foreground">
            {row.original.id}
          </span>
        ),
        size: 64,
      },
      {
        accessorKey: "owner_email",
        header: "Owner",
        cell: ({ row }) => (
          <span className="font-mono text-[13px]">{row.original.owner_email}</span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => tokenStatus(row),
        header: "Status",
        cell: ({ row }) => STATUS_BADGE[tokenStatus(row.original)],
        size: 100,
      },
      {
        accessorKey: "expires_at",
        header: "Expires",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.expires_at)}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "last_used_at",
        header: "Last Used",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[13px] text-muted-foreground">
            {safeDateLabel(row.original.last_used_at)}
          </span>
        ),
        size: 140,
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex justify-end pr-1">
              <AdminRowActions
                label={`Actions for token ${item.id}`}
                items={[
                  {
                    key: "copy",
                    label: "Copy owner email",
                    icon: <Copy className="mr-2 h-4 w-4" />,
                    onSelect: () => copyText(item.owner_email, "Email copied"),
                  },
                  {
                    key: "edit",
                    label: "Edit",
                    icon: <Pencil className="mr-2 h-4 w-4" />,
                    onSelect: () => c.openEdit(item),
                    separatorBefore: true,
                  },
                  {
                    key: "delete",
                    label: "Delete",
                    icon: <Trash2 className="mr-2 h-4 w-4" />,
                    onSelect: () => c.askDelete(item),
                    destructive: true,
                    separatorBefore: true,
                  },
                ]}
              />
            </div>
          );
        },
        size: 56,
      },
    ],
    [c],
  );

  return (
    <AdminPageLayout>
      <div className="flex flex-col gap-6">
        <AdminPageHeader
          icon={<KeyRound className="h-4 w-4" />}
          title="API Tokens"
          description="Manage bearer tokens used for programmatic API access."
          actions={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Create Token
            </Button>
          }
        />

        {c.list.loadedAt ? (
          <AdminMetricCards
            items={[
              {
                key: "total",
                label: "Total Tokens",
                value: c.list.total,
                hint: "Matching current filters",
                icon: <Key className="h-4 w-4 text-[var(--neu-green)]" />,
              },
              {
                key: "active",
                label: "Active (page)",
                value: c.pageActiveCount,
                hint: "On this page only",
                valueClassName: "text-2xl font-semibold tracking-tight text-emerald-400",
                icon: <Zap className="h-4 w-4 text-emerald-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/8",
              },
              {
                key: "revoked",
                label: "Revoked (page)",
                value: c.pageRevokedCount,
                hint: "On this page only",
                valueClassName:
                  "text-2xl font-semibold tracking-tight text-[var(--text-secondary)]",
                icon: <Power className="h-4 w-4 text-[var(--text-muted)]" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]",
              },
            ]}
          />
        ) : null}

        <AdminFilterToolbar
          query={c.ownerSearch}
          onQueryChange={c.setOwnerSearch}
          filters={
            <Select
              value={c.statusFilter}
              onValueChange={(v) => c.setStatusFilter(v as TokenStatusFilter)}
            >
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          }
          onRefresh={c.refresh}
          refreshing={c.list.loading}
          hasActiveFilters={c.hasActiveFilters}
          onClearFilters={c.clearFilters}
        />

        {c.createdPlaintext ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-50/60 px-4 py-3 dark:bg-emerald-950/20">
            <KeyRound className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                New token created — copy it now, it won&apos;t be shown again.
              </p>
              <code className="mt-1 block break-all font-mono text-xs text-emerald-700 dark:text-emerald-200">
                {c.createdPlaintext}
              </code>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => {
                void navigator.clipboard.writeText(c.createdPlaintext!);
                toast.info("Copied");
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => c.setCreatedPlaintext(null)}
            >
              Dismiss
            </Button>
          </div>
        ) : null}

        <AdminDataTable
          columns={columns}
          data={c.list.items}
          total={c.list.total}
          offset={c.list.offset}
          limit={c.list.limit}
          loading={c.list.loading}
          getRowId={(row) => String(row.id)}
          emptyIcon={<KeyRound className="h-5 w-5" />}
          emptyTitle="No API tokens"
          emptyDescription="Create a bearer token for programmatic access."
          emptyAction={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Create Token
            </Button>
          }
          filterActive={c.hasActiveFilters}
          filterLabel={c.ownerSearch.trim() || undefined}
          onClearFilters={c.clearFilters}
          onPageChange={c.setPageOffset}
          onPageSizeChange={c.setPageSize}
        />

        {c.list.error && !c.list.loading ? (
          <p className="text-sm text-destructive">{c.list.error}</p>
        ) : null}
      </div>

      <Dialog open={c.editorOpen} onOpenChange={c.setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {c.formId !== null ? `Edit token #${c.formId}` : "Create API token"}
            </DialogTitle>
            <DialogDescription>
              {c.formId !== null
                ? "Update token details."
                : "Generate a new bearer token."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="token-owner">Owner email</Label>
              <Input
                id="token-owner"
                type="email"
                value={c.formOwnerEmail}
                onChange={(e) => c.setFormOwnerEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={c.editorBusy}
                required
                autoComplete="off"
              />
            </div>
            {c.formId === null ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="token-days">Validity (days, 1–90)</Label>
                <Input
                  id="token-days"
                  type="number"
                  min={1}
                  max={90}
                  value={c.formDays}
                  onChange={(e) => c.setFormDays(e.target.value)}
                  disabled={c.editorBusy}
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="token-expires">Expires at</Label>
                  <Input
                    id="token-expires"
                    type="datetime-local"
                    value={c.formExpiresAt}
                    onChange={(e) => c.setFormExpiresAt(e.target.value)}
                    disabled={c.editorBusy}
                  />
                </div>
                <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
                  <Switch
                    checked={c.formRevoked}
                    onCheckedChange={c.setFormRevoked}
                    disabled={c.editorBusy}
                    id="token-revoked"
                  />
                  <Label htmlFor="token-revoked" className="cursor-pointer">
                    Revoked
                  </Label>
                </div>
                {c.formRevoked ? (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="token-revoked-reason">Revoke reason</Label>
                    <Input
                      id="token-revoked-reason"
                      value={c.formRevokedReason}
                      onChange={(e) => c.setFormRevokedReason(e.target.value)}
                      disabled={c.editorBusy}
                      autoComplete="off"
                    />
                  </div>
                ) : null}
              </>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => c.setEditorOpen(false)}
                disabled={c.editorBusy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={c.editorBusy}>
                {c.editorBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {c.formId !== null ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={c.deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) c.setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API token?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke the token for{" "}
              <span className="font-mono font-medium">{c.deleteTarget?.label}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={c.deleteBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={c.confirmDelete}
              disabled={c.deleteBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {c.deleteBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageLayout>
  );
}
