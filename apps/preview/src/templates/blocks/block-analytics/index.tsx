// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-06/page.tsx, ported with tooling/preset/port-block.mjs
// (imports). The page shell — provider, sidebar, inset, bordered header with trigger, separator and breadcrumb — is
// upstream's markup and classes with the analytics breadcrumb labels; the body is the traffic report (./analytics).
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

import { NO_MOTION } from "../../coverage/frame"
import { Analytics, ANALYTICS_STYLE } from "./analytics"

export function BlockAnalytics() {
  return (
    <div data-template="block-analytics">
      <style>{NO_MOTION}</style>
      <style>{ANALYTICS_STYLE}</style>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Acquisition</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Traffic</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <Analytics />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
