// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-04/components/app-sidebar.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; the sample data is the roadmap's (same item counts, nesting and active item).

"use client"

import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@tyohnn/components/sidebar"
import { LogoGallery } from "@tyohnn/icons"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Planning",
      url: "#",
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Goals",
          url: "#",
        },
      ],
    },
    {
      title: "Roadmap",
      url: "#",
      items: [
        {
          title: "Timeline",
          url: "#",
        },
        {
          title: "Board",
          url: "#",
          isActive: true,
        },
        {
          title: "Backlog",
          url: "#",
        },
        {
          title: "Releases",
          url: "#",
        },
        {
          title: "Milestones",
          url: "#",
        },
        {
          title: "Initiatives",
          url: "#",
        },
        {
          title: "Dependencies",
          url: "#",
        },
        {
          title: "Capacity",
          url: "#",
        },
        {
          title: "Feedback",
          url: "#",
        },
        {
          title: "Requests",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
        {
          title: "Archive",
          url: "#",
        },
      ],
    },
    {
      title: "Areas",
      url: "#",
      items: [
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Onboarding",
          url: "#",
        },
        {
          title: "Search",
          url: "#",
        },
        {
          title: "Mobile apps",
          url: "#",
        },
        {
          title: "Integrations",
          url: "#",
        },
        {
          title: "Platform",
          url: "#",
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      items: [
        {
          title: "Velocity",
          url: "#",
        },
        {
          title: "Cycle time",
          url: "#",
        },
        {
          title: "Burndown",
          url: "#",
        },
        {
          title: "Delivery",
          url: "#",
        },
        {
          title: "Forecast",
          url: "#",
        },
      ],
    },
    {
      title: "Workspace",
      url: "#",
      items: [
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LogoGallery className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Roadmap</span>
                <span className="">Q1 2026</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<a href={item.url} className="font-medium" />}
                >
                  {item.title}
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton
                          isActive={item.isActive}
                          render={<a href={item.url} />}
                        >
                          {item.title}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
