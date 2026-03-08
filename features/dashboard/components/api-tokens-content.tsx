"use client";

import * as React from "react";
import {
  ChevronLeft, ChevronRight, Copy, KeyRound, Loader2, Pencil, Plus, RefreshCw, Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import { AdminToolbar, AdminToolbarLeft, AdminToolbarRight } from "@/features/dashboard/components/admin-toolbar";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { useApiTokensController } from "@/features/dashboard/hooks/use-api-tokens-controller";
import type { TokenStatusFilter } from "@/features/dashboard/types/admin.types";
import { safeDateLabel } from "@/lib/utils";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function tokenStatus(item: { revoked_at?: string | null; expires_at?: string | null }) {
  if (item.revoked_at) return "revoked" as const;
  if (item.expires_at && new Date(item.expires_at).getTime() < Date.now()) return "expired" as const;
  return "active" as const;
}

const STATUS_BADGE: Record<string, React.ReactNode> = {
  active: <Badge variant="regular" color="emerald">active</Badge>,
  revoked: <Badge variant="outline">revoked</Badge>,
  expired: <Badge variant="outline" className="border-amber-400/40 text-amber-500">expired</Badge>,
};

export function ApiTokensContent({ token }: { token: string | null }) {
  const c = useApiTokensController(token);

  /* copy plaintext token to clipboard when one is created */
  React.useEffect(() => {
    if (!c.createdPlaintext) return;
    void navigator.clipboard.writeText(c.createdPlaintext).then(
      () => toast.info("Token copied to clipboard — save it now, you won't see it again."),
      () => { /* clipboard access denied — no-op, user can still copy manually */ },
    );
  }, [c.createdPlaintext]);

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={<KeyRound className="h-4 w-4" />}
          title="API Tokens"
          description="Manage bearer tokens used for programmatic API access."
          actions={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Create Token
            </Button>
          }
        />

        <AdminToolbar>
          <AdminToolbarLeft>
            <Select value={c.statusFilter} onValueChange={(v) => c.setStatusFilter(v as TokenStatusFilter)}>
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search owner…" value={c.ownerSearch} onChange={(e) => c.setOwnerSearch(e.target.value)} className="h-8 w-[180px] text-xs" />
          </AdminToolbarLeft>
          <AdminToolbarRight>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={c.refresh} disabled={c.list.loading} title="Refresh">
              <RefreshCw className={`h-3.5 w-3.5 ${c.list.loading ? "animate-spin" : ""}`} />
            </Button>
          </AdminToolbarRight>
        </AdminToolbar>

        {/* Created plaintext token banner */}
        {c.createdPlaintext && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-50/60 px-4 py-3 dark:bg-emerald-950/20">
            <KeyRound className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">New token created — copy it now, it won't be shown again.</p>
              <code className="mt-1 block break-all font-mono text-xs text-emerald-700 dark:text-emerald-200">{c.createdPlaintext}</code>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => { void navigator.clipboard.writeText(c.createdPlaintext!); toast.info("Copied"); }}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => c.setCreatedPlaintext(null)}>Dismiss</Button>
          </div>
        )}

        <AdminDataCard>
          {c.list.loading && c.list.items.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : c.list.items.length === 0 ? (
            <EmptyState
              icon={<KeyRound className="h-5 w-5" />}
              title="No API tokens"
              description="Create a bearer token for programmatic access."
              action={<Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}><Plus className="h-3.5 w-3.5" />Create Token</Button>}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 pl-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Owner</TableHead>
                    <TableHead className="w-24 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="w-32 text-xs font-medium uppercase tracking-wider text-muted-foreground">Expires</TableHead>
                    <TableHead className="w-32 text-xs font-medium uppercase tracking-wider text-muted-foreground">Last Used</TableHead>
                    <TableHead className="w-20 pr-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.list.items.map((item) => {
                    const s = tokenStatus(item);
                    return (
                      <ContextMenu key={item.id}>
                        <ContextMenuTrigger asChild>
                          <TableRow className="group transition-colors hover:bg-[var(--hover-state)] cursor-context-menu">
                            <TableCell className="pl-4 font-mono text-xs tabular-nums text-muted-foreground">{item.id}</TableCell>
                            <TableCell className="font-mono text-[13px]">{item.owner_email}</TableCell>
                            <TableCell>{STATUS_BADGE[s]}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{formatDate(item.expires_at)}</TableCell>
                            <TableCell className="text-[13px] text-muted-foreground whitespace-nowrap">{safeDateLabel(item.last_used_at)}</TableCell>
                            <TableCell className="pr-4 text-right">
                              <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => c.openEdit(item)} title="Edit"><Pencil className="h-3 w-3" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => c.askDelete(item)} title="Delete"><Trash2 className="h-3 w-3" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          <ContextMenuItem onClick={() => c.openEdit(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </ContextMenuItem>
                          <ContextMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => c.askDelete(item)}>
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
                <span className="text-xs tabular-nums text-muted-foreground">{c.rangeFrom}–{c.rangeTo} of {c.list.total}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={c.goPrev} disabled={!c.canPrev || c.list.loading}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={c.goNext} disabled={!c.canNext || c.list.loading}><ChevronRight className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </>
          )}
        </AdminDataCard>

        {c.list.error && !c.list.loading && <p className="text-sm text-destructive">{c.list.error}</p>}
      </div>

      {/* editor dialog */}
      <Dialog open={c.editorOpen} onOpenChange={c.setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{c.formId !== null ? `Edit token #${c.formId}` : "Create API token"}</DialogTitle>
            <DialogDescription>{c.formId !== null ? "Update token details." : "Generate a new bearer token."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token-owner">Owner email</Label>
              <Input id="token-owner" type="email" value={c.formOwnerEmail} onChange={(e) => c.setFormOwnerEmail(e.target.value)} placeholder="admin@example.com" disabled={c.editorBusy} required autoComplete="off" />
            </div>
            {c.formId === null ? (
              <div className="space-y-2">
                <Label htmlFor="token-days">Validity (days, 1–90)</Label>
                <Input id="token-days" type="number" min={1} max={90} value={c.formDays} onChange={(e) => c.setFormDays(e.target.value)} disabled={c.editorBusy} />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="token-expires">Expires at</Label>
                  <Input id="token-expires" type="datetime-local" value={c.formExpiresAt} onChange={(e) => c.setFormExpiresAt(e.target.value)} disabled={c.editorBusy} />
                </div>
                <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
                  <Switch checked={c.formRevoked} onCheckedChange={c.setFormRevoked} disabled={c.editorBusy} id="token-revoked" />
                  <Label htmlFor="token-revoked" className="cursor-pointer">Revoked</Label>
                </div>
                {c.formRevoked && (
                  <div className="space-y-2">
                    <Label htmlFor="token-revoked-reason">Revoke reason</Label>
                    <Input id="token-revoked-reason" value={c.formRevokedReason} onChange={(e) => c.setFormRevokedReason(e.target.value)} disabled={c.editorBusy} autoComplete="off" />
                  </div>
                )}
              </>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => c.setEditorOpen(false)} disabled={c.editorBusy}>Cancel</Button>
              <Button type="submit" disabled={c.editorBusy}>
                {c.editorBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {c.formId !== null ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={c.deleteTarget !== null} onOpenChange={(open) => { if (!open) c.setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API token?</AlertDialogTitle>
            <AlertDialogDescription>This will revoke the token for <span className="font-mono font-medium">{c.deleteTarget?.label}</span>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={c.deleteBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={c.confirmDelete} disabled={c.deleteBusy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {c.deleteBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageLayout>
  );
}
