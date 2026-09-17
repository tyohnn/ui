// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-14/page.tsx, ported with tooling/preset/port-block.mjs
// (imports). The page shell — provider, inset, header with breadcrumb and the right-hand trigger, and the right sidebar —
// is upstream's markup and classes with the changelog's breadcrumb labels; the body is the release post (./changelog-post).
// The root div carries data-template and the template's styles; it adds no box of its own to the layout.

import { AppSidebar } from "./app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@tyohnn/components/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@tyohnn/components/sidebar"

import { NO_MOTION } from "../../coverage/frame"
import { CHANGELOG_STYLE, ChangelogPost } from "./changelog-post"

export function BlockChangelog() {
  return (
    <div data-template="block-changelog">
      <style>{NO_MOTION}</style>
      <style>{CHANGELOG_STYLE}</style>
      <SidebarProvider>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Changelog</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Orbitly 4.0</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <SidebarTrigger className="-mr-1 ml-auto rotate-180" />
          </header>
          <ChangelogPost />
        </SidebarInset>
        <AppSidebar side="right" />
      </SidebarProvider>
    </div>
  )
}
