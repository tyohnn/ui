// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-16/components/app-sidebar.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; nav-projects and nav-secondary come from _shared. The sample data is the team admin's (same item counts,
// nesting, open item and icons).

"use client"

import * as React from "react"

import { NavMain } from "./nav-main"
import { NavProjects } from "../_shared/nav-projects-08-16"
import { NavSecondary } from "../_shared/nav-secondary-08-16"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@tyohnn/components/sidebar"
import { Blocks, Frame, LifeBuoy, LogoCommand, Map, PieChart, Send, Settings, ShieldCheck, Users } from "@tyohnn/icons"

const data = {
  user: {
    name: "Nadia Brooks",
    email: "nadia@quillstone.co",
    avatar: "",
  },
  navMain: [
    {
      title: "People",
      url: "#",
      icon: (
        <Users />
      ),
      isActive: true,
      items: [
        {
          title: "Members",
          url: "#",
        },
        {
          title: "Invitations",
          url: "#",
        },
        {
          title: "Roles",
          url: "#",
        },
      ],
    },
    {
      title: "Security",
      url: "#",
      icon: (
        <ShieldCheck />
      ),
      items: [
        {
          title: "Single sign-on",
          url: "#",
        },
        {
          title: "Audit log",
          url: "#",
        },
        {
          title: "Sessions",
          url: "#",
        },
      ],
    },
    {
      title: "Integrations",
      url: "#",
      icon: (
        <Blocks />
      ),
      items: [
        {
          title: "Directory sync",
          url: "#",
        },
        {
          title: "Webhooks",
          url: "#",
        },
        {
          title: "API keys",
          url: "#",
        },
        {
          title: "Apps",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings />
      ),
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Domains",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: (
        <LifeBuoy />
      ),
    },
    {
      title: "Feedback",
      url: "#",
      icon: (
        <Send />
      ),
    },
  ],
  projects: [
    {
      name: "Design team",
      url: "#",
      icon: (
        <Frame />
      ),
    },
    {
      name: "Growth",
      url: "#",
      icon: (
        <PieChart />
      ),
    },
    {
      name: "Field sales",
      url: "#",
      icon: (
        <Map />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LogoCommand className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Quillstone</span>
                <span className="truncate text-xs">Business</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
