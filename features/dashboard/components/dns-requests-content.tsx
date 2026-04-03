"use client";

import * as React from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Globe,
  Loader2,
  Pencil,
  Plus,
  Radar,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
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
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import {
  AdminToolbar,
  AdminToolbarLeft,
  AdminToolbarRight,
} from "@/features/dashboard/components/admin-toolbar";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { useDnsRequestsController } from "@/features/dashboard/hooks/use-dns-requests-controller";
import { safeDateLabel } from "@/lib/utils";

const statusColor: Record<string, "emerald" | "amber" | "red" | "sky"> = {
  VERIFIED: "emerald",
  PENDING: "amber",
  FAILED: "red",
};

export function DnsRequestsContent() {
  const c = useDnsRequestsController();

  return (
    <AdminPageLayout>
      <div className="space-y-6">
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

        {/* ── metric cards ── */}
        {c.list.loadedAt && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminDataCard className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Total
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                    {c.list.total}
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                  <Globe className="h-4 w-4 text-[var(--neu-green)]" />
                </div>
              </div>
            </AdminDataCard>

            <AdminDataCard className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Verified
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-emerald-400">
                    {c.verifiedCount}
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/8">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            </AdminDataCard>

            <AdminDataCard className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Pending
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-amber-400">
                    {c.pendingCount}
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/8">
                  <Clock className="h-4 w-4 text-amber-400" />
                </div>
              </div>
            </AdminDataCard>

            <AdminDataCard className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Failed
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-red-400">
                    {c.failedCount}
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/8">
                  <XCircle className="h-4 w-4 text-red-400" />
                </div>
              </div>
            </AdminDataCard>
          </div>
        )}

        {/* ── toolbar ── */}
        <AdminToolbar>
          <AdminToolbarLeft>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                placeholder="Search domains..."
                value={c.search}
                onChange={(e) => c.setSearch(e.target.value)}
                className="h-8 w-[180px] pl-8 text-xs"
              />
            </div>
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
          </AdminToolbarLeft>
          <AdminToolbarRight>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={c.refresh}
              disabled={c.list.loading}
              title="Refresh"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${c.list.loading ? "animate-spin" : ""}`}
              />
            </Button>
          </AdminToolbarRight>
        </AdminToolbar>

        <AdminDataCard>
          {c.list.loading && c.list.items.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : c.list.items.length === 0 ? (
            <EmptyState
              icon={<Radar className="h-5 w-5" />}
              title="No DNS requests"
              description="Create a DNS verification request to get started."
              action={
                <Button
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={c.openCreate}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Request
                </Button>
              }
            />
          ) : c.filteredItems.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-12">
              <Search className="h-5 w-5 text-[var(--text-muted)]" />
              <p className="text-[13px] text-[var(--text-muted)]">
                No DNS requests matching &ldquo;{c.search}&rdquo;
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 pl-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      ID
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Target
                    </TableHead>
                    <TableHead className="w-24 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Type
                    </TableHead>
                    <TableHead className="w-28 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="w-36 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Created
                    </TableHead>
                    <TableHead className="w-36 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Updated
                    </TableHead>
                    <TableHead className="w-20 pr-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.filteredItems.map((item) => (
                    <ContextMenu key={item.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow className="group cursor-context-menu transition-colors hover:bg-[var(--hover-state)]">
                          <TableCell className="pl-4 font-mono text-xs tabular-nums text-muted-foreground">
                            {item.id}
                          </TableCell>
                          <TableCell className="font-mono text-[13px] text-[var(--text-primary)]">
                            {item.target}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="fancy"
                              color={item.type === "EMAIL" ? "indigo" : "sky"}
                            >
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="fancy"
                              color={statusColor[item.status] ?? "sky"}
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-[13px] text-muted-foreground">
                            {safeDateLabel(item.created_at)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-[13px] text-muted-foreground">
                            {safeDateLabel(item.updated_at)}
                          </TableCell>
                          <TableCell className="pr-4 text-right">
                            <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => c.openEdit(item)}
                                title="Edit"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => c.askDelete(item)}
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-52">
                        <ContextMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(item.target);
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy target domain
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => c.openEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => c.askDelete(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t border-[var(--hairline-border)] px-4 py-3">
                <span className="text-xs tabular-nums text-muted-foreground">
                  {c.rangeFrom}–{c.rangeTo} of {c.list.total}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={c.goPrev}
                    disabled={!c.canPrev || c.list.loading}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={c.goNext}
                    disabled={!c.canNext || c.list.loading}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </AdminDataCard>

        {c.list.error && !c.list.loading && (
          <p className="text-sm text-destructive">{c.list.error}</p>
        )}
      </div>

      {/* editor dialog */}
      <Dialog open={c.editorOpen} onOpenChange={c.setEditorOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {c.formId !== null
                ? `Edit DNS request #${c.formId}`
                : "Add DNS request"}
            </DialogTitle>
            <DialogDescription>
              {c.formId !== null
                ? "Update DNS verification request details."
                : "Create a new DNS verification request."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="space-y-4">
            <div className="space-y-2">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dns-type">Type</Label>
                <Select
                  value={c.formType}
                  onValueChange={(v) =>
                    c.setFormType(v as "UI" | "EMAIL")
                  }
                  disabled={c.editorBusy}
                >
                  <SelectTrigger id="dns-type" className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UI">UI</SelectItem>
                    <SelectItem value="EMAIL">EMAIL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dns-status">Status</Label>
                <Select
                  value={c.formStatus}
                  onValueChange={c.setFormStatus}
                  disabled={c.editorBusy}
                >
                  <SelectTrigger id="dns-status" className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="VERIFIED">VERIFIED</SelectItem>
                    <SelectItem value="FAILED">FAILED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dns-json">
                Check result JSON{" "}
                <span className="text-[var(--text-muted)]">(optional)</span>
              </Label>
              <textarea
                id="dns-json"
                value={c.formJson}
                onChange={(e) => c.setFormJson(e.target.value)}
                placeholder='{"records": []}'
                disabled={c.editorBusy}
                rows={6}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                {c.editorBusy && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {c.formId !== null ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* delete confirmation */}
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
              This will permanently remove the DNS request for{" "}
              <span className="font-mono font-medium">
                {c.deleteTarget?.label}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={c.deleteBusy}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={c.confirmDelete}
              disabled={c.deleteBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {c.deleteBusy && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageLayout>
  );
}
