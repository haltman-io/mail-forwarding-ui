"use client";

import * as React from "react";
import {
  Ban, ChevronLeft, ChevronRight, Loader2, Pencil, Plus, RefreshCw, Trash2,
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

import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import { AdminToolbar, AdminToolbarLeft, AdminToolbarRight } from "@/features/dashboard/components/admin-toolbar";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { useBansController } from "@/features/dashboard/hooks/use-bans-controller";
import type { BoolFilter, BanType } from "@/features/dashboard/types/admin.types";
import { safeDateLabel } from "@/lib/utils";

const BAN_TYPE_LABELS: Record<string, string> = {
  email: "Email",
  domain: "Domain",
  ip: "IP",
  name: "Name",
};

export function BansContent() {
  const c = useBansController();

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={<Ban className="h-4 w-4" />}
          title="Bans"
          description="Block emails, domains, IPs, or names from using the service."
          actions={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Ban
            </Button>
          }
        />

        <AdminToolbar>
          <AdminToolbarLeft>
            <Select value={c.activeFilter} onValueChange={(v) => c.setActiveFilter(v as BoolFilter)}>
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="1">Active only</SelectItem>
                <SelectItem value="0">Inactive only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={c.typeFilter} onValueChange={(v) => c.setTypeFilter(v as "all" | BanType)}>
              <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
                <SelectItem value="ip">IP</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search value…" value={c.search} onChange={(e) => c.setSearch(e.target.value)} className="h-8 w-[160px] text-xs" />
          </AdminToolbarLeft>
          <AdminToolbarRight>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={c.refresh} disabled={c.list.loading} title="Refresh">
              <RefreshCw className={`h-3.5 w-3.5 ${c.list.loading ? "animate-spin" : ""}`} />
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
              icon={<Ban className="h-5 w-5" />}
              title="No bans yet"
              description="Add a ban to block an email, domain, IP, or name."
              action={<Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}><Plus className="h-3.5 w-3.5" />Add Ban</Button>}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 pl-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</TableHead>
                    <TableHead className="w-24 text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Value</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reason</TableHead>
                    <TableHead className="w-24 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="w-32 text-xs font-medium uppercase tracking-wider text-muted-foreground">Expires</TableHead>
                    <TableHead className="w-20 pr-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.list.items.map((item) => (
                    <ContextMenu key={item.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow className="group transition-colors hover:bg-[var(--hover-state)] cursor-context-menu">
                          <TableCell className="pl-4 font-mono text-xs tabular-nums text-muted-foreground">{item.id}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[11px]">{BAN_TYPE_LABELS[item.ban_type] ?? item.ban_type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-[13px]">{item.ban_value}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{item.reason || "—"}</TableCell>
                          <TableCell>
                            {item.revoked_at
                              ? <Badge variant="outline">revoked</Badge>
                              : <Badge variant="regular" color="red">active</Badge>}
                          </TableCell>
                          <TableCell className="text-[13px] text-muted-foreground whitespace-nowrap">{safeDateLabel(item.expires_at)}</TableCell>
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
                  ))}
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
            <DialogTitle>{c.formId !== null ? `Edit ban #${c.formId}` : "Add ban"}</DialogTitle>
            <DialogDescription>{c.formId !== null ? "Update the ban details." : "Block an email, domain, IP, or name."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={c.formType} onValueChange={(v) => c.setFormType(v as BanType)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="ip">IP</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ban-value">Value</Label>
              <Input id="ban-value" value={c.formValue} onChange={(e) => c.setFormValue(e.target.value)} placeholder="e.g. spammer@evil.com" disabled={c.editorBusy} required autoComplete="off" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason (optional)</Label>
              <Input id="ban-reason" value={c.formReason} onChange={(e) => c.setFormReason(e.target.value)} placeholder="Spam, abuse, etc." disabled={c.editorBusy} autoComplete="off" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ban-expires">Expires at (optional)</Label>
              <Input id="ban-expires" type="datetime-local" value={c.formExpiresAt} onChange={(e) => c.setFormExpiresAt(e.target.value)} disabled={c.editorBusy} />
            </div>
            {c.formId !== null && (
              <>
                <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
                  <Switch checked={c.formRevoked} onCheckedChange={c.setFormRevoked} disabled={c.editorBusy} id="ban-revoked" />
                  <Label htmlFor="ban-revoked" className="cursor-pointer">Revoked</Label>
                </div>
                {c.formRevoked && (
                  <div className="space-y-2">
                    <Label htmlFor="ban-revoked-reason">Revoke reason</Label>
                    <Input id="ban-revoked-reason" value={c.formRevokedReason} onChange={(e) => c.setFormRevokedReason(e.target.value)} disabled={c.editorBusy} autoComplete="off" />
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
            <AlertDialogTitle>Delete ban?</AlertDialogTitle>
            <AlertDialogDescription>This will revoke <span className="font-mono font-medium">{c.deleteTarget?.label}</span>.</AlertDialogDescription>
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
