// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-10/components/nav-actions.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). Markup and classes are upstream's; the "edited" label is the document's fixed date. The popover opens on mount as upstream.

"use client"

import * as React from "react"

import { Button } from "@tyohnn/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tyohnn/components/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@tyohnn/components/sidebar"
import { ArrowUp, Bell, ChartLine, Copy, DeletedPages, Export, FileText, Link, LogoGallery, MoreActions, MoveTo, Settings, Star, Trash, Undo } from "@tyohnn/icons"

const data = [
  [
    {
      label: "Customize Page",
      icon: (
        <Settings />
      ),
    },
    {
      label: "Turn into wiki",
      icon: (
        <FileText />
      ),
    },
  ],
  [
    {
      label: "Copy Link",
      icon: (
        <Link />
      ),
    },
    {
      label: "Duplicate",
      icon: (
        <Copy />
      ),
    },
    {
      label: "Move to",
      icon: (
        <MoveTo />
      ),
    },
    {
      label: "Move to Trash",
      icon: (
        <Trash />
      ),
    },
  ],
  [
    {
      label: "Undo",
      icon: (
        <Undo />
      ),
    },
    {
      label: "View analytics",
      icon: (
        <ChartLine />
      ),
    },
    {
      label: "Version History",
      icon: (
        <LogoGallery />
      ),
    },
    {
      label: "Show delete pages",
      icon: (
        <DeletedPages />
      ),
    },
    {
      label: "Notifications",
      icon: (
        <Bell />
      ),
    },
  ],
  [
    {
      label: "Import",
      icon: (
        <ArrowUp />
      ),
    },
    {
      label: "Export",
      icon: (
        <Export />
      ),
    },
  ],
]
export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false)
  React.useEffect(() => {
    setIsOpen(true)
  }, [])
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden font-medium text-muted-foreground md:inline-block">
        Edited Jan 14
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <Star />
      </Button>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 data-open:bg-accent"
            />
          }
        >
          <MoreActions />
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {data.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton>
                            {item.icon} <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  )
}
