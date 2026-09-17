// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-13/components/settings-dialog.tsx, ported with
// tooling/preset/port-block.mjs (imports, icons). Markup and classes are upstream's. Deliberate changes: the first and
// fifth nav entries swap labels and icons, so the active entry (fifth, as upstream) is "Notifications"; the trigger
// reads "Settings"; the scrolling body holds the notification settings (./notifications) instead of placeholder boxes.
// The dialog opens on load as upstream (`useState(true)`); the template root turns motion off.

"use client"

import * as React from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@tyohnn/components/breadcrumb"
import { Button } from "@tyohnn/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@tyohnn/components/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@tyohnn/components/sidebar"
import { Bell, Check, Globe, Home, Keyboard, Link, Lock, Menu, MessageCircle, Paintbrush, SettingsAdvanced, Video } from "@tyohnn/icons"

import { NotificationSettings } from "./notifications"

const data = {
  nav: [
    {
      name: "Messages & media",
      icon: (
        <MessageCircle />
      ),
    },
    {
      name: "Navigation",
      icon: (
        <Menu />
      ),
    },
    {
      name: "Home",
      icon: (
        <Home />
      ),
    },
    {
      name: "Appearance",
      icon: (
        <Paintbrush />
      ),
    },
    {
      name: "Notifications",
      icon: (
        <Bell />
      ),
    },
    {
      name: "Language & region",
      icon: (
        <Globe />
      ),
    },
    {
      name: "Accessibility",
      icon: (
        <Keyboard />
      ),
    },
    {
      name: "Mark as read",
      icon: (
        <Check />
      ),
    },
    {
      name: "Audio & video",
      icon: (
        <Video />
      ),
    },
    {
      name: "Connected accounts",
      icon: (
        <Link />
      ),
    },
    {
      name: "Privacy & visibility",
      icon: (
        <Lock />
      ),
    },
    {
      name: "Advanced",
      icon: (
        <SettingsAdvanced />
      ),
    },
  ],
}

export function SettingsDialog() {
  const [open, setOpen] = React.useState(true)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>Settings</DialogTrigger>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          isActive={item.name === "Notifications"}
                          render={<a href="#" />}
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Notifications</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              <NotificationSettings />
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
