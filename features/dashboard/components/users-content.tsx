"use client";

import * as React from "react";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  MailWarning,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  Users,
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
import { useUsersController } from "@/features/dashboard/hooks/use-users-controller";
import type { BoolFilter } from "@/features/dashboard/types/admin.types";
import { safeDateLabel } from "@/lib/utils";

export function UsersContent() {
  const c = useUsersController();

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={<Users className="h-4 w-4" />}
          title="Users"
          description="Manage user accounts, roles, and permissions."
          actions={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add User
            </Button>
          }
        />

        {/* ── metric cards ── */}
        {c.list.loadedAt && (
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminDataCard className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Total Users
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                    {c.list.total}
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                  <Users className="h-4 w-4 text-[var(--neu-green)]" />
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
                    Admins
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-sky-400">
                    {c.adminCount}
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/8">
                  <Shield className="h-4 w-4 text-sky-400" />
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
                placeholder="Search email…"
                value={c.search}
                onChange={(e) => c.setSearch(e.target.value)}
                className="h-8 w-[200px] pl-8 text-xs"
              />
            </div>
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
          ) : c.list.items.length === 0 && c.search.trim() ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 py-12">
              <Search className="h-5 w-5 text-[var(--text-muted)]" />
              <p className="text-[13px] text-[var(--text-muted)]">
                No users matching &ldquo;{c.search}&rdquo;
              </p>
            </div>
          ) : c.list.items.length === 0 ? (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No users found"
              description="Create a new user account to get started."
              action={
                <Button
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={c.openCreate}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add User
                </Button>
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 pl-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      ID
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      User
                    </TableHead>
                    <TableHead className="w-24 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Role
                    </TableHead>
                    <TableHead className="w-24 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Email
                    </TableHead>
                    <TableHead className="w-24 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="w-20 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Active
                    </TableHead>
                    <TableHead className="w-36 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Last Login
                    </TableHead>
                    <TableHead className="w-20 pr-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.list.items.map((item) => {
                    const active = c.isTrueValue(item.is_active);
                    const isLastAdmin = c.isSoleActiveById(item.id);
                    const emailVerified = !!item.email_verified_at;
                    return (
                      <ContextMenu key={item.id}>
                        <ContextMenuTrigger asChild>
                          <TableRow className={`group cursor-context-menu transition-colors hover:bg-[var(--hover-state)] ${active ? "" : "opacity-40"}`}>
                            <TableCell className="pl-4 font-mono text-xs tabular-nums text-muted-foreground">
                              {item.id}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-medium text-[var(--text-primary)]">
                                  {item.username}
                                  {isLastAdmin && (
                                    <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-normal text-amber-500">
                                      <ShieldAlert className="h-3 w-3" /> sole admin
                                    </span>
                                  )}
                                </span>
                                <span className="font-mono text-[12px] text-[var(--text-muted)]">
                                  {item.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.is_admin ? (
                                <Badge variant="fancy" color="amber">
                                  <Shield className="mr-1 h-3 w-3" />
                                  Admin
                                </Badge>
                              ) : (
                                <Badge variant="fancy" color="sky">
                                  User
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {emailVerified ? (
                                <Badge variant="fancy" color="emerald" title={`Verified at ${safeDateLabel(item.email_verified_at)}`}>
                                  <CheckCircle className="mr-0.5 h-3 w-3" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="fancy" color="orange" title="Not verified">
                                  <MailWarning className="mr-0.5 h-3 w-3" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {active ? (
                                <Badge variant="fancy" color="emerald">
                                  active
                                </Badge>
                              ) : (
                                <Badge variant="fancy" color="red">
                                  inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={active}
                                onCheckedChange={() => c.toggleActive(item)}
                                disabled={isLastAdmin && active}
                                aria-label={`Toggle ${item.username} active`}
                                className="mx-auto"
                              />
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-[13px] text-muted-foreground">
                              {safeDateLabel(item.last_login_at)}
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
                                  disabled={isLastAdmin}
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
                              navigator.clipboard.writeText(item.email);
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy email
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            disabled={isLastAdmin && active}
                            onClick={() => c.toggleActive(item)}
                          >
                            <Power className="mr-2 h-4 w-4" />
                            {active ? "Deactivate" : "Activate"}
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => c.openEdit(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            disabled={isLastAdmin}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {c.formId !== null ? `Edit user #${c.formId}` : "Add user"}
            </DialogTitle>
            <DialogDescription>
              {c.formId !== null
                ? "Update user details and permissions."
                : "Create a new user account."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-username">Username</Label>
              <Input
                id="user-username"
                value={c.formUsername}
                onChange={(e) => c.setFormUsername(e.target.value)}
                placeholder="johndoe"
                disabled={c.editorBusy}
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={c.formEmail}
                onChange={(e) => c.setFormEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={c.editorBusy}
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">
                Password
                {c.formId !== null ? " (leave blank to keep)" : ""}
              </Label>
              <Input
                id="user-password"
                type="password"
                value={c.formPassword}
                onChange={(e) => c.setFormPassword(e.target.value)}
                placeholder={
                  c.formId !== null ? "••••••" : "Min 6 characters"
                }
                disabled={c.editorBusy}
                required={c.formId === null}
                autoComplete="new-password"
              />
            </div>
            <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
              <Switch
                checked={c.formIsAdmin}
                onCheckedChange={c.setFormIsAdmin}
                disabled={c.editorBusy}
                id="user-is-admin"
              />
              <Label htmlFor="user-is-admin" className="cursor-pointer">
                Administrator
              </Label>
              <span className="ml-auto text-[11px] text-[var(--text-muted)]">
                Full dashboard access
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
              <Switch
                checked={c.formActive}
                onCheckedChange={c.setFormActive}
                disabled={
                  c.editorBusy ||
                  (c.formId !== null && c.isSoleActiveById(c.formId))
                }
                id="user-active"
              />
              <Label htmlFor="user-active" className="cursor-pointer">
                Active
              </Label>
              {c.formId !== null && c.isSoleActiveById(c.formId) && (
                <span className="ml-auto text-xs text-amber-500">
                  Cannot disable the last active admin
                </span>
              )}
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

      <AlertDialog
        open={c.deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) c.setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-mono font-medium">
                {c.deleteTarget?.label}
              </span>
              .
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
