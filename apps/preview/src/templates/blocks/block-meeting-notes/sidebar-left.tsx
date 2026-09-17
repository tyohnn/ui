// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-15/components/sidebar-left.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; nav-main, nav-secondary and nav-workspaces come from ../_shared. The sample data is
// the meeting notes' (Juniper Labs is fictional) with upstream's item counts, nesting, active item, badge and emoji.

"use client"

import * as React from "react"

import { NavFavorites } from "./nav-favorites"
import { NavMain } from "../_shared/nav-main-10-15"
import { NavSecondary } from "../_shared/nav-secondary-10-15"
import { NavWorkspaces } from "../_shared/nav-workspaces"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@tyohnn/components/sidebar"
import { Blocks, Calendar, Home, Inbox, LogoCommand, LogoWaveform, MessageCircleQuestion, Search, Settings, Sparkles, Trash } from "@tyohnn/icons"

// This is sample data.
const data = {
  teams: [
    {
      name: "Juniper Labs",
      logo: (
        <LogoCommand />
      ),
      plan: "Enterprise",
    },
    {
      name: "Juniper Studio",
      logo: (
        <LogoWaveform />
      ),
      plan: "Team",
    },
    {
      name: "Personal",
      logo: (
        <LogoCommand />
      ),
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Search",
      url: "#",
      icon: (
        <Search />
      ),
    },
    {
      title: "Ask AI",
      url: "#",
      icon: (
        <Sparkles />
      ),
    },
    {
      title: "Home",
      url: "#",
      icon: (
        <Home />
      ),
      isActive: true,
    },
    {
      title: "Inbox",
      url: "#",
      icon: (
        <Inbox />
      ),
      badge: "10",
    },
  ],
  navSecondary: [
    {
      title: "Calendar",
      url: "#",
      icon: (
        <Calendar />
      ),
    },
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings />
      ),
    },
    {
      title: "Templates",
      url: "#",
      icon: (
        <Blocks />
      ),
    },
    {
      title: "Trash",
      url: "#",
      icon: (
        <Trash />
      ),
    },
    {
      title: "Help",
      url: "#",
      icon: (
        <MessageCircleQuestion />
      ),
    },
  ],
  favorites: [
    {
      name: "Weekly Product Sync — Notes",
      url: "#",
      emoji: "📊",
    },
    {
      name: "Leadership 1:1 Agenda",
      url: "#",
      emoji: "🧭",
    },
    {
      name: "Mobile Release Train",
      url: "#",
      emoji: "📱",
    },
    {
      name: "Quarterly Planning Doc",
      url: "#",
      emoji: "🗺️",
    },
    {
      name: "Customer Advisory Board",
      url: "#",
      emoji: "🤝",
    },
    {
      name: "Sales & Product Handoff",
      url: "#",
      emoji: "💼",
    },
    {
      name: "Hiring Loop Debriefs",
      url: "#",
      emoji: "🧑‍💻",
    },
    {
      name: "Budget Review FY26",
      url: "#",
      emoji: "💸",
    },
    {
      name: "Design Crit Backlog",
      url: "#",
      emoji: "🎨",
    },
    {
      name: "Team Health Check",
      url: "#",
      emoji: "💚",
    },
  ],
  workspaces: [
    {
      name: "Meetings",
      emoji: "🗓️",
      pages: [
        {
          name: "Recurring Syncs",
          url: "#",
          emoji: "🔁",
        },
        {
          name: "One-on-ones",
          url: "#",
          emoji: "💬",
        },
        {
          name: "Retrospectives",
          url: "#",
          emoji: "🔍",
        },
      ],
    },
    {
      name: "Product",
      emoji: "📦",
      pages: [
        {
          name: "Roadmap Q1 2026",
          url: "#",
          emoji: "🛣️",
        },
        {
          name: "Feature Briefs",
          url: "#",
          emoji: "📝",
        },
        {
          name: "Launch Reviews",
          url: "#",
          emoji: "🚀",
        },
      ],
    },
    {
      name: "Research",
      emoji: "🎨",
      pages: [
        {
          name: "Interview Notes",
          url: "#",
          emoji: "🎙️",
        },
        {
          name: "Usability Studies",
          url: "#",
          emoji: "🧪",
        },
        {
          name: "Survey Results",
          url: "#",
          emoji: "📊",
        },
      ],
    },
    {
      name: "Operations",
      emoji: "⚙️",
      pages: [
        {
          name: "Vendor Contracts",
          url: "#",
          emoji: "📄",
        },
        {
          name: "On-call Handbook",
          url: "#",
          emoji: "🚨",
        },
        {
          name: "Team Calendar",
          url: "#",
          emoji: "🗓️",
        },
      ],
    },
    {
      name: "People",
      emoji: "🧑‍🤝‍🧑",
      pages: [
        {
          name: "Onboarding Plans",
          url: "#",
          emoji: "👋",
        },
        {
          name: "Career Ladders",
          url: "#",
          emoji: "🪜",
        },
        {
          name: "Offsite 2026",
          url: "#",
          emoji: "🏕️",
        },
      ],
    },
  ],
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={data.favorites} />
        <NavWorkspaces workspaces={data.workspaces} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
