// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-08/page.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). The page shell — provider, inset sidebar, SidebarInset, header with trigger, separator and breadcrumb —
// is upstream's markup and classes with the project tool's breadcrumb labels; the body is the overview (./overview).
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
import { Overview, OVERVIEW_STYLE } from "./overview"

export function BlockProject() {
  return (
    <div data-template="block-project">
      <NoMotion />
      <style>{OVERVIEW_STYLE}</style>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Projects
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Atlas app relaunch</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <Overview />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
