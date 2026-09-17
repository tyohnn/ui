// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-04/page.tsx, ported with tooling/preset/port-block.mjs
// (imports). The page shell — provider with --sidebar-width 19rem, floating sidebar, inset, header with trigger, separator
// and breadcrumb — is upstream's markup and classes with the roadmap's breadcrumb labels; the body is the board (./roadmap).
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
import { Separator } from "@tyohnn/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@tyohnn/components/sidebar"

import { NoMotion } from "../../coverage/frame"
import { Roadmap, ROADMAP_STYLE } from "./roadmap"

export function BlockRoadmap() {
  return (
    <div data-template="block-roadmap">
      <NoMotion />
      <style>{ROADMAP_STYLE}</style>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "19rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Roadmap</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Board</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <Roadmap />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
