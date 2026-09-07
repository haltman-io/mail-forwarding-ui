"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Link2,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Send,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

import { safeDateLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import { AdminMetricCards } from "@/features/dashboard/components/admin-metric-cards";
import { AdminFilterToolbar } from "@/features/dashboard/components/admin-filter-toolbar";
import { AdminDataTable } from "@/features/dashboard/components/admin-data-table";
import { AdminRowActions } from "@/features/dashboard/components/admin-row-actions";
import { useSmtpCredentialsController } from "@/features/dashboard/hooks/use-smtp-credentials-controller";
import { copyText, isTrueValue } from "@/features/dashboard/lib/admin-utils";
import type { AdminSmtpCredential } from "@/features/dashboard/types/admin.types";

export function SmtpCredentialsContent() {
  const c = useSmtpCredentialsController();

  const [showPassword, setShowPassword] = React.useState(false);

  function generateRandomPassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pwd = "";
    const array = new Uint8Array(20);
    crypto.getRandomValues(array);
    for (let i = 0; i < 20; i++) {
      pwd += chars[array[i] % chars.length];
    }
    c.setFormPassword(pwd);
    setShowPassword(true);
  }

  const columns = React.useMemo<ColumnDef<AdminSmtpCredential>[]>(
    () => [
      {
        accessorKey: "username",
        header: "Username / Login",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[13px] font-medium text-[var(--text-primary)]">
              {row.original.username}
            </span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              ID: #{row.original.id}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "allowed_senders",
        header: "Allowed Sender ACLs",
        cell: ({ row }) => {
          const senders = row.original.allowed_senders;
          if (senders.length === 0) {
            return (
              <span className="text-xs italic text-[var(--text-muted)]">
                No senders configured
              </span>
            );
          }

          return (
            <div className="flex flex-wrap items-center gap-1.5 py-1">
              {senders.slice(0, 3).map((sender) => (
                <Badge
                  key={sender}
                  variant="fancy"
                  color="sky"
                  className="font-mono text-[11px]"
                >
                  {sender}
                </Badge>
              ))}
              {senders.length > 3 && (
                <Badge variant="fancy" className="text-[10px]">
                  +{senders.length - 3} more
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => {
          const active = isTrueValue(row.original.active);
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={active}
                onCheckedChange={() => void c.toggleActive(row.original)}
                aria-label={`Toggle active for ${row.original.username}`}
              />
              <span
                className={`text-[12px] font-medium ${
                  active ? "text-emerald-400" : "text-[var(--text-muted)]"
                }`}
              >
                {active ? "Active" : "Paused"}
              </span>
            </div>
          );
        },
        size: 130,
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
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const item = row.original;
          const firstSender = item.allowed_senders[0];

          return (
            <div className="flex justify-end pr-1">
              <AdminRowActions
                label={`Actions for ${item.username}`}
                items={[
                  {
                    key: "copy-username",
                    label: "Copy username",
                    icon: <Copy className="mr-2 h-4 w-4" />,
                    onSelect: () => copyText(item.username, "Username copied"),
                  },
                  {
                    key: "copy-senders",
                    label: "Copy sender ACLs",
                    icon: <Mail className="mr-2 h-4 w-4" />,
                    disabled: item.allowed_senders.length === 0,
                    onSelect: () =>
                      copyText(
                        item.allowed_senders.join(", "),
                        "Allowed senders copied",
                      ),
                  },
                  {
                    key: "invite",
                    label: "Generate setup link",
                    icon: <Link2 className="mr-2 h-4 w-4" />,
                    onSelect: () => c.openInvite(firstSender),
                    separatorBefore: true,
                  },
                  {
                    key: "edit",
                    label: "Edit / Change password",
                    icon: <Pencil className="mr-2 h-4 w-4" />,
                    onSelect: () => c.openEdit(item),
                  },
                  {
                    key: "delete",
                    label: "Delete credential",
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
          icon={<Send className="h-4 w-4" />}
          title="SMTP Submission"
          description="Manage port 587 authentication credentials and allowed sender ACLs for mail forwarding."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => c.openInvite()}
              >
                <Link2 className="h-3.5 w-3.5" />
                Generate Invite Link
              </Button>
              <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
                <Plus className="h-3.5 w-3.5" />
                Add Credential
              </Button>
            </div>
          }
        />

        {c.list.loadedAt ? (
          <AdminMetricCards
            columnsClassName="sm:grid-cols-2 lg:grid-cols-4"
            items={[
              {
                key: "total",
                label: "Total Credentials",
                value: c.list.total,
                hint: "Matching current filters",
                icon: <Send className="h-4 w-4 text-[var(--neu-green)]" />,
              },
              {
                key: "active",
                label: "Active Users (page)",
                value: c.activeCount,
                hint: "Enabled submission logins",
                valueClassName:
                  "text-2xl font-semibold tracking-tight text-emerald-400",
                icon: <UserCheck className="h-4 w-4 text-emerald-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/8",
              },
              {
                key: "inactive",
                label: "Paused Users (page)",
                value: c.inactiveCount,
                hint: "Temporarily disabled logins",
                valueClassName:
                  "text-2xl font-semibold tracking-tight text-amber-400",
                icon: <UserX className="h-4 w-4 text-amber-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/8",
              },
              {
                key: "senders",
                label: "Allowed Senders (page)",
                value: c.totalSendersOnPage,
                hint: "Total mapped aliases",
                icon: <Mail className="h-4 w-4 text-sky-400" />,
                iconWrapClassName:
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/8",
              },
            ]}
          />
        ) : null}

        <AdminFilterToolbar
          query={c.search}
          onQueryChange={c.setSearch}
          fields={[
            {
              value: "username",
              label: "Username",
              placeholder: "Search by username…",
            },
          ]}
          filters={
            <>
              <Select
                value={c.activeFilter}
                onValueChange={c.setActiveFilter}
              >
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Paused</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Filter by sender (e.g. alias@...)"
                value={c.senderFilter}
                onChange={(e) => c.setSenderFilter(e.target.value)}
                className="h-8 w-[200px] text-xs"
              />
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
          emptyIcon={<Send className="h-5 w-5" />}
          emptyTitle="No SMTP credentials"
          emptyDescription="Create a submission credential or invite link to allow clients to send mail."
          emptyAction={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Credential
            </Button>
          }
          filterActive={c.hasActiveFilters}
          filterLabel={c.search.trim() || c.senderFilter.trim() || undefined}
          onClearFilters={c.clearFilters}
          onPageChange={c.setPageOffset}
          onPageSizeChange={c.setPageSize}
        />

        {c.list.error && !c.list.loading ? (
          <p className="text-sm text-destructive">{c.list.error}</p>
        ) : null}
      </div>

      {/* ── Create / Edit Credential Dialog ── */}
      <Dialog open={c.editorOpen} onOpenChange={c.setEditorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {c.formMode === "create"
                ? "Add SMTP Credential"
                : `Edit SMTP Credential "${c.formUsername}"`}
            </DialogTitle>
            <DialogDescription>
              {c.formMode === "create"
                ? "Configure authentication and allowed sender addresses for port 587 submission."
                : "Update password, allowed sender ACLs, or active state."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="smtp-username">Username / Login</Label>
              <Input
                id="smtp-username"
                value={c.formUsername}
                onChange={(e) => c.setFormUsername(e.target.value.toLowerCase())}
                placeholder="e.g. app-sender or user@domain.com"
                disabled={c.editorBusy || c.formMode === "edit"}
                required
                autoComplete="off"
                className="font-mono text-xs"
              />
              {c.formMode === "create" && (
                <p className="text-[11px] text-[var(--text-muted)]">
                  Alphanumeric characters, dots, hyphens, and underscores. Min 3
                  chars.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="smtp-password">
                  {c.formMode === "create"
                    ? "Password (optional)"
                    : "New Password (leave empty to keep unchanged)"}
                </Label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] font-medium text-[var(--neu-green)] hover:underline"
                >
                  Generate Strong
                </button>
              </div>
              <div className="relative">
                <Input
                  id="smtp-password"
                  type={showPassword ? "text" : "password"}
                  value={c.formPassword}
                  onChange={(e) => c.setFormPassword(e.target.value)}
                  placeholder={
                    c.formMode === "create"
                      ? "Auto-generated if left blank (min 8 chars)"
                      : "Enter new password to change"
                  }
                  disabled={c.editorBusy}
                  autoComplete="new-password"
                  className="pr-10 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="smtp-senders">
                Allowed Sender Addresses (ACLs)
              </Label>
              <textarea
                id="smtp-senders"
                value={c.formSendersText}
                onChange={(e) => c.setFormSendersText(e.target.value)}
                placeholder={"alias1@domain.com\nalias2@domain.com"}
                rows={4}
                disabled={c.editorBusy}
                required={c.formMode === "create"}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                One address per line or comma-separated. Senders must be active
                aliases hosted on a domain with active MX.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] p-3">
              <div className="space-y-0.5">
                <Label htmlFor="smtp-active" className="text-xs font-medium">
                  Active Status
                </Label>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Enable or temporarily pause submission logins for this user.
                </p>
              </div>
              <Switch
                id="smtp-active"
                checked={c.formActive}
                onCheckedChange={c.setFormActive}
                disabled={c.editorBusy}
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
                {c.formMode === "create" ? "Create Credential" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Post-Creation Success Dialog ── */}
      <Dialog open={c.createdModalOpen} onOpenChange={c.setCreatedModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <DialogTitle>SMTP Credential Created</DialogTitle>
            </div>
            <DialogDescription>
              Save these submission details. The plain password will not be
              shown again.
            </DialogDescription>
          </DialogHeader>

          {c.createdResult && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.3)] p-4 font-mono text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Username:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {c.createdResult.username}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() =>
                        copyText(c.createdResult!.username, "Username copied")
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {c.createdResult.password && (
                  <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-2">
                    <span className="text-[var(--text-muted)]">Password:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-400">
                        {c.createdResult.password}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() =>
                          copyText(c.createdResult!.password!, "Password copied")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between border-t border-[rgba(255,255,255,0.06)] pt-2">
                  <span className="text-[var(--text-muted)]">Allowed From:</span>
                  <div className="flex flex-col items-end gap-1">
                    {c.createdResult.allowed_senders.map((s) => (
                      <span key={s} className="text-[var(--text-secondary)]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-2">
                  <span className="text-[var(--text-muted)]">Port & Security:</span>
                  <span className="text-[var(--text-secondary)]">
                    Port 587 (STARTTLS)
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (c.createdResult) {
                  const conf = `SMTP Username: ${c.createdResult.username}\nSMTP Password: ${c.createdResult.password || "(kept)"}\nAllowed Senders: ${c.createdResult.allowed_senders.join(", ")}\nPort: 587 STARTTLS`;
                  copyText(conf, "Configuration copied to clipboard");
                }
              }}
            >
              Copy Full Config
            </Button>
            <Button
              type="button"
              onClick={() => c.setCreatedModalOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Generate Invite Modal ── */}
      <Dialog open={c.inviteModalOpen} onOpenChange={c.setInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate SMTP Setup Link</DialogTitle>
            <DialogDescription>
              Create a single-use self-service invite link for a client or user
              to configure their SMTP credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitInvite} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="invite-constraint">
                Lock to Sender Address (optional)
              </Label>
              <Input
                id="invite-constraint"
                value={c.inviteConstraint}
                onChange={(e) =>
                  c.setInviteConstraint(e.target.value.toLowerCase())
                }
                placeholder="e.g. user@domain.com (or leave empty for any alias)"
                disabled={c.inviteBusy}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-[var(--text-muted)]">
                If provided, the user can only claim credentials for this
                exact alias.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="invite-ttl">Link Expiration (TTL)</Label>
              <Select
                value={c.inviteTtlHours}
                onValueChange={c.setInviteTtlHours}
                disabled={c.inviteBusy}
              >
                <SelectTrigger id="invite-ttl" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="72">72 hours (3 days)</SelectItem>
                  <SelectItem value="168">7 days</SelectItem>
                  <SelectItem value="720">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => c.setInviteModalOpen(false)}
                disabled={c.inviteBusy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={c.inviteBusy}>
                {c.inviteBusy && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Invite Result Dialog ── */}
      <Dialog
        open={c.inviteResultModalOpen}
        onOpenChange={c.setInviteResultModalOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[var(--neu-green)]">
              <Link2 className="h-5 w-5" />
              <DialogTitle>Setup Link Generated</DialogTitle>
            </div>
            <DialogDescription>
              Share this single-use link with the user. They can set their own
              password and retrieve SMTP configuration.
            </DialogDescription>
          </DialogHeader>

          {c.inviteResult && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.3)] p-4 space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Setup URL
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={(() => {
                        // Transform backend URL into UI public URL if needed
                        const tokenMatch = c.inviteResult.setup_url.match(
                          /\/api\/smtp-setup\/([^/?#]+)/,
                        );
                        if (tokenMatch && typeof window !== "undefined") {
                          return `${window.location.origin}/smtp-setup?token=${tokenMatch[1]}`;
                        }
                        return c.inviteResult.setup_url;
                      })()}
                      className="font-mono text-xs selection:bg-emerald-500/20"
                    />
                    <Button
                      size="sm"
                      className="h-9 gap-1.5 shrink-0"
                      onClick={() => {
                        const tokenMatch = c.inviteResult!.setup_url.match(
                          /\/api\/smtp-setup\/([^/?#]+)/,
                        );
                        const url =
                          tokenMatch && typeof window !== "undefined"
                            ? `${window.location.origin}/smtp-setup?token=${tokenMatch[1]}`
                            : c.inviteResult!.setup_url;
                        copyText(url, "Setup URL copied");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-[rgba(255,255,255,0.06)]">
                  <div>
                    <span className="text-[var(--text-muted)]">Locked Sender:</span>
                    <p className="font-mono font-medium text-[var(--text-primary)]">
                      {c.inviteResult.allowed_sender_constraint || "Any active alias"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">Expires:</span>
                    <p className="text-[var(--text-primary)]">
                      {safeDateLabel(c.inviteResult.expires_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              onClick={() => c.setInviteResultModalOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation AlertDialog ── */}
      <AlertDialog
        open={c.deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) c.setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              Delete SMTP Credential?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete credential{" "}
              <span className="font-mono font-medium text-[var(--text-primary)]">
                {c.deleteTarget?.label}
              </span>
              ? This user will immediately lose access to port 587 submission
              and their sender ACL mappings will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={c.deleteBusy}>Cancel</AlertDialogCancel>
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
