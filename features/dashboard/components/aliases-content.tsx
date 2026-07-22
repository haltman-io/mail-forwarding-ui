"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AtSign,
  Check,
  ChevronsUpDown,
  Copy,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Power,
  Trash2,
  Zap,
} from "lucide-react";

import { cn, safeDateLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  useAliasesController,
  type AliasSearchField,
} from "@/features/dashboard/hooks/use-aliases-controller";
import type { AdminAlias, BoolFilter } from "@/features/dashboard/types/admin.types";
import { copyText } from "@/features/dashboard/lib/admin-utils";

const SEARCH_FIELDS = [
  { value: "address", label: "Alias address", placeholder: "user@domain.com" },
  { value: "goto", label: "Destination", placeholder: "real@gmail.com" },
];

export function AliasesContent() {
  const c = useAliasesController();

  const columns = React.useMemo<ColumnDef<AdminAlias>[]>(
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
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => {
          const address = row.original.address;
          const domain = address.includes("@") ? address.split("@").pop() : "";
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[13px]">{address}</span>
              {domain ? (
                <Link
                  href={`/dashboard/admin/domains?q=${encodeURIComponent(domain)}`}
                  className="text-[11px] text-[var(--neu-green)] hover:underline"
                >
                  Domain: {domain}
                </Link>
              ) : null}
            </div>
          );
        },
      },
      {
        accessorKey: "goto",
        header: "Destination",
        cell: ({ row }) => (
          <span className="font-mono text-[13px] text-muted-foreground">
            {row.original.goto}
          </span>
        ),
      },
      {
        id: "active",
        accessorFn: (row) => c.isTrueValue(row.active),
        header: "Active",
        cell: ({ row }) => {
          const active = c.isTrueValue(row.original.active);
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={active}
                onCheckedChange={() => c.toggleActive(row.original)}
                aria-label={`Toggle ${row.original.address} active`}
              />
              <span className="sr-only">{active ? "active" : "inactive"}</span>
            </div>
          );
        },
        size: 100,
      },
      {
        id: "modified",
        accessorFn: (row) => row.modified ?? row.created ?? "",
        header: "Modified",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[13px] text-muted-foreground">
            {safeDateLabel(row.original.modified ?? row.original.created)}
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
                label={`Actions for ${item.address}`}
                items={[
                  {
                    key: "copy-address",
                    label: "Copy address",
                    icon: <Copy className="mr-2 h-4 w-4" />,
                    onSelect: () => copyText(item.address, "Address copied"),
                  },
                  {
                    key: "copy-goto",
                    label: "Copy destination",
                    icon: <Copy className="mr-2 h-4 w-4" />,
                    onSelect: () => copyText(item.goto, "Destination copied"),
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
          icon={<AtSign className="h-4 w-4" />}
          title="Aliases"
          description="Manage forwarding aliases. Each alias maps an address to a destination."
          actions={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Alias
            </Button>
          }
        />

        {c.list.loadedAt ? (
          <AdminMetricCards
            items={[
              {
                key: "total",
                label: "Total Aliases",
                value: c.list.total,
                hint: "Matching current filters",
                icon: <Mail className="h-4 w-4 text-[var(--neu-green)]" />,
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
          onFieldChange={(v) => c.setSearchField(v as AliasSearchField)}
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
          emptyIcon={<AtSign className="h-5 w-5" />}
          emptyTitle="No aliases yet"
          emptyDescription="Create your first alias to start forwarding emails."
          emptyAction={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Alias
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
              {c.formId !== null ? `Edit alias #${c.formId}` : "Add alias"}
            </DialogTitle>
            <DialogDescription>
              {c.formId !== null
                ? "Update the alias address, destination, or status."
                : "Create a forwarding alias."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="alias-address">Address</Label>
              <div className="flex w-full items-center gap-2">
                <Input
                  id="alias-address"
                  className="flex-1"
                  placeholder="handle"
                  value={c.formHandle}
                  onChange={(e) => c.setFormHandle(e.target.value.toLowerCase())}
                  disabled={c.editorBusy}
                  required
                  autoComplete="off"
                />
                <span className="text-muted-foreground">@</span>
                <Popover
                  open={c.aliasDomainComboboxOpen}
                  onOpenChange={c.setAliasDomainComboboxOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={c.aliasDomainComboboxOpen}
                      className="w-[180px] justify-between font-normal"
                      disabled={c.editorBusy}
                    >
                      {c.formDomain || "Select domain..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[180px] p-0">
                    <Command>
                      <CommandInput placeholder="Search domain..." />
                      <CommandList>
                        <CommandEmpty>No domain found.</CommandEmpty>
                        <CommandGroup>
                          {c.aliasDomains.map((domain) => (
                            <CommandItem
                              key={domain}
                              value={domain}
                              onSelect={(currentValue) => {
                                c.setFormDomain(
                                  currentValue === c.formDomain ? "" : currentValue,
                                );
                                c.setAliasDomainComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  c.formDomain === domain ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {domain}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="alias-goto">Destination</Label>
              <Input
                id="alias-goto"
                value={c.formGoto}
                onChange={(e) => c.setFormGoto(e.target.value.toLowerCase())}
                placeholder="real@gmail.com"
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
                id="alias-active"
              />
              <Label htmlFor="alias-active" className="cursor-pointer">
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
            <AlertDialogTitle>Delete alias?</AlertDialogTitle>
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
