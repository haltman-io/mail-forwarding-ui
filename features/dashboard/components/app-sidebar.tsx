"use client"

import * as React from "react"
import {
  AtSign,
  Ban,
  Command,
  Globe2,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  Mail,
  Send,
  Users,
} from "lucide-react"

import { useAdminAuth } from "@/features/dashboard/hooks/use-admin-auth"
import { NavAdministration } from "@/features/dashboard/components/nav-administration"
import { NavSecondary } from "@/features/dashboard/components/nav-secondary"
import { NavUser } from "@/features/dashboard/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
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
  const { admin, logout } = useAdminAuth()

  React.useEffect(() => {
    if (window.location.host) setHostLabel(window.location.host)
  }, [])

  const user = React.useMemo(() => ({
    name: admin?.email?.split("@")[0] ?? "Admin",
    email: admin?.email ?? "",
    avatar: "",
  }), [admin])

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
        <NavAdministration items={data.administration} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onLogout={() => logout("Logged out.")} />
      </SidebarFooter>
    </Sidebar>
  )
}
