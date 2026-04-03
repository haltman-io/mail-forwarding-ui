"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Globe,
  Loader2,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
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
import { Switch } from "@/components/ui/switch";
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

import { useDomainsController } from "@/features/dashboard/hooks/use-domains-controller";
import type { BoolFilter } from "@/features/dashboard/types/domains.types";

export function DomainsContent() {
  const c = useDomainsController();

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        {/* ── page header ── */}
        <AdminPageHeader
          icon={<Globe className="h-4 w-4" />}
          title="Domains"
          description="Manage forwarding domains. Delete performs soft‑delete (active = 0)."
          actions={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Domain
            </Button>
          }
        />

        {/* ── metric cards ── */}
        {c.domains.loadedAt && (
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminDataCard className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Total Domains
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                    {c.domains.total}
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
                    Active
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-emerald-400">
                    {c.activeCount}
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/8">
                  <Zap className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            </AdminDataCard>

            <AdminDataCard className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Inactive
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-[var(--text-secondary)]">
                    {c.inactiveCount}
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]">
                  <Power className="h-4 w-4 text-[var(--text-muted)]" />
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
          </AdminToolbarLeft>

          <AdminToolbarRight>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={c.refresh}
              disabled={c.domains.loading}
              title="Refresh"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${c.domains.loading ? "animate-spin" : ""}`}
              />
            </Button>
          </AdminToolbarRight>
        </AdminToolbar>

        {/* ── data surface ── */}
        <AdminDataCard>
          {c.domains.loading && c.domains.items.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : c.domains.items.length === 0 ? (
            <EmptyState
              icon={<Globe className="h-5 w-5" />}
              title="No domains yet"
              description="Add your first forwarding domain to start creating aliases."
              action={
                <Button
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={c.openCreate}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Domain
                </Button>
              }
            />
          ) : c.filteredItems.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-12">
              <Search className="h-5 w-5 text-[var(--text-muted)]" />
              <p className="text-[13px] text-[var(--text-muted)]">
                No domains matching &ldquo;{c.search}&rdquo;
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
                      Domain
                    </TableHead>
                    <TableHead className="w-24 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="w-20 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Active
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
                        <TableRow className="group transition-colors hover:bg-[var(--hover-state)] cursor-context-menu">
                          <TableCell className="pl-4 font-mono text-xs tabular-nums text-muted-foreground">
                            {item.id}
                          </TableCell>
                          <TableCell className="font-mono text-[13px]">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            {c.isTrueValue(item.active) ? (
                              <Badge variant="fancy" color="emerald">
                                active
                              </Badge>
                            ) : (
                              <Badge variant="fancy">inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={c.isTrueValue(item.active)}
                              onCheckedChange={() => c.toggleActive(item)}
                              aria-label={`Toggle ${item.name} active`}
                              className="mx-auto"
                            />
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
                            navigator.clipboard.writeText(item.name);
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy domain
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => c.toggleActive(item)}>
                          <Power className="mr-2 h-4 w-4" />
                          {c.isTrueValue(item.active) ? "Deactivate" : "Activate"}
                        </ContextMenuItem>
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

              {/* ── pagination ── */}
              <div className="flex items-center justify-between border-t border-[var(--hairline-border)] px-4 py-3">
                <span className="text-xs tabular-nums text-muted-foreground">
                  {c.rangeFrom}–{c.rangeTo} of {c.domains.total}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={c.goPrev}
                    disabled={!c.canPrev || c.domains.loading}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={c.goNext}
                    disabled={!c.canNext || c.domains.loading}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </AdminDataCard>

        {/* ── error ── */}
        {c.domains.error && !c.domains.loading && (
          <p className="text-sm text-destructive">{c.domains.error}</p>
        )}
      </div>

      {/* ── editor dialog ── */}
      <Dialog open={c.editorOpen} onOpenChange={c.setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {c.formId !== null ? `Edit domain #${c.formId}` : "Add domain"}
            </DialogTitle>
            <DialogDescription>
              {c.formId !== null
                ? "Update the domain name or toggle its active status."
                : "Enter a domain name to register for mail forwarding."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={c.submitEditor} className="space-y-4">
            <div className="space-y-2">
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
                {c.editorBusy && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {c.formId !== null ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── delete confirmation ── */}
      <AlertDialog
        open={c.deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) c.setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete domain?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete{" "}
              <span className="font-mono font-medium">
                {c.deleteTarget?.name}
              </span>{" "}
              by setting active&nbsp;=&nbsp;0.
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
