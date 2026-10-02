// shadcn 4.21.0 apps/v4/registry/bases/base/blocks/sidebar-12/page.tsx, ported with tooling/preset/port-block.mjs
// (imports, icons). The page shell — provider, sidebar, inset, sticky header with trigger, separator and breadcrumb —
// is upstream's markup and classes with the calendar's month; the body is the week view (./week-view).
// The root div carries data-template; it adds no box of its own to the layout.

import { AppSidebar } from "./app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@tyohnn/components/breadcrumb"
import { Separator } from "@tyohnn/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@tyohnn/components/sidebar"

import { NoMotion } from "../../coverage/frame"
import { WeekView } from "./week-view"

export function BlockCalendar() {
  return (
    <div data-template="block-calendar">
      <NoMotion />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>January 2026</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <WeekView />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
