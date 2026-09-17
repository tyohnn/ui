// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-14/components/app-sidebar.tsx, ported with tooling/preset/port-block.mjs
// (imports). Markup and classes are upstream's; the table of contents is the changelog post's sections (same item count,
// sub-item counts and active sub-item), linked to the post's anchors, and the group label reads "On this page".

import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@tyohnn/components/sidebar"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Highlights",
      url: "#highlights",
      items: [
        {
          title: "Release summary",
          url: "#summary",
        },
        {
          title: "Upgrade notes",
          url: "#upgrade",
        },
      ],
    },
    {
      title: "New features",
      url: "#features",
      items: [
        {
          title: "Timeline view",
          url: "#timeline",
        },
        {
          title: "Automations",
          url: "#automations",
          isActive: true,
        },
        {
          title: "Saved filters",
          url: "#filters",
        },
        {
          title: "Bulk edit",
          url: "#bulk-edit",
        },
        {
          title: "Custom fields",
          url: "#custom-fields",
        },
        {
          title: "Guest access",
          url: "#guests",
        },
        {
          title: "Recurring tasks",
          url: "#recurring",
        },
        {
          title: "Command palette",
          url: "#palette",
        },
        {
          title: "Theme schedule",
          url: "#theme",
        },
        {
          title: "Chat integrations",
          url: "#chat",
        },
        {
          title: "CSV import",
          url: "#csv",
        },
        {
          title: "Audit log",
          url: "#audit",
        },
      ],
    },
    {
      title: "Improvements",
      url: "#improvements",
      items: [
        {
          title: "Editor speed",
          url: "#editor-speed",
        },
        {
          title: "Search ranking",
          url: "#search",
        },
        {
          title: "Notifications",
          url: "#notifications",
        },
        {
          title: "Mobile layout",
          url: "#mobile",
        },
        {
          title: "Accessibility",
          url: "#a11y",
        },
        {
          title: "API pagination",
          url: "#pagination",
        },
      ],
    },
    {
      title: "Fixes",
      url: "#fixes",
      items: [
        {
          title: "Sync conflicts",
          url: "#sync",
        },
        {
          title: "Time zones",
          url: "#time-zones",
        },
        {
          title: "Attachments",
          url: "#attachments",
        },
        {
          title: "Exports",
          url: "#exports",
        },
        {
          title: "Sign-in loops",
          url: "#sign-in",
        },
      ],
    },
    {
      title: "Migration",
      url: "#migration",
      items: [
        {
          title: "Webhook payload v2",
          url: "#webhooks",
        },
      ],
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>On this page</SidebarGroupLabel>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
