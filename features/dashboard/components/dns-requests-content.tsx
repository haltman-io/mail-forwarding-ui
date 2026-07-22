"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Clock,
  Copy,
  FileJson,
  Globe,
  Loader2,
  Pencil,
  Plus,
  Radar,
  Trash2,
  XCircle,
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

import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import { AdminMetricCards } from "@/features/dashboard/components/admin-metric-cards";
import { AdminFilterToolbar } from "@/features/dashboard/components/admin-filter-toolbar";
import { AdminDataTable } from "@/features/dashboard/components/admin-data-table";
import { AdminRowActions } from "@/features/dashboard/components/admin-row-actions";
import { useDnsRequestsController } from "@/features/dashboard/hooks/use-dns-requests-controller";
import type { AdminDnsRequest } from "@/features/dashboard/types/admin.types";
import { copyText } from "@/features/dashboard/lib/admin-utils";

const statusColor: Record<string, "emerald" | "amber" | "red" | "sky"> = {
  VERIFIED: "emerald",
  PENDING: "amber",
  FAILED: "red",
};

export function DnsRequestsContent() {
  const c = useDnsRequestsController();

  const columns = React.useMemo<ColumnDef<AdminDnsRequest>[]>(
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
        accessorKey: "target",
        header: "Target",
        cell: ({ row }) => (
          <span className="font-mono text-[13px] text-[var(--text-primary)]">
            {row.original.target}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <Badge
            variant="fancy"
            color={row.original.type === "EMAIL" ? "indigo" : "sky"}
          >
            {row.original.type}
          </Badge>
        ),
        size: 90,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="fancy"
            color={statusColor[row.original.status] ?? "sky"}
          >
            {row.original.status}
          </Badge>
        ),
        size: 110,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[13px] text-muted-foreground">
            {safeDateLabel(row.original.created_at)}
          </span>
        ),
        size: 140,
      },
      {
        accessorKey: "updated_at",
        header: "Updated",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[13px] text-muted-foreground">
            {safeDateLabel(row.original.updated_at)}
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
                label={`Actions for ${item.target}`}
                items={[
                  {
                    key: "copy",
                    label: "Copy target domain",
                    icon: <Copy className="mr-2 h-4 w-4" />,
                    onSelect: () => copyText(item.target, "Target copied"),
                  },
                  {
                    key: "result",
                    label: "View check result",
                    icon: <FileJson className="mr-2 h-4 w-4" />,
                    onSelect: () => c.openResult(item),
                    disabled: !item.last_check_result_json,
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
          icon={<Radar className="h-4 w-4" />}
          title="DNS Requests"
          description="Manage DNS verification requests for domains."
          actions={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Request
            </Button>
          }
        />

        {c.list.loadedAt ? (
          <AdminMetricCards
            columnsClassName="sm:grid-cols-2 lg:grid-cols-4"
            items={[
              {
                key: "total",
                label: "Total",
                value: c.list.total,
                hint: "Matching current filters",
                icon: <Globe className="h-4 w-4 text-[var(--neu-green)]" />,
              },
              {
                key: "verified",
                label: "Verified (page)",
                value: c.pageVerifiedCount,
                hint: "On this page only",
                valueClassName: "text-2xl font-semibold tracking-tight text-emerald-400",
                icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/8",
              },
              {
                key: "pending",
                label: "Pending (page)",
                value: c.pagePendingCount,
                hint: "On this page only",
                valueClassName: "text-2xl font-semibold tracking-tight text-amber-400",
                icon: <Clock className="h-4 w-4 text-amber-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/8",
              },
              {
                key: "failed",
                label: "Failed (page)",
                value: c.pageFailedCount,
                hint: "On this page only",
                valueClassName: "text-2xl font-semibold tracking-tight text-red-400",
                icon: <XCircle className="h-4 w-4 text-red-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/8",
              },
            ]}
          />
        ) : null}

        <AdminFilterToolbar
          query={c.search}
          onQueryChange={c.setSearch}
          filters={
            <>
              <Select value={c.typeFilter} onValueChange={c.setTypeFilter}>
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="UI">UI</SelectItem>
                  <SelectItem value="EMAIL">EMAIL</SelectItem>
                </SelectContent>
              </Select>
              <Select value={c.statusFilter} onValueChange={c.setStatusFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
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
          emptyIcon={<Radar className="h-5 w-5" />}
          emptyTitle="No DNS requests"
          emptyDescription="Create a DNS verification request to get started."
          emptyAction={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Request
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
              {c.formId !== null
                ? `Edit DNS request #${c.formId}`
                : "Add DNS request"}
            </DialogTitle>
            <DialogDescription>
              {c.formId !== null
                ? "Update the DNS verification request."
                : "Create a DNS verification request for a domain."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dns-target">Target domain</Label>
              <Input
                id="dns-target"
                value={c.formTarget}
                onChange={(e) => c.setFormTarget(e.target.value.toLowerCase())}
                placeholder="example.com"
                disabled={c.editorBusy}
                required
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select
                value={c.formType}
                onValueChange={(v) => c.setFormType(v as "UI" | "EMAIL")}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UI">UI</SelectItem>
                  <SelectItem value="EMAIL">EMAIL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select value={c.formStatus} onValueChange={c.setFormStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="VERIFIED">VERIFIED</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dns-json">Last check result JSON (optional)</Label>
              <textarea
                id="dns-json"
                value={c.formJson}
                onChange={(e) => c.setFormJson(e.target.value)}
                disabled={c.editorBusy}
                rows={6}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                placeholder='{"ok": true}'
              />
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

      <Dialog
        open={c.resultViewer !== null}
        onOpenChange={(open) => {
          if (!open) c.setResultViewer(null);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Check result</DialogTitle>
            <DialogDescription className="font-mono">
              {c.resultViewer?.target}
            </DialogDescription>
          </DialogHeader>
          <pre className="max-h-[50vh] overflow-auto rounded-lg border bg-[rgba(0,0,0,0.25)] p-3 font-mono text-[11px] leading-relaxed text-[var(--text-secondary)]">
            {c.resultViewer?.json}
          </pre>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (c.resultViewer?.json) copyText(c.resultViewer.json, "JSON copied");
              }}
            >
              Copy JSON
            </Button>
            <Button type="button" onClick={() => c.setResultViewer(null)}>
              Close
            </Button>
          </DialogFooter>
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
            <AlertDialogTitle>Delete DNS request?</AlertDialogTitle>
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
