"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Ban,
  Copy,
  Loader2,
  Pencil,
  Plus,
  Power,
  ShieldAlert,
  Trash2,
} from "lucide-react";

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
import { useBansController } from "@/features/dashboard/hooks/use-bans-controller";
import type { AdminBan, BanType, BoolFilter } from "@/features/dashboard/types/admin.types";
import { copyText } from "@/features/dashboard/lib/admin-utils";

const BAN_TYPE_LABELS: Record<string, string> = {
  email: "Email",
  domain: "Domain",
  ip: "IP",
  name: "Name",
};

export function BansContent() {
  const c = useBansController();

  const columns = React.useMemo<ColumnDef<AdminBan>[]>(
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
        accessorKey: "ban_type",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="fancy" color="sky" className="text-[11px]">
            {BAN_TYPE_LABELS[row.original.ban_type] ?? row.original.ban_type}
          </Badge>
        ),
        size: 100,
      },
      {
        accessorKey: "ban_value",
        header: "Value",
        cell: ({ row }) => (
          <span className="font-mono text-[13px]">{row.original.ban_value}</span>
        ),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => (
          <span className="max-w-[220px] truncate text-xs text-muted-foreground">
            {row.original.reason || "—"}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => (row.revoked_at ? 0 : 1),
        header: "Status",
        cell: ({ row }) =>
          row.original.revoked_at ? (
            <Badge variant="fancy">revoked</Badge>
          ) : (
            <Badge variant="fancy" color="red">
              active
            </Badge>
          ),
        size: 100,
      },
      {
        accessorKey: "expires_at",
        header: "Expires",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[13px] text-muted-foreground">
            {safeDateLabel(row.original.expires_at)}
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
                label={`Actions for ban ${item.id}`}
                items={[
                  {
                    key: "copy",
                    label: "Copy value",
                    icon: <Copy className="mr-2 h-4 w-4" />,
                    onSelect: () => copyText(item.ban_value, "Value copied"),
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
          icon={<Ban className="h-4 w-4" />}
          title="Bans"
          description="Block emails, domains, IPs, or names from using the service."
          actions={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Ban
            </Button>
          }
        />

        {c.list.loadedAt ? (
          <AdminMetricCards
            items={[
              {
                key: "total",
                label: "Total Bans",
                value: c.list.total,
                hint: "Matching current filters",
                icon: <Ban className="h-4 w-4 text-[var(--neu-green)]" />,
              },
              {
                key: "active",
                label: "Active (page)",
                value: c.pageActiveCount,
                hint: "On this page only",
                valueClassName: "text-2xl font-semibold tracking-tight text-amber-400",
                icon: <ShieldAlert className="h-4 w-4 text-amber-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/8",
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
          query={c.search}
          onQueryChange={c.setSearch}
          filters={
            <>
              <Select
                value={c.activeFilter}
                onValueChange={(v) => c.setActiveFilter(v as BoolFilter)}
              >
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="1">Active only</SelectItem>
                  <SelectItem value="0">Inactive only</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={c.typeFilter}
                onValueChange={(v) => c.setTypeFilter(v as "all" | BanType)}
              >
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="ip">IP</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
          onRefresh={c.refresh}
          refreshing={c.list.loading}
          hasActiveFilters={c.hasActiveFilters}
          onClearFilters={c.clearFilters}
        />

        <AdminDataTable
          columns={columns}
          data={c.list.items}
          total={c.list.total}
          offset={c.list.offset}
          limit={c.list.limit}
          loading={c.list.loading}
          getRowId={(row) => String(row.id)}
          emptyIcon={<Ban className="h-5 w-5" />}
          emptyTitle="No bans yet"
          emptyDescription="Add a ban to block an email, domain, IP, or name."
          emptyAction={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Ban
            </Button>
          }
          filterActive={c.hasActiveFilters}
          filterLabel={c.search.trim() || undefined}
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
              {c.formId !== null ? `Edit ban #${c.formId}` : "Add ban"}
            </DialogTitle>
            <DialogDescription>
              {c.formId !== null
                ? "Update the ban details."
                : "Block an email, domain, IP, or name."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select
                value={c.formType}
                onValueChange={(v) => c.setFormType(v as BanType)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="ip">IP</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ban-value">Value</Label>
              <Input
                id="ban-value"
                value={c.formValue}
                onChange={(e) => c.setFormValue(e.target.value)}
                placeholder="e.g. spammer@evil.com"
                disabled={c.editorBusy}
                required
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ban-reason">Reason (optional)</Label>
              <Input
                id="ban-reason"
                value={c.formReason}
                onChange={(e) => c.setFormReason(e.target.value)}
                placeholder="Spam, abuse, etc."
                disabled={c.editorBusy}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ban-expires">Expires at (optional)</Label>
              <Input
                id="ban-expires"
                type="datetime-local"
                value={c.formExpiresAt}
                onChange={(e) => c.setFormExpiresAt(e.target.value)}
                disabled={c.editorBusy}
              />
            </div>
            {c.formId === null && c.formType !== "ip" ? (
              <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <Switch
                  checked={c.formDisableAliases}
                  onCheckedChange={c.setFormDisableAliases}
                  disabled={c.editorBusy}
                  id="ban-disable-aliases"
                />
                <Label htmlFor="ban-disable-aliases" className="cursor-pointer text-sm">
                  Disable matching active aliases
                </Label>
              </div>
            ) : null}
            {c.formId !== null ? (
              <>
                <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
                  <Switch
                    checked={c.formRevoked}
                    onCheckedChange={c.setFormRevoked}
                    disabled={c.editorBusy}
                    id="ban-revoked"
                  />
                  <Label htmlFor="ban-revoked" className="cursor-pointer">
                    Revoked
                  </Label>
                </div>
                {c.formRevoked ? (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="ban-revoked-reason">Revoke reason</Label>
                    <Input
                      id="ban-revoked-reason"
                      value={c.formRevokedReason}
                      onChange={(e) => c.setFormRevokedReason(e.target.value)}
                      disabled={c.editorBusy}
                      autoComplete="off"
                    />
                  </div>
                ) : null}
              </>
            ) : null}
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
            <AlertDialogTitle>Delete ban?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke{" "}
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
