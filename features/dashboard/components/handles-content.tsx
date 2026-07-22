"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Copy,
  Hash,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Power,
  Trash2,
  Zap,
} from "lucide-react";

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
import {
  useHandlesController,
  type HandleSearchField,
} from "@/features/dashboard/hooks/use-handles-controller";
import type { AdminHandle, BoolFilter } from "@/features/dashboard/types/admin.types";
import { copyText } from "@/features/dashboard/lib/admin-utils";

const SEARCH_FIELDS = [
  { value: "handle", label: "Handle", placeholder: "myhandle" },
  { value: "address", label: "Address", placeholder: "user@example.com" },
];

export function HandlesContent() {
  const c = useHandlesController();

  const columns = React.useMemo<ColumnDef<AdminHandle>[]>(
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
        accessorKey: "handle",
        header: "Handle",
        cell: ({ row }) => (
          <span className="font-mono text-[13px]">{row.original.handle}</span>
        ),
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[13px] text-muted-foreground">
              {row.original.address}
            </span>
            <Link
              href={`/dashboard/admin/aliases?field=address&q=${encodeURIComponent(row.original.address)}`}
              className="text-[11px] text-[var(--neu-green)] hover:underline"
            >
              Find as alias
            </Link>
          </div>
        ),
      },
      {
        id: "active",
        accessorFn: (row) => c.isTrueValue(row.active),
        header: "Active",
        cell: ({ row }) => (
          <Switch
            checked={c.isTrueValue(row.original.active)}
            onCheckedChange={() => c.toggleActive(row.original)}
            aria-label={`Toggle ${row.original.handle} active`}
          />
        ),
        size: 90,
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
                label={`Actions for ${item.handle}`}
                items={[
                  {
                    key: "copy-handle",
                    label: "Copy handle",
                    icon: <Copy className="mr-2 h-4 w-4" />,
                    onSelect: () => copyText(item.handle, "Handle copied"),
                  },
                  {
                    key: "copy-address",
                    label: "Copy address",
                    icon: <Copy className="mr-2 h-4 w-4" />,
                    onSelect: () => copyText(item.address, "Address copied"),
                  },
                  {
                    key: "toggle",
                    label: c.isTrueValue(item.active) ? "Deactivate" : "Activate",
                    icon: <Power className="mr-2 h-4 w-4" />,
                    onSelect: () => void c.toggleActive(item),
                    separatorBefore: true,
                  },
                  {
                    key: "edit",
                    label: "Edit",
                    icon: <Pencil className="mr-2 h-4 w-4" />,
                    onSelect: () => c.openEdit(item),
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
          icon={<Mail className="h-4 w-4" />}
          title="Handles"
          description="Map short handles to destination addresses."
          actions={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Handle
            </Button>
          }
        />

        {c.list.loadedAt ? (
          <AdminMetricCards
            items={[
              {
                key: "total",
                label: "Total Handles",
                value: c.list.total,
                hint: "Matching current filters",
                icon: <Hash className="h-4 w-4 text-[var(--neu-green)]" />,
              },
              {
                key: "page-active",
                label: "Active (page)",
                value: c.pageActiveCount,
                hint: "On this page only",
                valueClassName: "text-2xl font-semibold tracking-tight text-emerald-400",
                icon: <Zap className="h-4 w-4 text-emerald-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/8",
              },
              {
                key: "page-inactive",
                label: "Inactive (page)",
                value: c.pageInactiveCount,
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
          fields={SEARCH_FIELDS}
          field={c.searchField}
          onFieldChange={(v) => c.setSearchField(v as HandleSearchField)}
          query={c.search}
          onQueryChange={c.setSearch}
          filters={
            <Select
              value={c.activeFilter}
              onValueChange={(v) => c.setActiveFilter(v as BoolFilter)}
            >
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="1">Active only</SelectItem>
                <SelectItem value="0">Inactive only</SelectItem>
              </SelectContent>
            </Select>
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
          enableSelection
          emptyIcon={<Mail className="h-5 w-5" />}
          emptyTitle="No handles yet"
          emptyDescription="Create your first handle to map a short name to an address."
          emptyAction={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Handle
            </Button>
          }
          filterActive={c.hasActiveFilters}
          filterLabel={c.search.trim() || undefined}
          onClearFilters={c.clearFilters}
          onPageChange={c.setPageOffset}
          onPageSizeChange={c.setPageSize}
          bulkActions={({ selectedRows, clearSelection }) => (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                disabled={c.bulkBusy}
                onClick={() =>
                  void c.bulkSetActive(selectedRows, true).then(clearSelection)
                }
              >
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                disabled={c.bulkBusy}
                onClick={() =>
                  void c.bulkSetActive(selectedRows, false).then(clearSelection)
                }
              >
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs"
                disabled={c.bulkBusy}
                onClick={() =>
                  void c.bulkDelete(selectedRows).then(clearSelection)
                }
              >
                Delete
              </Button>
            </>
          )}
        />

        {c.list.error && !c.list.loading ? (
          <p className="text-sm text-destructive">{c.list.error}</p>
        ) : null}
      </div>

      <Dialog open={c.editorOpen} onOpenChange={c.setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {c.formId !== null ? `Edit handle #${c.formId}` : "Add handle"}
            </DialogTitle>
            <DialogDescription>
              {c.formId !== null
                ? "Update the handle name, address, or status."
                : "Create a new handle mapping."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="handle-name">Handle</Label>
              <Input
                id="handle-name"
                value={c.formHandle}
                onChange={(e) => c.setFormHandle(e.target.value.toLowerCase())}
                placeholder="myhandle"
                disabled={c.editorBusy}
                required
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="handle-address">Address</Label>
              <Input
                id="handle-address"
                value={c.formAddress}
                onChange={(e) => c.setFormAddress(e.target.value.toLowerCase())}
                placeholder="user@example.com"
                disabled={c.editorBusy}
                required
                autoComplete="off"
              />
            </div>
            <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
              <Switch
                checked={c.formActive}
                onCheckedChange={c.setFormActive}
                disabled={c.editorBusy}
                id="handle-active"
              />
              <Label htmlFor="handle-active" className="cursor-pointer">
                Active
              </Label>
            </div>
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
            <AlertDialogTitle>Delete handle?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{" "}
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
