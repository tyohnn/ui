// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-06/components/app-sidebar.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; the sample data is the analytics app's (same item counts, nesting and active item).

"use client"

import * as React from "react"

import { NavMain } from "./nav-main"
import { SidebarOptInForm } from "./sidebar-opt-in-form"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@tyohnn/components/sidebar"
import { LogoGallery } from "@tyohnn/icons"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Overview",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "#",
        },
        {
          title: "Realtime",
          url: "#",
        },
      ],
    },
    {
      title: "Acquisition",
      url: "#",
      items: [
        {
          title: "Channels",
          url: "#",
        },
        {
          title: "Traffic",
          url: "#",
          isActive: true,
        },
        {
          title: "Referrers",
          url: "#",
        },
        {
          title: "Campaigns",
          url: "#",
        },
        {
          title: "Search terms",
          url: "#",
        },
        {
          title: "Landing pages",
          url: "#",
        },
        {
          title: "Countries",
          url: "#",
        },
        {
          title: "Devices",
          url: "#",
        },
        {
          title: "Browsers",
          url: "#",
        },
        {
          title: "UTM builder",
          url: "#",
        },
        {
          title: "Cohorts",
          url: "#",
        },
        {
          title: "Retention",
          url: "#",
        },
      ],
    },
    {
      title: "Behavior",
      url: "#",
      items: [
        {
          title: "Pages",
          url: "#",
        },
        {
          title: "Events",
          url: "#",
        },
        {
          title: "Site search",
          url: "#",
        },
        {
          title: "Scroll depth",
          url: "#",
        },
        {
          title: "Outbound links",
          url: "#",
        },
        {
          title: "Downloads",
          url: "#",
        },
      ],
    },
    {
      title: "Conversions",
      url: "#",
      items: [
        {
          title: "Goals",
          url: "#",
        },
        {
          title: "Funnels",
          url: "#",
        },
        {
          title: "Revenue",
          url: "#",
        },
        {
          title: "Attribution",
          url: "#",
        },
        {
          title: "Experiments",
          url: "#",
        },
      ],
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LogoGallery className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Lumen Analytics</span>
                <span className="">fernhill.shop</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <div className="p-1">
          <SidebarOptInForm />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
