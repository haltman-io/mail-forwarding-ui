"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Copy,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Mail,
  Monitor,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Trash2,
  Zap,
} from "lucide-react";

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
  SelectGroup,
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
import { useDomainsController } from "@/features/dashboard/hooks/use-domains-controller";
import type { AdminDomain } from "@/features/dashboard/types/domains.types";
import type { BoolFilter } from "@/features/dashboard/types/domains.types";
import { copyText } from "@/features/dashboard/lib/admin-utils";

type BadgeColor = NonNullable<React.ComponentProps<typeof Badge>["color"]>;

function BoolBadge({
  isOn,
  onLabel = "ON",
  offLabel = "OFF",
  onColor = "emerald",
  offColor = "red",
}: {
  isOn: boolean;
  onLabel?: string;
  offLabel?: string;
  onColor?: BadgeColor;
  offColor?: BadgeColor;
}) {
  return (
    <Badge variant="fancy" color={isOn ? onColor : offColor}>
      {isOn ? onLabel : offLabel}
    </Badge>
  );
}

export function DomainsContent() {
  const c = useDomainsController();

  const columns = React.useMemo<ColumnDef<AdminDomain>[]>(
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
        accessorKey: "name",
        header: "Domain",
        cell: ({ row }) => (
          <span className="font-mono text-[13px]">{row.original.name}</span>
        ),
      },
      {
        id: "admin",
        accessorFn: (row) => c.isTrueValue(row.active),
        header: "Admin",
        cell: ({ row }) => (
          <Switch
            checked={c.isTrueValue(row.original.active)}
            onCheckedChange={() => c.toggleActive(row.original)}
            aria-label={`Toggle ${row.original.name} admin access`}
          />
        ),
        size: 90,
      },
      {
        id: "email_dns",
        accessorFn: (row) => c.isTrueValue(row.active_mx),
        header: "EMAIL DNS",
        cell: ({ row }) => <BoolBadge isOn={c.isTrueValue(row.original.active_mx)} />,
        size: 110,
      },
      {
        id: "ui_dns",
        accessorFn: (row) => c.isTrueValue(row.active_ui),
        header: "UI DNS",
        cell: ({ row }) => <BoolBadge isOn={c.isTrueValue(row.original.active_ui)} />,
        size: 100,
      },
      {
        id: "visible",
        accessorFn: (row) => c.readVisibleValue(row),
        header: "Visible",
        cell: ({ row }) => (
          <Switch
            checked={c.readVisibleValue(row.original)}
            onCheckedChange={() => c.toggleVisible(row.original)}
            aria-label={`Toggle ${row.original.name} public visibility`}
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
          const adminOn = c.isTrueValue(item.active);
          const visibleOn = c.readVisibleValue(item);
          const rowRechecking = c.isRecheckingDomain(item.id);
          return (
            <div className="flex justify-end pr-1">
              <AdminRowActions
                label={`Actions for ${item.name}`}
                items={[
                  {
                    key: "copy",
                    label: "Copy domain",
                    icon: <Copy className="mr-2 h-4 w-4" />,
                    onSelect: () => copyText(item.name, "Domain copied"),
                  },
                  {
                    key: "recheck",
                    label: "Recheck DNS",
                    icon: rowRechecking ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    ),
                    onSelect: () => void c.recheckDomain(item),
                    disabled: rowRechecking,
                    separatorBefore: true,
                  },
                  {
                    key: "toggle-admin",
                    label: adminOn ? "Deactivate admin" : "Activate admin",
                    icon: <Power className="mr-2 h-4 w-4" />,
                    onSelect: () => void c.toggleActive(item),
                  },
                  {
                    key: "toggle-visible",
                    label: visibleOn ? "Hide public listing" : "Show public listing",
                    icon: visibleOn ? (
                      <EyeOff className="mr-2 h-4 w-4" />
                    ) : (
                      <Eye className="mr-2 h-4 w-4" />
                    ),
                    onSelect: () => void c.toggleVisible(item),
                  },
                  {
                    key: "edit",
                    label: "Edit",
                    icon: <Pencil className="mr-2 h-4 w-4" />,
                    onSelect: () => c.openEdit(item),
                  },
                  {
                    key: "disable",
                    label: "Disable domain",
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
          icon={<Globe className="h-4 w-4" />}
          title="Domains"
          description="Manage admin enablement, public visibility, and DNS approval for EMAIL/UI domains."
          actions={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Domain
            </Button>
          }
        />

        {c.domains.loadedAt ? (
          <AdminMetricCards
            columnsClassName="sm:grid-cols-2 xl:grid-cols-4"
            items={[
              {
                key: "total",
                label: "Total Domains",
                value: c.domains.total,
                hint: "Matching current filters",
                icon: <Globe className="h-4 w-4 text-[var(--neu-green)]" />,
              },
              {
                key: "admin",
                label: "Admin ON (page)",
                value: c.pageActiveCount,
                hint: "On this page only",
                valueClassName: "text-2xl font-semibold tracking-tight text-emerald-400",
                icon: <Zap className="h-4 w-4 text-emerald-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/8",
              },
              {
                key: "email",
                label: "EMAIL DNS (page)",
                value: c.pageEmailDnsCount,
                hint: "On this page only",
                valueClassName: "text-2xl font-semibold tracking-tight text-sky-400",
                icon: <Mail className="h-4 w-4 text-sky-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/8",
              },
              {
                key: "ui",
                label: "UI DNS (page)",
                value: c.pageUiDnsCount,
                hint: "On this page only",
                valueClassName: "text-2xl font-semibold tracking-tight text-indigo-400",
                icon: <Monitor className="h-4 w-4 text-indigo-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/8",
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
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="1">Admin ON</SelectItem>
                    <SelectItem value="0">Admin OFF</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={c.visibleFilter}
                onValueChange={(v) => c.setVisibleFilter(v as BoolFilter)}
              >
                <SelectTrigger className="h-8 w-[132px] text-xs">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All visibility</SelectItem>
                    <SelectItem value="1">Visible only</SelectItem>
                    <SelectItem value="0">Hidden only</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </>
          }
          onRefresh={c.refresh}
          refreshing={c.domains.loading}
          hasActiveFilters={c.hasActiveFilters}
          onClearFilters={c.clearFilters}
          rightExtra={
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              onClick={c.recheckAllDns}
              disabled={c.recheckingAll || c.domains.loading}
              title="Recheck all DNS"
            >
              {c.recheckingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Recheck all DNS
            </Button>
          }
        />

        <AdminDataTable
          columns={columns}
          data={c.domains.items}
          total={c.domains.total}
          offset={c.domains.offset}
          limit={c.domains.limit}
          loading={c.domains.loading}
          getRowId={(row) => String(row.id)}
          enableSelection
          emptyIcon={<Globe className="h-5 w-5" />}
          emptyTitle="No domains yet"
          emptyDescription="Add your first forwarding domain to start creating aliases."
          emptyAction={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Domain
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
                Activate admin
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
                Deactivate admin
              </Button>
            </>
          )}
        />

        {c.domains.error && !c.domains.loading ? (
          <p className="text-sm text-destructive">{c.domains.error}</p>
        ) : null}
      </div>

      <Dialog open={c.editorOpen} onOpenChange={c.setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {c.formId !== null ? `Edit domain #${c.formId}` : "Add domain"}
            </DialogTitle>
            <DialogDescription>
              {c.formId !== null
                ? "Update the domain name, admin gate, or public visibility."
                : "Enter a domain name and choose its initial admin/public gates."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="domain-name">Domain</Label>
              <Input
                id="domain-name"
                value={c.formName}
                onChange={(e) => c.setFormName(e.target.value.toLowerCase())}
                placeholder="example.com"
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
                id="domain-active"
              />
              <Label htmlFor="domain-active" className="cursor-pointer">
                Admin enabled
              </Label>
            </div>
            <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
              <Switch
                checked={c.formVisible}
                onCheckedChange={c.setFormVisible}
                disabled={c.editorBusy}
                id="domain-visible"
              />
              <Label htmlFor="domain-visible" className="cursor-pointer">
                Publicly visible
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
            <AlertDialogTitle>Disable domain?</AlertDialogTitle>
            <AlertDialogDescription>
              This soft-disables{" "}
              <span className="font-mono font-medium">{c.deleteTarget?.name}</span>{" "}
              by setting admin active = 0. DNS flags are left unchanged.
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
              Disable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageLayout>
  );
}
