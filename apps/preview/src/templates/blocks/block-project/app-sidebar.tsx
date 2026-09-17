// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-08/components/app-sidebar.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; the sample data is the project tool's (same item counts, nesting and open state).

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
import { BookOpen, Frame, Kanban, LifeBuoy, LogoCommand, Map, PieChart, Send, Settings, SquareCheck } from "@tyohnn/icons"

const data = {
  user: {
    name: "Priya Raman",
    email: "priya@larkspur.studio",
    avatar: "",
  },
  navMain: [
    {
      title: "Projects",
      url: "#",
      icon: (
        <Kanban />
      ),
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Board",
          url: "#",
        },
        {
          title: "Timeline",
          url: "#",
        },
      ],
    },
    {
      title: "Tasks",
      url: "#",
      icon: (
        <SquareCheck />
      ),
      items: [
        {
          title: "My tasks",
          url: "#",
        },
        {
          title: "Assigned to team",
          url: "#",
        },
        {
          title: "Backlog",
          url: "#",
        },
      ],
    },
    {
      title: "Docs",
      url: "#",
      icon: (
        <BookOpen />
      ),
      items: [
        {
          title: "Briefs",
          url: "#",
        },
        {
          title: "Specs",
          url: "#",
        },
        {
          title: "Meeting notes",
          url: "#",
        },
        {
          title: "Changelog",
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
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Integrations",
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
      name: "Atlas app relaunch",
      url: "#",
      icon: (
        <Frame />
      ),
    },
    {
      name: "Q1 brand refresh",
      url: "#",
      icon: (
        <PieChart />
      ),
    },
    {
      name: "Field research",
      url: "#",
      icon: (
        <Map />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LogoCommand className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Larkspur Studio</span>
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
