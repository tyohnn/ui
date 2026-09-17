// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-05/components/app-sidebar.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; the search form is _shared with the store's placeholder; the sample data is the
// store admin's (same item counts, nesting, open section and active item).

"use client"

import * as React from "react"

import { SearchForm } from "../_shared/search-form-01-02-05"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@tyohnn/components/collapsible"
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
import { LogoGallery, Minus, Plus } from "@tyohnn/icons"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Store",
      url: "#",
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Live view",
          url: "#",
        },
      ],
    },
    {
      title: "Sales",
      url: "#",
      items: [
        {
          title: "Drafts",
          url: "#",
        },
        {
          title: "Orders",
          url: "#",
          isActive: true,
        },
        {
          title: "Returns",
          url: "#",
        },
        {
          title: "Abandoned carts",
          url: "#",
        },
        {
          title: "Invoices",
          url: "#",
        },
        {
          title: "Payouts",
          url: "#",
        },
        {
          title: "Disputes",
          url: "#",
        },
        {
          title: "Shipping labels",
          url: "#",
        },
        {
          title: "Gift cards",
          url: "#",
        },
        {
          title: "Discounts",
          url: "#",
        },
        {
          title: "Subscriptions",
          url: "#",
        },
        {
          title: "Taxes",
          url: "#",
        },
      ],
    },
    {
      title: "Catalog",
      url: "#",
      items: [
        {
          title: "Products",
          url: "#",
        },
        {
          title: "Collections",
          url: "#",
        },
        {
          title: "Inventory",
          url: "#",
        },
        {
          title: "Price lists",
          url: "#",
        },
        {
          title: "Suppliers",
          url: "#",
        },
        {
          title: "Reviews",
          url: "#",
        },
      ],
    },
    {
      title: "Customers",
      url: "#",
      items: [
        {
          title: "All customers",
          url: "#",
        },
        {
          title: "Segments",
          url: "#",
        },
        {
          title: "Loyalty",
          url: "#",
        },
        {
          title: "Messages",
          url: "#",
        },
        {
          title: "Support",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      items: [
        {
          title: "General",
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
                <span className="font-medium">Harbor Goods</span>
                <span className="">Store admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm placeholder="Search orders..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item, index) => (
              <Collapsible
                key={item.title}
                defaultOpen={index === 1}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <SidebarMenuButton render={<CollapsibleTrigger />}>
                    {item.title}{" "}
                    <Plus className="ml-auto group-aria-expanded/menu-button:hidden" />
                    <Minus className="ml-auto hidden group-aria-expanded/menu-button:block" />
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <CollapsibleContent>
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
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
