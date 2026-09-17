// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-11/components/app-sidebar.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; the change list and tree are the pull request's repository with
// upstream's shape (same depth, item counts and badges). The open folders and the active file are matched by the new
// names ("webhooks" and "retry" open, "backoff.ts" active), in the same positions as upstream's "components", "ui" and "button.tsx".

"use client"

import * as React from "react"

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
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@tyohnn/components/sidebar"
import { ChevronRight, File, Folder } from "@tyohnn/icons"

// This is sample data.
const data = {
  changes: [
    {
      file: "webhooks/retry/backoff.ts",
      state: "M",
    },
    {
      file: "webhooks/retry/policy.ts",
      state: "U",
    },
    {
      file: "webhooks/handler.ts",
      state: "M",
    },
  ],
  tree: [
    [
      "server",
      [
        "routes",
        ["invoices", ["retry.ts"]],
        "index.ts",
        "health.ts",
        ["jobs", ["sweep.ts"]],
      ],
    ],
    [
      "webhooks",
      ["retry", "backoff.ts", "policy.ts"],
      "handler.ts",
      "signature.ts",
    ],
    ["lib", ["logger.ts"]],
    ["tests", "backoff.test.ts", "handler.test.ts"],
    ".editorconfig",
    ".gitignore",
    "tsconfig.json",
    "vitest.config.ts",
    "package.json",
    "CHANGELOG.md",
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Changes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.changes.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton>
                    <File />
                    {item.file}
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{item.state}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.tree.map((item, index) => (
                <Tree key={index} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
type TreeItem = string | TreeItem[]
function Tree({ item }: { item: TreeItem }) {
  const [name, ...items] = Array.isArray(item) ? item : [item]
  if (!items.length) {
    return (
      <SidebarMenuButton
        isActive={name === "backoff.ts"}
        className="data-[active=true]:bg-transparent"
      >
        <File />
        {name}
      </SidebarMenuButton>
    )
  }
  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={name === "webhooks" || name === "retry"}
      >
        <SidebarMenuButton render={<CollapsibleTrigger />}>
          <ChevronRight className="transition-transform" />
          <Folder />
          {name}
        </SidebarMenuButton>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree key={index} item={subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}
