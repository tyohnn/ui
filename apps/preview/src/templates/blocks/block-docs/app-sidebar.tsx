// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-01/components/app-sidebar.tsx, ported with tooling/preset/port-block.mjs
// (imports). Markup and classes are upstream's; search form and version switcher come from ../_shared. The sample data is
// the Fernway docs' (same group count, link counts and active link).

import * as React from "react"

import { SearchForm } from "../_shared/search-form-01-02-05"
import { VersionSwitcher } from "../_shared/version-switcher"
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

// This is sample data.
const data = {
  versions: ["2.4.0", "2.5.0-rc.1", "3.0.0-beta.2"],
  navMain: [
    {
      title: "Introduction",
      url: "#",
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Core concepts",
          url: "#",
        },
      ],
    },
    {
      title: "Getting started",
      url: "#",
      items: [
        {
          title: "Requirements",
          url: "#",
        },
        {
          title: "Installation",
          url: "#",
          isActive: true,
        },
        {
          title: "First workflow",
          url: "#",
        },
        {
          title: "Configuration",
          url: "#",
        },
        {
          title: "Environments",
          url: "#",
        },
        {
          title: "Secrets",
          url: "#",
        },
        {
          title: "Scheduling",
          url: "#",
        },
        {
          title: "Retries",
          url: "#",
        },
        {
          title: "Observability",
          url: "#",
        },
        {
          title: "Testing",
          url: "#",
        },
        {
          title: "Deploying",
          url: "#",
        },
        {
          title: "Upgrading",
          url: "#",
        },
      ],
    },
    {
      title: "API reference",
      url: "#",
      items: [
        {
          title: "Client",
          url: "#",
        },
        {
          title: "Workflows",
          url: "#",
        },
        {
          title: "Steps",
          url: "#",
        },
        {
          title: "fernway.config.ts",
          url: "#",
        },
        {
          title: "CLI",
          url: "#",
        },
        {
          title: "REST API",
          url: "#",
        },
      ],
    },
    {
      title: "Guides",
      url: "#",
      items: [
        {
          title: "Idempotency",
          url: "#",
        },
        {
          title: "Rate limiting",
          url: "#",
        },
        {
          title: "Webhooks",
          url: "#",
        },
        {
          title: "Monorepos",
          url: "#",
        },
        {
          title: "Migrating from cron",
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
          title="Fernway Docs"
        />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
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
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
