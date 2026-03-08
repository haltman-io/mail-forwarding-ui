"use client";

import * as React from "react";
import {
  ChevronLeft, ChevronRight, Loader2, Mail, Pencil, Plus, RefreshCw, Trash2,
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
import { useHandlesController } from "@/features/dashboard/hooks/use-handles-controller";
import type { BoolFilter } from "@/features/dashboard/types/admin.types";

export function HandlesContent({ token }: { token: string | null }) {
  const c = useHandlesController(token);

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={<Mail className="h-4 w-4" />}
          title="Handles"
          description="Map short handles to destination addresses."
          actions={
            <Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}>
              <Plus className="h-3.5 w-3.5" />
              Add Handle
            </Button>
          }
        />

        <AdminToolbar>
          <AdminToolbarLeft>
            <Select value={c.activeFilter} onValueChange={(v) => c.setActiveFilter(v as BoolFilter)}>
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="1">Active only</SelectItem>
                <SelectItem value="0">Inactive only</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search handle…" value={c.search} onChange={(e) => c.setSearch(e.target.value)} className="h-8 w-[180px] text-xs" />
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
              icon={<Mail className="h-5 w-5" />}
              title="No handles yet"
              description="Create your first handle to map a short name to an address."
              action={<Button size="sm" className="h-8 gap-1.5" onClick={c.openCreate}><Plus className="h-3.5 w-3.5" />Add Handle</Button>}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 pl-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Handle</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Address</TableHead>
                    <TableHead className="w-24 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="w-20 pr-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.list.items.map((item) => (
                    <ContextMenu key={item.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow className="group transition-colors hover:bg-[var(--hover-state)] cursor-context-menu">
                          <TableCell className="pl-4 font-mono text-xs tabular-nums text-muted-foreground">{item.id}</TableCell>
                          <TableCell className="font-mono text-[13px]">{item.handle}</TableCell>
                          <TableCell className="font-mono text-[13px] text-muted-foreground">{item.address}</TableCell>
                          <TableCell>
                            {c.isTrueValue(item.active)
                              ? <Badge variant="regular" color="emerald">active</Badge>
                              : <Badge variant="outline">inactive</Badge>}
                          </TableCell>
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

      <Dialog open={c.editorOpen} onOpenChange={c.setEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{c.formId !== null ? `Edit handle #${c.formId}` : "Add handle"}</DialogTitle>
            <DialogDescription>{c.formId !== null ? "Update the handle name, address, or status." : "Create a new handle mapping."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={c.submitEditor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="handle-name">Handle</Label>
              <Input id="handle-name" value={c.formHandle} onChange={(e) => c.setFormHandle(e.target.value.toLowerCase())} placeholder="myhandle" disabled={c.editorBusy} required autoComplete="off" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="handle-address">Address</Label>
              <Input id="handle-address" value={c.formAddress} onChange={(e) => c.setFormAddress(e.target.value.toLowerCase())} placeholder="user@example.com" disabled={c.editorBusy} required autoComplete="off" />
            </div>
            <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
              <Switch checked={c.formActive} onCheckedChange={c.setFormActive} disabled={c.editorBusy} id="handle-active" />
              <Label htmlFor="handle-active" className="cursor-pointer">Active</Label>
            </div>
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
            <AlertDialogTitle>Delete handle?</AlertDialogTitle>
            <AlertDialogDescription>This will remove <span className="font-mono font-medium">{c.deleteTarget?.label}</span>.</AlertDialogDescription>
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
