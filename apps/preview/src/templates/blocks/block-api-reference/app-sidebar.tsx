// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-02/components/app-sidebar.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; search form and version switcher come from ../_shared. The sample data is
// the Ledgerline API reference's (same section count, link counts, open sections and active link).

"use client"

import * as React from "react"

import { SearchForm } from "../_shared/search-form-01-02-05"
import { VersionSwitcher } from "../_shared/version-switcher"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@tyohnn/components/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@tyohnn/components/sidebar"
import { ChevronRight } from "@tyohnn/icons"

// This is sample data.
const data = {
  versions: ["3.2.0", "3.1.4", "4.0.0-beta.1"],
  navMain: [
    {
      title: "Introduction",
      url: "#",
      items: [
        {
          title: "Authentication",
          url: "#",
        },
        {
          title: "Errors",
          url: "#",
        },
      ],
    },
    {
      title: "Payments",
      url: "#",
      items: [
        {
          title: "List payments",
          url: "#",
        },
        {
          title: "Create a payment",
          url: "#",
          isActive: true,
        },
        {
          title: "Retrieve a payment",
          url: "#",
        },
        {
          title: "Update a payment",
          url: "#",
        },
        {
          title: "Capture a payment",
          url: "#",
        },
        {
          title: "Cancel a payment",
          url: "#",
        },
        {
          title: "Refund a payment",
          url: "#",
        },
        {
          title: "List refunds",
          url: "#",
        },
        {
          title: "Payment methods",
          url: "#",
        },
        {
          title: "Payment links",
          url: "#",
        },
        {
          title: "Disputes",
          url: "#",
        },
        {
          title: "Payouts",
          url: "#",
        },
      ],
    },
    {
      title: "Customers",
      url: "#",
      items: [
        {
          title: "List customers",
          url: "#",
        },
        {
          title: "Create a customer",
          url: "#",
        },
        {
          title: "Retrieve a customer",
          url: "#",
        },
        {
          title: "Update a customer",
          url: "#",
        },
        {
          title: "Delete a customer",
          url: "#",
        },
        {
          title: "Search customers",
          url: "#",
        },
      ],
    },
    {
      title: "Webhooks",
      url: "#",
      items: [
        {
          title: "Event types",
          url: "#",
        },
        {
          title: "Endpoints",
          url: "#",
        },
        {
          title: "Signatures",
          url: "#",
        },
        {
          title: "Retries",
          url: "#",
        },
        {
          title: "Testing locally",
          url: "#",
        },
      ],
    },
    {
      title: "Resources",
      url: "#",
      items: [
        {
          title: "SDKs and libraries",
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
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
          title="Ledgerline API"
        />
        <SearchForm placeholder="Search endpoints..." />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                render={<CollapsibleTrigger />}
              >
                {item.title}{" "}
                <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={item.isActive}
                          render={<a href={item.url} />}
                        >
                          {item.title}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
