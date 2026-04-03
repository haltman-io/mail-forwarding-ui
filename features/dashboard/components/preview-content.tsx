"use client";

import * as React from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookmarkPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardCopy,
  Code,
  Copy,
  Download,
  Eye,
  FileText,
  Filter,
  FolderOpen,
  Globe,
  Info,
  Layers,
  Link,
  Mail,
  Monitor,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Scissors,
  Search,
  Server,
  Share2,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AdminPageLayout } from "@/features/dashboard/components/admin-page-layout";
import { AdminPageHeader } from "@/features/dashboard/components/admin-page-header";
import {
  AdminToolbar,
  AdminToolbarLeft,
  AdminToolbarRight,
} from "@/features/dashboard/components/admin-toolbar";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";

/* ────────────────────────────────────────────────────────────
   Fake data
   ──────────────────────────────────────────────────────────── */

const statsCards = [
  { label: "Total Forwards", value: "12,847", change: "+12.5%", up: true, icon: Mail },
  { label: "Active Aliases", value: "342", change: "+4.1%", up: true, icon: Zap },
  { label: "Blocked Attempts", value: "1,029", change: "-8.3%", up: false, icon: Shield },
  { label: "Avg. Latency", value: "142ms", change: "-2.1%", up: true, icon: Activity },
];

const fakeUsers = [
  { id: 1, name: "Alice Nakamura", email: "alice@haltman.io", role: "Admin", status: "active", lastSeen: "2 min ago" },
  { id: 2, name: "Bob Chen", email: "bob@haltman.io", role: "Editor", status: "active", lastSeen: "14 min ago" },
  { id: 3, name: "Clara Johansson", email: "clara@haltman.io", role: "Viewer", status: "inactive", lastSeen: "3 days ago" },
  { id: 4, name: "David Okafor", email: "david@haltman.io", role: "Admin", status: "active", lastSeen: "1 hr ago" },
  { id: 5, name: "Elena Petrova", email: "elena@haltman.io", role: "Editor", status: "suspended", lastSeen: "7 days ago" },
  { id: 6, name: "Frank Miller", email: "frank@haltman.io", role: "Viewer", status: "active", lastSeen: "28 min ago" },
];

const fakeLogs = [
  { ts: "2026-03-21 14:32:01", level: "info", service: "mail-relay", message: "Forwarded mail from alice@example.com → alice@haltman.io" },
  { ts: "2026-03-21 14:31:58", level: "warn", service: "rate-limiter", message: "Rate limit threshold at 80% for IP 192.168.1.42" },
  { ts: "2026-03-21 14:31:45", level: "error", service: "dns-resolver", message: "MX lookup timeout for domain broken-mx.test after 5000ms" },
  { ts: "2026-03-21 14:31:30", level: "info", service: "mail-relay", message: "Forwarded mail from noreply@github.com → bob@haltman.io" },
  { ts: "2026-03-21 14:31:12", level: "info", service: "auth", message: "Admin login successful: david@haltman.io from 10.0.0.5" },
  { ts: "2026-03-21 14:30:59", level: "warn", service: "spam-filter", message: "Suspicious headers detected — held for review (score: 7.2)" },
  { ts: "2026-03-21 14:30:41", level: "error", service: "smtp-out", message: "Connection refused by downstream relay smtp2.provider.net:587" },
  { ts: "2026-03-21 14:30:22", level: "info", service: "mail-relay", message: "Forwarded mail from alerts@monitoring.io → ops@haltman.io" },
  { ts: "2026-03-21 14:30:05", level: "info", service: "cert-manager", message: "TLS certificate renewal scheduled for *.haltman.io in 12 days" },
  { ts: "2026-03-21 14:29:48", level: "warn", service: "queue", message: "Delivery queue depth: 847 messages (threshold: 500)" },
];

const notifications = [
  { id: 1, title: "SSL certificate expiring", desc: "*.haltman.io expires in 12 days", time: "2h ago", type: "warning" as const },
  { id: 2, title: "New admin user added", desc: "david@haltman.io was granted admin access", time: "5h ago", type: "info" as const },
  { id: 3, title: "Spike in blocked mail", desc: "1,029 blocked attempts in the last 24 hours", time: "1d ago", type: "error" as const },
  { id: 4, title: "Domain verified", desc: "haltman.io passed SPF + DKIM + DMARC checks", time: "2d ago", type: "success" as const },
];

/* ────────────────────────────────────────────────────────────
   Section heading helper
   ──────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
      {children}
    </p>
  );
}

/* ────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────── */

export function PreviewContent() {
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [logFilter, setLogFilter] = React.useState("all");

  const filteredLogs = logFilter === "all"
    ? fakeLogs
    : fakeLogs.filter((l) => l.level === logFilter);

  return (
    <AdminPageLayout>
      <div className="space-y-10">
        {/* ═══════════════════════════════════════════════════════
           Page Header
           ═══════════════════════════════════════════════════════ */}
        <AdminPageHeader
          icon={<Eye className="h-4 w-4" />}
          title="Component Preview"
          description="Production-grade UI components with fictional data for visual testing."
        />

        {/* ═══════════════════════════════════════════════════════
           1 · Stats Cards
           ═══════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <SectionLabel>Metric Cards</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((card) => (
              <AdminDataCard key={card.label} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      {card.label}
                    </p>
                    <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                      {card.value}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                    <card.icon className="h-4 w-4 text-[var(--neu-green)]" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  {card.up ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
                  )}
                  <span
                    className={`text-[12px] font-medium ${card.up ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {card.change}
                  </span>
                  <span className="text-[12px] text-[var(--text-muted)]">vs last week</span>
                </div>
              </AdminDataCard>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
           2 · Table with Toolbar
           ═══════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <SectionLabel>Data Table</SectionLabel>

          <AdminToolbar>
            <AdminToolbarLeft>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  placeholder="Search users..."
                  className="h-8 w-[200px] pl-8 text-xs"
                  readOnly
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="h-8 w-[120px] text-xs">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </AdminToolbarLeft>
            <AdminToolbarRight>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Refresh">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" className="h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add User
              </Button>
            </AdminToolbarRight>
          </AdminToolbar>

          <AdminDataCard>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16 pl-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">ID</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</TableHead>
                  <TableHead className="w-24 text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</TableHead>
                  <TableHead className="w-28 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="w-28 text-xs font-medium uppercase tracking-wider text-muted-foreground">Last Seen</TableHead>
                  <TableHead className="w-20 pr-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fakeUsers.map((u) => (
                  <TableRow key={u.id} className="group transition-colors hover:bg-[var(--hover-state)]">
                    <TableCell className="pl-4 font-mono text-xs tabular-nums text-muted-foreground">{u.id}</TableCell>
                    <TableCell className="text-[13px] font-medium text-[var(--text-primary)]">{u.name}</TableCell>
                    <TableCell className="font-mono text-[13px] text-[var(--text-secondary)]">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="regular"
                        color={u.role === "Admin" ? "emerald" : u.role === "Editor" ? "sky" : "amber"}
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.status === "active" ? (
                        <Badge variant="fancy" color="emerald">active</Badge>
                      ) : u.status === "suspended" ? (
                        <Badge variant="fancy" color="red">suspended</Badge>
                      ) : (
                        <Badge variant="fancy">inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)]">{u.lastSeen}</TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditOpen(true)} title="Edit">
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)} title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* pagination */}
            <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.04)] px-4 py-3">
              <span className="text-xs tabular-nums text-muted-foreground">1–6 of 6</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </AdminDataCard>
        </div>

        {/* ═══════════════════════════════════════════════════════
           3 · Log Viewer
           ═══════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <SectionLabel>Log Viewer</SectionLabel>

          <AdminToolbar>
            <AdminToolbarLeft>
              <Select value={logFilter} onValueChange={setLogFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </AdminToolbarLeft>
            <AdminToolbarRight>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                <Filter className="h-3.5 w-3.5" />
                Filters
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Refresh">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </AdminToolbarRight>
          </AdminToolbar>

          <AdminDataCard className="overflow-x-auto">
            <div className="min-w-[700px] divide-y divide-[rgba(255,255,255,0.03)]">
              {/* header row */}
              <div className="grid grid-cols-[150px_70px_120px_1fr] gap-3 px-4 py-2.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Timestamp</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Level</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Service</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Message</span>
              </div>
              {/* log rows */}
              {filteredLogs.map((log, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[150px_70px_120px_1fr] gap-3 px-4 py-2 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                >
                  <span className="font-mono text-[11px] tabular-nums text-[var(--text-muted)]">{log.ts}</span>
                  <span>
                    {log.level === "info" && <Badge variant="fancy" color="sky">info</Badge>}
                    {log.level === "warn" && <Badge variant="fancy" color="amber">warn</Badge>}
                    {log.level === "error" && <Badge variant="fancy" color="red">error</Badge>}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">{log.service}</span>
                  <span className="truncate text-[12px] text-[var(--text-primary)]">{log.message}</span>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="flex items-center justify-center py-12 text-[13px] text-[var(--text-muted)]">
                  No logs matching selected filter.
                </div>
              )}
            </div>
          </AdminDataCard>
        </div>

        {/* ═══════════════════════════════════════════════════════
           4 · Notification Cards
           ═══════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <SectionLabel>Notification Cards</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            {notifications.map((n) => {
              const iconMap = {
                warning: <AlertTriangle className="h-4 w-4" />,
                info: <Info className="h-4 w-4" />,
                error: <Shield className="h-4 w-4" />,
                success: <Check className="h-4 w-4" />,
              };
              const colorMap = {
                warning: "border-amber-500/20 bg-amber-500/8 text-amber-400",
                info: "border-sky-500/20 bg-sky-500/8 text-sky-400",
                error: "border-red-500/20 bg-red-500/8 text-red-400",
                success: "border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)] text-[var(--neu-green)]",
              };
              return (
                <AdminDataCard key={n.id} className="p-4">
                  <div className="flex gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${colorMap[n.type]}`}>
                      {iconMap[n.type]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-medium text-[var(--text-primary)]">{n.title}</p>
                        <span className="shrink-0 text-[11px] text-[var(--text-muted)]">{n.time}</span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{n.desc}</p>
                    </div>
                  </div>
                </AdminDataCard>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
           5 · Tabbed Content
           ═══════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <SectionLabel>Tabbed Interface</SectionLabel>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">
                <Layers className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <TrendingUp className="h-3.5 w-3.5" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Server className="h-3.5 w-3.5" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <AdminDataCard className="mt-3 p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                      <Globe className="h-5 w-5 text-[var(--neu-green)]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[var(--text-primary)]">System Overview</p>
                      <p className="text-[12px] text-[var(--text-muted)]">All services are operational</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Uptime", value: "99.97%", sub: "Last 30 days" },
                      { label: "Throughput", value: "2.4k/hr", sub: "Current rate" },
                      { label: "Queue Depth", value: "847", sub: "Pending delivery" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl p-4"
                        style={{
                          background: "var(--neu-surface-lo)",
                          border: "1px solid rgba(255,255,255,0.03)",
                          boxShadow: "var(--neu-shadow-in)",
                        }}
                      >
                        <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">{s.label}</p>
                        <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{s.value}</p>
                        <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AdminDataCard>
            </TabsContent>

            <TabsContent value="analytics">
              <AdminDataCard className="mt-3 p-6">
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.08)]">
                    <TrendingUp className="h-5 w-5 text-[var(--neu-green)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Analytics Dashboard</p>
                  <p className="max-w-[320px] text-[13px] text-[var(--text-muted)]">
                    Charts and graphs would render here. Integrate your preferred charting library.
                  </p>
                </div>
              </AdminDataCard>
            </TabsContent>

            <TabsContent value="settings">
              <AdminDataCard className="mt-3 p-6">
                <div className="space-y-5">
                  <div>
                    <p className="text-[14px] font-medium text-[var(--text-primary)]">Delivery Settings</p>
                    <p className="text-[12px] text-[var(--text-muted)]">Configure how mail is processed and forwarded.</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Enable spam filtering", desc: "Automatically filter suspected spam before forwarding", checked: true },
                      { label: "DKIM signing", desc: "Sign outgoing forwarded mail with DKIM headers", checked: true },
                      { label: "Retry on failure", desc: "Automatically retry failed deliveries up to 3 times", checked: false },
                      { label: "Notifications", desc: "Send alerts when delivery errors exceed threshold", checked: true },
                    ].map((opt, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-[rgba(255,255,255,0.04)] px-4 py-3">
                        <div>
                          <p className="text-[13px] font-medium text-[var(--text-primary)]">{opt.label}</p>
                          <p className="text-[12px] text-[var(--text-muted)]">{opt.desc}</p>
                        </div>
                        <Switch defaultChecked={opt.checked} />
                      </div>
                    ))}
                  </div>
                </div>
              </AdminDataCard>
            </TabsContent>
          </Tabs>
        </div>

        {/* ═══════════════════════════════════════════════════════
           6 · Form Example
           ═══════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <SectionLabel>Form Example</SectionLabel>
          <AdminDataCard className="p-6">
            <div className="mx-auto max-w-lg space-y-6">
              <div>
                <p className="text-[14px] font-medium text-[var(--text-primary)]">Create Forwarding Rule</p>
                <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">Set up a new mail forwarding rule for your domain.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="p-source" className="text-[13px] text-[var(--text-secondary)]">Source Address</Label>
                  <Input id="p-source" placeholder="hello@haltman.io" className="h-9" readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="p-dest" className="text-[13px] text-[var(--text-secondary)]">Destination</Label>
                  <Input id="p-dest" placeholder="personal@gmail.com" className="h-9" readOnly />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[13px] text-[var(--text-secondary)]">Priority</Label>
                    <Select defaultValue="normal">
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] text-[var(--text-secondary)]">Domain</Label>
                    <Select defaultValue="haltman">
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="haltman">haltman.io</SelectItem>
                        <SelectItem value="example">example.com</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-[rgba(255,255,255,0.04)] px-4 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">Enable immediately</p>
                    <p className="text-[12px] text-[var(--text-muted)]">Start forwarding as soon as the rule is created</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" className="h-8">
                  Cancel
                </Button>
                <Button size="sm" className="h-8 gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Create Rule
                </Button>
              </div>
            </div>
          </AdminDataCard>
        </div>

        {/* ═══════════════════════════════════════════════════════
           7 · Activity Timeline
           ═══════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <SectionLabel>Activity Timeline</SectionLabel>
          <AdminDataCard className="p-5">
            <div className="space-y-0">
              {[
                { icon: User, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20", label: "Alice Nakamura updated domain settings", time: "14:32" },
                { icon: Mail, color: "text-[var(--neu-green)]", bg: "bg-[rgba(48,209,88,0.08)] border-[rgba(48,209,88,0.18)]", label: "Mail forwarded to bob@haltman.io", time: "14:31" },
                { icon: Shield, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Suspicious activity blocked from 192.168.1.42", time: "14:30" },
                { icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Rate limit warning triggered", time: "14:29" },
                { icon: Check, color: "text-[var(--neu-green)]", bg: "bg-[rgba(48,209,88,0.08)] border-[rgba(48,209,88,0.18)]", label: "DNS health check passed for all domains", time: "14:15" },
              ].map((event, i, arr) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${event.bg}`}>
                      <event.icon className={`h-3.5 w-3.5 ${event.color}`} />
                    </div>
                    {i < arr.length - 1 && (
                      <div className="my-1 w-px flex-1 bg-[rgba(255,255,255,0.06)]" />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className="text-[13px] text-[var(--text-primary)]">{event.label}</p>
                    <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Today at {event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminDataCard>
        </div>

        {/* ═══════════════════════════════════════════════════════
           8 · Context Menu
           ═══════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <SectionLabel>Context Menu</SectionLabel>
          <AdminDataCard className="p-0">
            <ContextMenu>
              <ContextMenuTrigger>
                <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[rgba(255,255,255,0.08)] p-8 transition-colors hover:border-[rgba(255,255,255,0.12)]">
                  <MousePointerClick className="h-6 w-6 text-[var(--text-muted)]" />
                  <p className="text-[13px] font-medium text-[var(--text-secondary)]">Right click here</p>
                  <p className="text-[12px] text-[var(--text-muted)]">Opens a context menu with multiple option types</p>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuLabel>Edit</ContextMenuLabel>
                <ContextMenuGroup>
                  <ContextMenuItem>
                    <Copy />
                    Copy
                    <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <Scissors />
                    Cut
                    <ContextMenuShortcut>⌘X</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <ClipboardCopy />
                    Paste
                    <ContextMenuShortcut>⌘V</ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuGroup>

                <ContextMenuSeparator />

                <ContextMenuLabel>View</ContextMenuLabel>
                <ContextMenuGroup>
                  <ContextMenuCheckboxItem checked>
                    Show Sidebar
                  </ContextMenuCheckboxItem>
                  <ContextMenuCheckboxItem checked>
                    Show Status Bar
                  </ContextMenuCheckboxItem>
                  <ContextMenuCheckboxItem>
                    Show Minimap
                  </ContextMenuCheckboxItem>
                  <ContextMenuCheckboxItem>
                    Word Wrap
                  </ContextMenuCheckboxItem>
                </ContextMenuGroup>

                <ContextMenuSeparator />

                <ContextMenuLabel>Zoom</ContextMenuLabel>
                <ContextMenuRadioGroup value="100">
                  <ContextMenuRadioItem value="75">75%</ContextMenuRadioItem>
                  <ContextMenuRadioItem value="100">100%</ContextMenuRadioItem>
                  <ContextMenuRadioItem value="125">125%</ContextMenuRadioItem>
                  <ContextMenuRadioItem value="150">150%</ContextMenuRadioItem>
                </ContextMenuRadioGroup>

                <ContextMenuSeparator />

                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <Share2 />
                    Share
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="w-48">
                    <ContextMenuItem>
                      <Mail />
                      Email
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <Link />
                      Copy Link
                      <ContextMenuShortcut>⌘L</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem>
                      <Code />
                      Embed Code
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <FolderOpen />
                    Open With
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="w-48">
                    <ContextMenuItem>
                      <Monitor />
                      Browser
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <Code />
                      Code Editor
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <FileText />
                      Text Editor
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem disabled>
                      <Globe />
                      Preview Server
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <Download />
                    Export As
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="w-48">
                    <ContextMenuItem>PDF Document</ContextMenuItem>
                    <ContextMenuItem>PNG Image</ContextMenuItem>
                    <ContextMenuItem>SVG Vector</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem>CSV Spreadsheet</ContextMenuItem>
                    <ContextMenuItem>JSON Data</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>

                <ContextMenuSeparator />

                <ContextMenuGroup>
                  <ContextMenuItem>
                    <Star />
                    Add to Favorites
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <BookmarkPlus />
                    Bookmark
                    <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <Printer />
                    Print
                    <ContextMenuShortcut>⌘P</ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuGroup>

                <ContextMenuSeparator />

                <ContextMenuGroup>
                  <ContextMenuItem disabled>
                    <RotateCcw />
                    Undo
                    <ContextMenuShortcut>⌘Z</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem disabled>
                    <RefreshCw />
                    Redo
                    <ContextMenuShortcut>⇧⌘Z</ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuGroup>

                <ContextMenuSeparator />

                <ContextMenuItem variant="destructive">
                  <Trash2 />
                  Delete
                  <ContextMenuShortcut>⌫</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </AdminDataCard>
        </div>

        {/* ═══════════════════════════════════════════════════════
           9 · Badges & Status Showcase
           ═══════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <SectionLabel>Badges &amp; Status</SectionLabel>
          <AdminDataCard className="p-5">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[12px] font-medium text-[var(--text-secondary)]">Regular</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="regular" color="emerald">Active</Badge>
                  <Badge variant="regular" color="red">Error</Badge>
                  <Badge variant="regular" color="amber">Warning</Badge>
                  <Badge variant="regular" color="sky">Info</Badge>
                  <Badge variant="regular" color="indigo">Processing</Badge>
                  <Badge variant="regular" color="orange">Queued</Badge>
                </div>
              </div>
              <div>
                <p className="mb-2 text-[12px] font-medium text-[var(--text-secondary)]">Outline</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" color="emerald">Active</Badge>
                  <Badge variant="outline" color="red">Error</Badge>
                  <Badge variant="outline" color="amber">Warning</Badge>
                  <Badge variant="outline" color="sky">Info</Badge>
                  <Badge variant="outline" color="indigo">Processing</Badge>
                  <Badge variant="outline" color="orange">Queued</Badge>
                </div>
              </div>
              <div>
                <p className="mb-2 text-[12px] font-medium text-[var(--text-secondary)]">Fancy</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="fancy" color="emerald">Active</Badge>
                  <Badge variant="fancy" color="red">Error</Badge>
                  <Badge variant="fancy" color="amber">Warning</Badge>
                  <Badge variant="fancy" color="sky">Info</Badge>
                  <Badge variant="fancy" color="indigo">Processing</Badge>
                  <Badge variant="fancy" color="orange">Queued</Badge>
                </div>
              </div>
            </div>
          </AdminDataCard>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
         Dialogs (triggered from table actions)
         ═══════════════════════════════════════════════════════ */}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setEditOpen(false); }}>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" defaultValue="Alice Nakamura" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" defaultValue="alice@haltman.io" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select defaultValue="admin">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.04)] px-4 py-3">
              <Switch defaultChecked id="edit-active" />
              <Label htmlFor="edit-active" className="cursor-pointer">Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-mono font-medium">alice@haltman.io</span> and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setDeleteOpen(false)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageLayout>
  );
}
