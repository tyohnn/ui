// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-10/components/app-sidebar.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; nav-main, nav-secondary and nav-workspaces come from ../_shared. The sample data is
// the editor's (Kestrel Works is fictional) with upstream's item counts, nesting, active item, badge and emoji.

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
      name: "Kestrel Works",
      logo: (
        <LogoCommand />
      ),
      plan: "Enterprise",
    },
    {
      name: "Kestrel Labs",
      logo: (
        <LogoWaveform />
      ),
      plan: "Team",
    },
    {
      name: "Side projects",
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
      name: "Checkout Redesign — Project Brief",
      url: "#",
      emoji: "📊",
    },
    {
      name: "Q1 Roadmap & Release Calendar",
      url: "#",
      emoji: "🗓️",
    },
    {
      name: "Design Critique Notes",
      url: "#",
      emoji: "🎨",
    },
    {
      name: "Onboarding Guide for New Hires",
      url: "#",
      emoji: "👋",
    },
    {
      name: "Incident Runbook & On-call Rota",
      url: "#",
      emoji: "🚨",
    },
    {
      name: "Customer Interview Library",
      url: "#",
      emoji: "🎙️",
    },
    {
      name: "Pricing Experiments Log",
      url: "#",
      emoji: "💸",
    },
    {
      name: "Brand Voice & Writing Style",
      url: "#",
      emoji: "✍️",
    },
    {
      name: "Competitive Landscape Review",
      url: "#",
      emoji: "🔭",
    },
    {
      name: "Weekly Team Rituals",
      url: "#",
      emoji: "🔁",
    },
  ],
  workspaces: [
    {
      name: "Product",
      emoji: "📦",
      pages: [
        {
          name: "Specs & Briefs",
          url: "#",
          emoji: "📝",
        },
        {
          name: "Research Repository",
          url: "#",
          emoji: "🔬",
        },
        {
          name: "Launch Checklists",
          url: "#",
          emoji: "🚀",
        },
      ],
    },
    {
      name: "Engineering",
      emoji: "🛠️",
      pages: [
        {
          name: "Architecture Decisions",
          url: "#",
          emoji: "🏛️",
        },
        {
          name: "Code Review Guidelines",
          url: "#",
          emoji: "👀",
        },
        {
          name: "Release Notes Archive",
          url: "#",
          emoji: "📣",
        },
      ],
    },
    {
      name: "Design",
      emoji: "🎨",
      pages: [
        {
          name: "Design System Changelog",
          url: "#",
          emoji: "🧩",
        },
        {
          name: "Illustration Library",
          url: "#",
          emoji: "🖌️",
        },
        {
          name: "Accessibility Audits",
          url: "#",
          emoji: "♿",
        },
      ],
    },
    {
      name: "Operations",
      emoji: "⚙️",
      pages: [
        {
          name: "Budget & Vendor Contracts",
          url: "#",
          emoji: "💼",
        },
        {
          name: "Hiring Plan & Interview Kits",
          url: "#",
          emoji: "🧑‍💼",
        },
        {
          name: "Offsite Planning",
          url: "#",
          emoji: "🏕️",
        },
      ],
    },
    {
      name: "Customer Success",
      emoji: "🤝",
      pages: [
        {
          name: "Account Health Reviews",
          url: "#",
          emoji: "📈",
        },
        {
          name: "Support Macros",
          url: "#",
          emoji: "💬",
        },
        {
          name: "Feedback Themes",
          url: "#",
          emoji: "🧭",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
