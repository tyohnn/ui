// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-07/components/app-sidebar.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; the sample data is the playground's (same item counts, nesting and open state).

"use client"

import * as React from "react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@tyohnn/components/sidebar"
import { BookOpen, Bot, Frame, LogoCommand, LogoGallery, LogoWaveform, Map, PieChart, Settings, Terminal } from "@tyohnn/icons"

// This is sample data.
const data = {
  user: {
    name: "Mara Okafor",
    email: "mara@halcyon.dev",
    avatar: "",
  },
  teams: [
    {
      name: "Halcyon Labs",
      logo: (
        <LogoGallery />
      ),
      plan: "Enterprise",
    },
    {
      name: "Halcyon Research",
      logo: (
        <LogoWaveform />
      ),
      plan: "Startup",
    },
    {
      name: "Sandbox",
      logo: (
        <LogoCommand />
      ),
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: (
        <Terminal />
      ),
      isActive: true,
      items: [
        {
          title: "Chat",
          url: "#",
        },
        {
          title: "Compare",
          url: "#",
        },
        {
          title: "Saved prompts",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: (
        <Bot />
      ),
      items: [
        {
          title: "Aster 3 Pro",
          url: "#",
        },
        {
          title: "Aster 3",
          url: "#",
        },
        {
          title: "Vela Embed",
          url: "#",
        },
      ],
    },
    {
      title: "API docs",
      url: "#",
      icon: (
        <BookOpen />
      ),
      items: [
        {
          title: "Quickstart",
          url: "#",
        },
        {
          title: "Prompting guide",
          url: "#",
        },
        {
          title: "Tool use",
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
          title: "Keys",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Rate limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Support triage",
      url: "#",
      icon: (
        <Frame />
      ),
    },
    {
      name: "Contract review",
      url: "#",
      icon: (
        <PieChart />
      ),
    },
    {
      name: "Field notes",
      url: "#",
      icon: (
        <Map />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
