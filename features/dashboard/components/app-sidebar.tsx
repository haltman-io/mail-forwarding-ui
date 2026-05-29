"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AtSign,
  Ban,
  ChevronRight,
  Globe2,
  KeyRound,
  LockKeyhole,
  Mail,
  Radar,
  Shield,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/features/auth/hooks/use-auth"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"

/* ────────────────────────────────────────────────────────────
   Navigation data
   ──────────────────────────────────────────────────────────── */
const adminItems = [
  { name: "Domains", url: "/dashboard/admin/domains", icon: Globe2 },
  { name: "Aliases", url: "/dashboard/admin/aliases", icon: AtSign },
  { name: "Handles", url: "/dashboard/admin/handles", icon: Mail },
  { name: "Bans", url: "/dashboard/admin/bans", icon: Ban },
  { name: "API Tokens", url: "/dashboard/admin/api-tokens", icon: KeyRound },
  { name: "Users", url: "/dashboard/admin/users", icon: Users },
  { name: "DNS Requests", url: "/dashboard/admin/dns-requests", icon: Radar },
  { name: "My Password", url: "/dashboard/admin/password", icon: LockKeyhole },
]

/* ────────────────────────────────────────────────────────────
   Nav item — recessed track with raised active pill
   ──────────────────────────────────────────────────────────── */
function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string
  icon?: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] transition-all duration-200",
        isActive
          ? [
            "bg-[var(--glass-bg)] font-medium text-[var(--text-primary)]",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_2px_6px_rgba(0,0,0,0.3)]",
            "backdrop-blur-[12px]",
          ]
          : [
            "text-[var(--text-secondary)]",
            "hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-primary)]",
        ],
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--neu-green)] shadow-[0_0_8px_rgba(48,209,88,0.4)]" />
      )}

      {Icon && (
        <Icon
          className={cn(
            "h-[15px] w-[15px] shrink-0 transition-colors duration-200",
            isActive ? "text-[var(--neu-green)]" : "text-[var(--text-muted)]",
          )}
        />
      )}
      <span className="flex-1">{label}</span>
    </Link>
  )
}

/* ────────────────────────────────────────────────────────────
   Collapsible section (category-level)
   ──────────────────────────────────────────────────────────── */
function NavSection({
  label,
  defaultOpen = true,
  children,
}: {
  label: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-2 flex w-full items-center justify-between px-3"
      >
        <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
          {label}
        </span>
        <ChevronRight
          className={cn(
            "h-3 w-3 text-[var(--text-muted)] transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Sidebar
   ──────────────────────────────────────────────────────────── */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [hostLabel, setHostLabel] = React.useState("haltman.io")
  const { isMobile, setOpenMobile } = useSidebar()
  const { user } = useAuth()

  React.useEffect(() => {
    if (window.location.host) setHostLabel(window.location.host)
  }, [])

  function handleNav() {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar
      variant="sidebar"
      className={cn(
        // Transparent background — flush with the page, no floating effect
        "[&_[data-slot=sidebar-inner]]:!bg-transparent",
        "[&_[data-slot=sidebar-inner]]:!border-none",
        "[&_[data-slot=sidebar-inner]]:!shadow-none",
        // Only a subtle right edge separator
        "[&_[data-slot=sidebar-container]]:!border-r",
        "[&_[data-slot=sidebar-container]]:!border-[rgba(255,255,255,0.06)]",
        // Mobile sheet — needs a bg since it overlays
        "[&_[data-mobile=true]]:!bg-[var(--background-base)]",
        "[&_[data-mobile=true]]:!border-none",
      )}
      {...props}
    >
      {/* ══════════════════════════════════════════════════════
         Header — Logo + host
         ══════════════════════════════════════════════════════ */}
      <SidebarHeader className="p-5 pb-0">
        <Link
          href="/"
          onClick={handleNav}
          className="group flex items-center gap-3"
        >
          <div className="neu-tab-pill flex h-9 w-9 shrink-0 items-center justify-center !rounded-xl border border-[rgba(48,209,88,0.18)] !bg-[rgba(48,209,88,0.08)] transition-colors duration-200 group-hover:!bg-[rgba(48,209,88,0.12)]">
            <Shield className="h-4 w-4 text-[var(--neu-green)]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold tracking-tight text-[var(--text-primary)]">
              {hostLabel}
            </p>
            <p className="text-[11px] leading-4 text-[var(--text-muted)]">
              Admin Panel
            </p>
          </div>
        </Link>
      </SidebarHeader>

      {/* ══════════════════════════════════════════════════════
         Content
         ══════════════════════════════════════════════════════ */}
      <SidebarContent className="p-4 pt-5">
        {/* ── Administration section (admin only) ── */}
        {user?.is_admin && (
          <>
            <NavSection label="Administration">
              <div
                className="rounded-2xl p-1.5"
                style={{
                  background: "var(--neu-surface-lo)",
                  border: "1px solid rgba(255, 255, 255, 0.03)",
                  boxShadow: "var(--neu-shadow-in)",
                }}
              >
                <nav className="flex flex-col gap-0.5" onClick={handleNav}>
                  {adminItems.map((item) => {
                    const isActive =
                      pathname === item.url ||
                      (pathname?.startsWith(item.url + "/") ?? false)
                    return (
                      <NavItem
                        key={item.name}
                        href={item.url}
                        icon={item.icon}
                        label={item.name}
                        isActive={isActive}
                      />
                    )
                  })}
                </nav>
              </div>
            </NavSection>
          </>
        )}

      </SidebarContent>
    </Sidebar>
  )
}
