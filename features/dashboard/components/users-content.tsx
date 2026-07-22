"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle,
  Copy,
  Loader2,
  MailWarning,
  Pencil,
  Plus,
  Power,
  Shield,
  ShieldAlert,
  Trash2,
  Users,
  Zap,
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
import {
  useUsersController,
  type UserSearchField,
} from "@/features/dashboard/hooks/use-users-controller";
import type { AdminUser, BoolFilter } from "@/features/dashboard/types/admin.types";
import { copyText } from "@/features/dashboard/lib/admin-utils";

const SEARCH_FIELDS = [
  { value: "email", label: "Email", placeholder: "user@example.com" },
  { value: "username", label: "Username", placeholder: "johndoe" },
];

export function UsersContent() {
  const c = useUsersController();

  const columns = React.useMemo<ColumnDef<AdminUser>[]>(
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
        id: "user",
        accessorFn: (row) => row.username,
        header: "User",
        cell: ({ row }) => {
          const item = row.original;
          const isLastAdmin = c.isSoleActiveById(item.id);
          return (
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-[var(--text-primary)]">
                {item.username}
                {isLastAdmin ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-normal text-amber-500">
                    <ShieldAlert className="h-3 w-3" /> sole admin
                  </span>
                ) : null}
              </span>
              <span className="font-mono text-[12px] text-[var(--text-muted)]">
                {item.email}
              </span>
            </div>
          );
        },
      },
      {
        id: "role",
        accessorFn: (row) => (row.is_admin ? 1 : 0),
        header: "Role",
        cell: ({ row }) =>
          row.original.is_admin ? (
            <Badge variant="fancy" color="amber">
              <Shield className="mr-1 h-3 w-3" />
              Admin
            </Badge>
          ) : (
            <Badge variant="fancy" color="sky">
              User
            </Badge>
          ),
        size: 100,
      },
      {
        id: "verification",
        accessorFn: (row) => (row.email_verified_at ? 1 : 0),
        header: "Verification",
        cell: ({ row }) =>
          row.original.email_verified_at ? (
            <Badge
              variant="fancy"
              color="emerald"
              title={`Verified at ${safeDateLabel(row.original.email_verified_at)}`}
            >
              <CheckCircle className="mr-0.5 h-3 w-3" />
              Verified
            </Badge>
          ) : (
            <Badge variant="fancy" color="orange" title="Not verified">
              <MailWarning className="mr-0.5 h-3 w-3" />
              Pending
            </Badge>
          ),
        size: 120,
      },
      {
        id: "active",
        accessorFn: (row) => c.isTrueValue(row.is_active),
        header: "Active",
        cell: ({ row }) => {
          const item = row.original;
          const active = c.isTrueValue(item.is_active);
          const isLastAdmin = c.isSoleActiveById(item.id);
          return (
            <Switch
              checked={active}
              onCheckedChange={() => c.toggleActive(item)}
              disabled={isLastAdmin && active}
              aria-label={`Toggle ${item.username} active`}
            />
          );
        },
        size: 90,
      },
      {
        accessorKey: "last_login_at",
        header: "Last Login",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[13px] text-muted-foreground">
            {safeDateLabel(row.original.last_login_at)}
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
          const active = c.isTrueValue(item.is_active);
          const isLastAdmin = c.isSoleActiveById(item.id);
          return (
            <div className="flex justify-end pr-1">
              <AdminRowActions
                label={`Actions for ${item.username}`}
                items={[
                  {
                    key: "copy",
                    label: "Copy email",
                    icon: <Copy className="mr-2 h-4 w-4" />,
                    onSelect: () => copyText(item.email, "Email copied"),
                  },
                  {
                    key: "toggle",
                    label: active ? "Deactivate" : "Activate",
                    icon: <Power className="mr-2 h-4 w-4" />,
                    onSelect: () => void c.toggleActive(item),
                    disabled: isLastAdmin && active,
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
                    disabled: isLastAdmin,
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

        {c.list.loadedAt ? (
          <AdminMetricCards
            items={[
              {
                key: "total",
                label: "Total Users",
                value: c.list.total,
                hint: "Matching current filters",
                icon: <Users className="h-4 w-4 text-[var(--neu-green)]" />,
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
                key: "admins",
                label: "Admins (page)",
                value: c.pageAdminCount,
                hint: "On this page only",
                valueClassName: "text-2xl font-semibold tracking-tight text-sky-400",
                icon: <Shield className="h-4 w-4 text-sky-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/8",
              },
            ]}
          />
        ) : null}

        <AdminFilterToolbar
          fields={SEARCH_FIELDS}
          field={c.searchField}
          onFieldChange={(v) => c.setSearchField(v as UserSearchField)}
          query={c.search}
          onQueryChange={c.setSearch}
          filters={
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
          emptyIcon={<Users className="h-5 w-5" />}
          emptyTitle="No users found"
          emptyDescription="Create a new user account to get started."
          emptyAction={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add User
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
              {c.formId !== null ? `Edit user #${c.formId}` : "Add user"}
            </DialogTitle>
            <DialogDescription>
              {c.formId !== null
                ? "Update user details and permissions."
                : "Create a new user account."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-password">
                Password{c.formId !== null ? " (leave blank to keep)" : ""}
              </Label>
              <Input
                id="user-password"
                type="password"
                value={c.formPassword}
                onChange={(e) => c.setFormPassword(e.target.value)}
                placeholder={c.formId !== null ? "••••••" : "Min 6 characters"}
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
              {c.formId !== null && c.isSoleActiveById(c.formId) ? (
                <span className="ml-auto text-xs text-amber-500">
                  Cannot disable the last active admin
                </span>
              ) : null}
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
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
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
