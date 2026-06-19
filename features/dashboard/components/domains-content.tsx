"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
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
  SelectGroup,
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

type BadgeColor = NonNullable<React.ComponentProps<typeof Badge>["color"]>;

function BooleanStatusBadge({
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

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        {/* ── page header ── */}
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

        {/* ── metric cards ── */}
        {c.domains.loadedAt && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                    Admin ON
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
                    EMAIL DNS
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-sky-400">
                    {c.emailDnsCount}
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/8">
                  <Mail className="h-4 w-4 text-sky-400" />
                </div>
              </div>
            </AdminDataCard>

            <AdminDataCard className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    UI DNS
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-indigo-400">
                    {c.uiDnsCount}
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/8">
                  <Monitor className="h-4 w-4 text-indigo-400" />
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
          </AdminToolbarLeft>

          <AdminToolbarRight>
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
                    <TableHead className="w-32 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Admin
                    </TableHead>
                    <TableHead className="w-20 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      EMAIL
                    </TableHead>
                    <TableHead className="w-20 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      UI
                    </TableHead>
                    <TableHead className="w-32 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Visible
                    </TableHead>
                    <TableHead className="w-20 pr-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.filteredItems.map((item) => {
                    const adminOn = c.isTrueValue(item.active);
                    const emailOn = c.isTrueValue(item.active_mx);
                    const uiOn = c.isTrueValue(item.active_ui);
                    const visibleOn = c.readVisibleValue(item);
                    const rowRechecking = c.isRecheckingDomain(item.id);

                    return (
                      <ContextMenu key={item.id}>
                        <ContextMenuTrigger asChild>
                          <TableRow className="group cursor-context-menu transition-colors hover:bg-[var(--hover-state)]">
                            <TableCell className="pl-4 font-mono text-xs tabular-nums text-muted-foreground">
                              {item.id}
                            </TableCell>
                            <TableCell className="font-mono text-[13px]">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Switch
                                  checked={adminOn}
                                  onCheckedChange={() => c.toggleActive(item)}
                                  aria-label={`Toggle ${item.name} admin access`}
                                />
                                <BooleanStatusBadge isOn={adminOn} />
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <BooleanStatusBadge isOn={emailOn} />
                            </TableCell>
                            <TableCell className="text-center">
                              <BooleanStatusBadge isOn={uiOn} />
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Switch
                                  checked={visibleOn}
                                  onCheckedChange={() => c.toggleVisible(item)}
                                  aria-label={`Toggle ${item.name} public visibility`}
                                />
                                <BooleanStatusBadge isOn={visibleOn} />
                              </div>
                            </TableCell>
                            <TableCell className="pr-4 text-right">
                              <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => c.recheckDomain(item)}
                                  disabled={rowRechecking}
                                  title="Recheck DNS"
                                >
                                  {rowRechecking ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-3 w-3" />
                                  )}
                                </Button>
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
                        <ContextMenuContent className="w-56">
                          <ContextMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(item.name);
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy domain
                          </ContextMenuItem>
                          <ContextMenuItem
                            disabled={rowRechecking}
                            onClick={() => c.recheckDomain(item)}
                          >
                            {rowRechecking ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Recheck DNS
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => c.toggleActive(item)}>
                            <Power className="mr-2 h-4 w-4" />
                            {adminOn ? "Deactivate admin" : "Activate admin"}
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => c.toggleVisible(item)}>
                            {visibleOn ? (
                              <EyeOff className="mr-2 h-4 w-4" />
                            ) : (
                              <Eye className="mr-2 h-4 w-4" />
                            )}
                            {visibleOn ? "Hide public listing" : "Show public listing"}
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => c.openEdit(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            variant="destructive"
                            onClick={() => c.askDelete(item)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    );
                  })}
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
                ? "Update the domain name, admin gate, or public visibility."
                : "Enter a domain name and choose its initial admin/public gates."}
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
