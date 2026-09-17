// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-03/components/app-sidebar.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; the sample data is Tallyworks Help's (same item count, sub-item
// counts and active sub-item), and the header's two labels name the help center.

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
  SidebarRail,
} from "@tyohnn/components/sidebar"
import { LogoGallery } from "@tyohnn/icons"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Getting started",
      url: "#",
      items: [
        {
          title: "Set up your company",
          url: "#",
        },
        {
          title: "Invite your team",
          url: "#",
        },
      ],
    },
    {
      title: "Help center",
      url: "#",
      items: [
        {
          title: "What's new",
          url: "#",
        },
        {
          title: "Overview",
          url: "#",
          isActive: true,
        },
        {
          title: "Invoices",
          url: "#",
        },
        {
          title: "Payments",
          url: "#",
        },
        {
          title: "Expenses",
          url: "#",
        },
        {
          title: "Bank feeds",
          url: "#",
        },
        {
          title: "Payroll",
          url: "#",
        },
        {
          title: "Taxes",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
        {
          title: "Integrations",
          url: "#",
        },
        {
          title: "Account & security",
          url: "#",
        },
        {
          title: "Mobile app",
          url: "#",
        },
      ],
    },
    {
      title: "Guides",
      url: "#",
      items: [
        {
          title: "Closing the month",
          url: "#",
        },
        {
          title: "Year-end checklist",
          url: "#",
        },
        {
          title: "Switching plans",
          url: "#",
        },
        {
          title: "Importing data",
          url: "#",
        },
        {
          title: "Multi-currency",
          url: "#",
        },
        {
          title: "Approvals",
          url: "#",
        },
      ],
    },
    {
      title: "Developers",
      url: "#",
      items: [
        {
          title: "API overview",
          url: "#",
        },
        {
          title: "Webhooks",
          url: "#",
        },
        {
          title: "OAuth apps",
          url: "#",
        },
        {
          title: "Rate limits",
          url: "#",
        },
        {
          title: "SDKs",
          url: "#",
        },
      ],
    },
    {
      title: "Community",
      url: "#",
      items: [
        {
          title: "Community forum",
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
                <span className="font-medium">Tallyworks Help</span>
                <span className="">Support center</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<a href={item.url} className="font-medium" />}
                >
                  {item.title}
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
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
      <SidebarRail />
    </Sidebar>
  )
}
