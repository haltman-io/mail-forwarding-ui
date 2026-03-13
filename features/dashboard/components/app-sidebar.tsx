"use client"

import * as React from "react"
import {
  AtSign,
  Ban,
  Clock,
  Command,
  Globe2,
  KeyRound,
  LockKeyhole,
  Mail,
  Send,
  Users,
} from "lucide-react"

import { useAuth } from "@/features/auth/hooks/use-auth"
import { NavAdministration } from "@/features/dashboard/components/nav-administration"
import { NavSecondary } from "@/features/dashboard/components/nav-secondary"
import { NavUser } from "@/features/dashboard/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navSecondary: [
    {
      title: "Feedback",
      url: "https://t.me/thcorg/",
      icon: Send,
    },
  ],
  administration: [
    {
      name: "Domains",
      url: "/dashboard/domains",
      icon: Globe2,
    },
    {
      name: "Aliases",
      url: "/dashboard/aliases",
      icon: AtSign,
    },
    {
      name: "Handles",
      url: "/dashboard/handles",
      icon: Mail,
    },
    {
      name: "Bans",
      url: "/dashboard/bans",
      icon: Ban,
    },
    {
      name: "API Tokens",
      url: "/dashboard/api-tokens",
      icon: KeyRound,
    },
    {
      name: "Admin Users",
      url: "/dashboard/users",
      icon: Users,
    },
    {
      name: "My Password",
      url: "/dashboard/password",
      icon: LockKeyhole,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [hostLabel, setHostLabel] = React.useState("haltman.io")
  const { user, logout } = useAuth()

  React.useEffect(() => {
    if (window.location.host) setHostLabel(window.location.host)
  }, [])

  const isAdmin = user?.is_admin === true

  const navUser = React.useMemo(() => ({
    name: user?.email?.split("@")[0] ?? "User",
    email: user?.email ?? "",
    avatar: "",
  }), [user])

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{hostLabel}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isAdmin && <NavAdministration items={data.administration} />}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/dashboard">
                  <Clock />
                  <span>Coming Soon</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} onLogout={() => logout("Logged out.")} />
      </SidebarFooter>
    </Sidebar>
  )
}
