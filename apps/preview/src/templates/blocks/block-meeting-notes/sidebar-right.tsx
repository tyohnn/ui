// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-15/components/sidebar-right.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; the date picker comes from ../_shared (fixed to 2026-01-14). The sample data is the
// meeting notes' with upstream's group and item counts.

"use client"

import * as React from "react"

import { Calendars } from "./calendars"
import { DatePicker } from "../_shared/date-picker"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@tyohnn/components/sidebar"
import { Plus } from "@tyohnn/icons"

// This is sample data.
const data = {
  user: {
    name: "Maya Brennan",
    email: "maya@juniperlabs.io",
    avatar: "",
  },
  calendars: [
    {
      name: "My calendars",
      items: ["Work", "Personal", "Team PTO"],
    },
    {
      name: "Favorites",
      items: ["Product syncs", "Holidays"],
    },
    {
      name: "Other",
      items: ["Launches", "Interviews", "Deadlines"],
    },
  ],
}

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <DatePicker />
        <SidebarSeparator className="mx-0" />
        <Calendars calendars={data.calendars} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus />
              <span>New Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
